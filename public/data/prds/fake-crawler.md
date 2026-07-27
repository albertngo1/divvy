## Overview

**Fake Crawler** is a single-binary tool you point at an nginx/Caddy access log. It extracts every request claiming a crawler identity in its User-Agent, verifies each claim properly, and renders a static explorable page: who's real, who's lying, where the liars come from, and — the interesting part — a heatmap of *which URL paths* the fakes fixate on versus the genuine bots.

For anyone self-hosting anything public who has never actually looked at who's knocking.

## Problem

User-Agent is a self-reported string, so "Googlebot" in your logs means nothing. Everyone knows this abstractly; almost nobody checks. The result is that traffic dashboards silently attribute scraper, vulnerability-scan, and AI-training-crawl load to Google, and hosting bills get blamed on SEO. The verification procedure is well-documented and boring, which is exactly why it deserves to be a one-command tool with a picture at the end.

## How it works

1. **Parse** the log (combined format, plus Caddy JSON).
2. **Claim extraction**: regex the UA against a table of ~25 known crawler signatures — Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot, Applebot, AhrefsBot, Bytespider, etc.
3. **Verify**, per claimant, by the method that crawler actually publishes:
   - *Reverse-forward DNS* (Google, Bing, Apple): PTR the IP, check the hostname suffix (`.googlebot.com`, `.search.msn.com`), then forward-resolve that hostname and confirm it maps back to the original IP. Both halves are required; skipping the forward step is the classic hole.
   - *Published IP ranges* (OpenAI, Anthropic, Cloudflare): fetch and cache the vendor's JSON range file, match by CIDR.
4. **Enrich** unverified IPs with ASN + org from a local MaxMind GeoLite2-ASN database.
5. **Render** a static HTML report: a stacked area chart of verified vs. fake over time; a treemap of fake traffic by ASN (expect a lot of cheap VPS providers); and the payoff view — a **path-affinity diff** showing which routes are over-represented in fake traffic relative to real crawlers. `/wp-login.php` and `/.env` light up instantly, but so does whatever content someone specifically wants to scrape from you, which is genuinely informative.

## Technical approach

- **Stack**: Go, single static binary, no daemon. `go:embed` the HTML/JS template so output is one self-contained file.
- **DNS**: a bounded worker pool (~50) doing PTR + A/AAAA via `net.Resolver` against a configurable resolver, with an on-disk BoltDB cache keyed by IP with 7-day TTL — the same IPs recur constantly, so caching is the difference between 8 seconds and 8 minutes.
- **CIDR matching**: build a radix trie (`cidranger`) over the union of vendor-published ranges; O(bits) lookup per IP.
- **Data model**: one row per request `{ts, ip, path, status, bytes, claimed_bot, verdict ∈ {verified, forged, unverifiable}, asn, asn_org}` in an in-memory columnar slice, aggregated before render. Streams the log, never holds it all.
- **Path affinity**: per path prefix, compute `log2(share_of_forged / share_of_verified)` with additive smoothing; sort descending. Cheap, and reads well.
- **Hard part**: getting *unverifiable* right rather than defaulting to "fake." Some legitimate crawlers publish neither PTR nor ranges; a tool that cries forgery is worse than useless. Three-state verdict, explicitly explained in the UI legend.

## v1 scope

- nginx combined format only.
- Verify exactly three families: Googlebot (rDNS), Bingbot (rDNS), GPTBot (CIDR).
- One HTML file out: timeline + ASN treemap + path-affinity table.
- DNS cache on disk.

## Out of scope

- Live blocking, firewall rule generation, WAF integration.
- Anything that phones home or uploads logs.
- Bot *behavioral* fingerprinting (TLS JA4, header order) — v2 at best.

## Risks & unknowns

- Reverse DNS at volume can trip resolver rate limits; may need to recommend a local unbound.
- GeoLite2 now requires a free signup, adding onboarding friction. Fallback: skip ASN enrichment.
- If a given site's logs are 99% honest, the report is dull — though "you're fine" is a legitimate output.

## Done means

Run against 30 days of my real access log, it finishes in under a minute on cached DNS, correctly verifies at least one genuine Googlebot hit via full forward-confirmed rDNS, flags at least one forged one, and the path-affinity table surfaces a route I did not expect the impostors to be after.
