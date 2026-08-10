## Overview
A watchlist scanner over the Certificate Transparency logs that surfaces hostnames a company has provisioned but not yet launched. For equity researchers, competitive-intel people, and retail investors who want a free, legal, public alt-data feed instead of a $40k/yr terminal add-on.

## Problem
CT is a legally mandated public append-only log of every cert a browser will trust. Companies request certs during staging — days to months before the thing goes live. Alt-data desks already mine this; nobody has built the retail-grade version, and the highest-signal slice is trivially detectable: a valid cert exists for a hostname that does not resolve. That's a build, pre-announcement. `careers-warsaw.`, `checkout-v3.`, an acquiree's brand appearing under the acquirer's apex — all of it lands in a public log first.

## How it works
You add companies. The tool resolves each to a set of registrable domains (site footer, SEC filing exhibit URLs, SANs on their existing certs) — you confirm the list by hand. It then watches CT for any cert whose SANs fall under a watched domain. Each newly seen hostname is triaged: does it resolve? HTTP status and title? wildcard or specific? which CA? first-seen timestamp? Then labeled — geographic expansion (country/city token), new product (never-before-seen token), vendor migration (CNAME to a new SaaS), M&A adjacent. The money view is a single sorted list: unresolved hostnames, ranked by how anomalous their label is against everything that company has ever registered.

## Technical approach
Node or Go. Backfill from crt.sh's read-only Postgres (`psql -h crt.sh -U guest certwatch`) so day one isn't 100% false positives; then poll `get-entries` against the logs in Google's log-list JSON with a per-log tree-size checkpoint (more reliable than certstream websockets). Parse precerts, extract SANs, filter with a suffix trie over watched registrable domains via the Public Suffix List — O(1) per cert at 1–3k certs/sec.

Postgres schema: `hostname, first_seen, issuer, cert_sha256, company_id, dns_state, http_state, label, novelty`. Novelty = per-company character-level n-gram model trained on that company's existing hostname labels; score new labels by perplexity so `web-07` stays quiet and `nautilus` screams.

Hard parts, in order: (1) company→domain mapping is fuzzy and produces most of the garbage; (2) separating real product hostnames from CDN/preview churn (Vercel, Cloudflare, `*.pr-1234.`) needs an aggressive deny-list; (3) whether cert issuance actually leads announcements by enough time to matter is genuinely unknown.

## v1 scope
- 10 hand-entered companies with hand-entered domain lists
- crt.sh backfill + one daily poll (no firehose)
- NXDOMAIN flag and first-seen date only
- Static HTML digest, one page per company

## Out of scope
Trading, automated backtests, private-company coverage, real-time streaming, alerting.

## Risks & unknowns
Signal may be nil — needs a retrospective check before anyone trusts it. Preview-deploy noise is brutal. crt.sh rate-limits guests. Nothing here is nonpublic, but users will assume it's spicier than it is.

## Done means
For 10 companies, a 90-day timeline renders, and at least 3 flagged hostnames are verified — against press releases — to have appeared in CT before the public announcement.
