## Overview
An ambient screensaver / desktop toy that renders your personal link collection — browser bookmarks, an Obsidian vault, a blog's outbound links — as a slow-growing tree whose leaves track the actual health of each URL. For people with a decade of accumulated bookmarks and notes who suspect, correctly, that a third of them are gone.

## Problem
Link checkers exist and nobody runs them, because the output is a spreadsheet of shame with no reward loop. Worse, every checker only tests for a 404. The nastier failure is silent: the domain lapsed, someone bought it, and the URL now returns a cheerful 200 pointing at a parked page, a casino, or SEO slop. Your note still links to it. Your blog post still cites it. It looks fine forever.

## How it works
Import once (Chrome/Firefox bookmark HTML, a vault directory, or an RSS/sitemap). Each URL becomes a leaf, positioned on a branch by domain and by the date you saved it. A background worker checks a slice of the collection each day at a polite rate. Leaf states: **green** (200, content matches what it looked like when you saved it), **yellowing** (slow, redirected, or drifting), **fallen** (4xx/5xx/NXDOMAIN — it detaches and settles into litter at the base, with the nearest Wayback snapshot preserved as its fossil), and **wrong colour** (200 but the page is now a different site — rendered as an unnervingly bright leaf with a bug on it). The screensaver just breathes: wind, drift, occasional fall. Clicking a fallen leaf opens the archived version. That is the whole interaction.

## Technical approach
Electron or a macOS `.saver` wrapping a canvas/WebGL scene; a small Rust or Node daemon does the crawling. Checks are conditional GETs honouring `robots.txt`, with per-host concurrency 1 and exponential backoff; state in SQLite (`url, first_seen, last_check, status_history, content_hash, wayback_snapshot`). Drift detection is the interesting bit: fetch the current page, extract main content with Readability, compute a SimHash of shingles **and** a MiniLM embedding; compare against the nearest Wayback snapshot (`archive.org/wayback/available?url=…&timestamp=<save date>`) processed identically. Large SimHash distance plus low embedding cosine plus a title-token overlap near zero = hijack, not a redesign. Also flag the tells: expiry-date jump via RDAP, NS moved to a parking provider, page word count under 200 with an above-fold ad block. Hard part is the false-positive rate — sites legitimately redesign — so tune thresholds against a hand-labelled set of 200 URLs before trusting the bug leaves.

## v1 scope
- Chrome bookmark HTML import only
- 2D canvas tree, no wind physics, three states: green / fallen / drifted
- SQLite + a Node crawler, 200 URLs/day cap
- Click a fallen leaf → open Wayback

## Out of scope
Multi-device sync, bulk repair/rewrite of your notes, mobile, seasons other than autumn.

## Risks & unknowns
Drift detection false-positives could turn the tree into a lie; Wayback rate limits; many bookmarks are behind logins and will read as dead when they aren't.

## Done means
Import 1,000 real bookmarks, let it run a week, and it correctly classifies a seeded set of 20 known-dead and 10 known-hijacked URLs with under 3 false positives — and the screensaver runs for an hour at under 5% CPU without a hitch.
