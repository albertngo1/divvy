## Overview
`still-resolves` is a CLI that treats your site's URL history as an archaeological record. It reconstructs the set of URIs your domain served over its lifetime from public web archives, checks which ones are now dead, proposes 301 targets by matching archived content to your current pages, emits real redirect config, and installs a CI guard so the set of promises only ever grows. For anyone who has migrated a blog, swapped a CMS, or shipped a docs restructure and quietly orphaned a decade of inbound links.

## Problem
"Cool URIs don't change" is 28 years old and universally violated, mostly by accident: a static-site generator changes its slug format, a docs tool moves `/v2/foo` to `/docs/foo`, a rewrite drops `.html`. Standard link checkers only crawl what you currently link to, so they are structurally blind to exactly the URLs you broke. The evidence of what you used to serve lives in the Internet Archive, and nobody reads it.

## How it works
Four phases. **Excavate:** pull the historical URL set for the domain. **Triage:** request each historical URI against production, classify 200 / 301-chain-ok / 404 / soft-404. **Match:** for each dead URI, fetch its last good archived snapshot, extract title and body, and score it against every page in the current sitemap; propose a target above a confidence threshold, or drop it into a review queue. **Emit:** write `nginx` map / `_redirects` / `vercel.json` / `netlify.toml`, plus `.still-resolves.lock` — a frozen list of URIs that must never 404 again — and a `still-resolves check` command for CI.

## Technical approach
Excavation: Wayback CDX API — `web.archive.org/cdx/search/cdx?url=example.com/*&output=json&fl=original,timestamp,statuscode,digest&collapse=urlkey&filter=statuscode:200` — supplemented by the Common Crawl columnar index for the same host, and optionally your own access logs (parse `4xx` lines with a non-empty Referer; those are live, real demand). Snapshot bodies come from `web.archive.org/web/<timestamp>id_/<url>` (the `id_` suffix gives unmodified original bytes, no Archive toolbar).

Matching in v1 is deliberately cheap: normalized title exact-match, then last-path-segment slug similarity (Jaro-Winkler), then BM25 over body text via SQLite FTS5, combined with fixed weights; a URI is auto-mapped only if the top candidate beats the runner-up by a margin. v2 swaps in MiniLM embeddings through onnxruntime, and greedy top-1 becomes a Hungarian assignment so two dead URIs don't fight over one target.

The genuinely hard parts are two kinds of garbage. **Soft-404s:** a site that returns 200 with a "not found" body — detected by hashing the response for a deliberately nonsense URL and flagging any page whose shingle similarity to it exceeds ~0.9. **Archive pollution:** infinite URL spaces (calendar pages, session IDs, tracking params) and snapshots from periods when the domain was parked or owned by someone else — handled with urlkey collapsing, a param allowlist, and a required `--owned-since YYYY-MM` window.

Stack: Go, single static binary, SQLite for the dig site so runs are resumable.

## v1 scope
- One domain, Wayback CDX only
- Triage + title/slug matching, no embeddings
- Emit nginx map file and the lockfile
- `still-resolves check` exits non-zero on any lockfile URI returning 404
- Text review queue: a TSV you edit and re-feed

## Out of scope
Multi-domain, hosted SaaS, automatic PR opening, sitemap generation, SEO scoring theater.

## Risks & unknowns
CDX rate limits and multi-minute queries on large hosts; needs backoff and resumability from the first run. Very old sites can surface 100k+ URIs, most of them junk — the review queue must not become the product. For sites that were never archived deeply, the dig comes up empty and the tool has nothing to say.

## Done means
Run it against a real migrated blog, and it finds at least one dead URL that a conventional link checker cannot see, proposes the correct live target, and the generated nginx map makes that URL 301 to it on the next deploy — with CI failing if it ever breaks again.
