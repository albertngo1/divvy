## Overview

Bot Special is a solo-run crawler plus a public web index that answers one question for any URL: *does this site show AI crawlers something different than it shows you?* For each page it stores a browser-view render, a bot-view render, and a structural diff, scored 0–100 on a "divergence" scale. Built for journalists, researchers, and anyone who wants receipts when a publisher starts serving bots a parallel edition.

## Problem

Publishers have quietly discovered they can detect `GPTBot`/`ClaudeBot`/`PerplexityBot` by user-agent and IP range, and serve them a stripped, ad-injected, or subtly reworded version of an article. This is cloaking — the thing Google spent 20 years punishing — except now the audience being manipulated is the training corpus and the retrieval layer that millions of people read *through*. Nobody is systematically measuring it, and each instance surfaces only as a one-off blog post.

## How it works

1. Seed list: top 5k domains from Tranco plus every domain linked from HN/Lobsters front pages in the last 90 days.
2. For each URL, fetch N variants in a tight time window (<10s apart, same egress IP): plain `curl` Chrome UA, headless Chromium with JS, `GPTBot` UA, `ClaudeBot` UA, `Googlebot` UA, and a control UA that's a nonsense string.
3. Normalize each response: readability extraction to article text, plus a DOM skeleton (tag path + class fingerprint, text stripped).
4. Diff variants pairwise. Emit signals: paragraph count delta, Jaccard on sentence shingles, injected `<script>`/ad-slot delta, paywall-marker presence, and a semantic delta from embedding both extractions.
5. Score, store, publish. A public page per domain with a side-by-side and a permalinked evidence blob.

## Technical approach

Python + `httpx` for the cheap fetches, Playwright for the JS-rendered control. Extraction via `trafilatura`. Structural fingerprint = SHA1 over the ordered list of `(tagName, sorted class tokens, depth)` with text removed — catches template swaps that text diffing misses. Sentence shingling with 5-gram MinHash for cheap near-dup, then embeddings (`text-embedding` or local `bge-small`) only on pages that pass a cheap-diff threshold, to keep cost sane. Storage: Postgres, one row per `(url, variant, crawl_id)`, raw bodies gzipped to S3-compatible object storage. Frontend: static site generated nightly.

The genuinely hard part is **false positives**. A/B tests, personalization, geo-routing, rotating ad slots, CDN cache variance, and paywall meters all produce diffs that look like cloaking. The mitigation is the nonsense-UA control plus repeated sampling: real cloaking is *deterministic and UA-keyed*, noise is not. Only flag a domain when the bot-vs-browser diff reproduces across ≥3 crawls while the control-vs-browser diff stays near zero. That control channel is the whole trick.

## v1 scope

- 200 domains, one URL each, hand-picked news + docs sites
- Three variants only: Chrome, GPTBot, nonsense-UA control
- Text-only diff (Jaccard on sentences), no embeddings
- One static HTML leaderboard, no per-domain pages
- Crawl runs by hand, not on a schedule

## Out of scope

IP-range spoofing to defeat reverse-DNS bot verification. Login-walled content. Legal characterization of any site's behavior — publish the diff, not a verdict.

## Risks & unknowns

Sites may block the crawler once it's known. Serving screenshots of others' content raises copyright questions — store text extracts and diffs, not full renders. Bot-verification via reverse DNS means honest UA spoofing gets you the *browser* page from careful sites, undercounting cloaking.

## Done means

Given a URL, the tool outputs a reproducible verdict with three sampled crawls attached, and the leaderboard correctly flags at least one site that a human confirms is serving bots different content — with the control channel showing near-zero drift on that same site.
