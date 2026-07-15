## Overview
Ringer is a self-hostable (or cheap-SaaS) watchtower that monitors Certificate Transparency logs for freshly-issued certificates on domains that impersonate your brand — typos, homoglyphs, TLD swaps, hyphen inserts, `-login`/`-secure`/`-pay` prefixes. It's for indie founders, local businesses, and small e-commerce shops (WooCommerce stores, exactly the phishing bait in the feed) who get impersonated but can't afford CSC/MarkMonitor.

## Problem
Scammers stand up a phishing clone (`paypaI-support.com`, `yourbrand-billing.co`) and the first observable signal is almost always a Let's Encrypt cert appearing in CT logs — often days before the phishing emails go out. Enterprises watch this in real time. Small brands find out when a customer forwards them a fraud email. The data is public and free; the tooling and permutation-generation are the only barrier.

## How it works
1. You enroll one or more brand strings (`acmesprockets`, `acme.com`).
2. Ringer generates a permutation set (dnstwist-style: omission, insertion, homoglyph, bitsquat, common TLDs, keyword-appends).
3. It subscribes to the live CT stream and matches every newly-logged domain against the fuzzy set (Levenshtein + phonetic + confusable-normalization).
4. On a hit it scores risk (registered how recently? MX records set? live HTTP fingerprint resemblance to your homepage?) and fires a `ntfy`/email/Slack alert with a one-click evidence bundle (WHOIS, cert SAN list, screenshot, abuse-contact + pre-filled registrar/host abuse report).

## Technical approach
- Stream: `certstream` websocket (free, ~200 certs/sec) or self-hosted CT log tailing via `google/certificate-transparency-go`.
- Permutation: port dnstwist's algorithms; store the generated set in a Bloom filter + a trie for fast prefix/edit-distance matching so the hot path handles the firehose on one core.
- Confusable normalization via Unicode UTS-39 (`confusables.txt`).
- Enrichment: RDAP/WHOIS for registration age, `dns` lib for MX, headless Chromium (Playwright) for a homepage similarity screenshot + perceptual hash (pHash) vs. your real site.
- Stack: Go or Node worker + SQLite + a tiny Svelte dashboard; deploy as one Docker container.
- Hard part: keeping false positives low at firehose scale — a common short brand matches thousands of legit domains. Solve with tunable risk gates (require MX + young registration + pHash proximity before high-priority alert).

## v1 scope
- One brand string, one alert channel (ntfy).
- certstream ingest + dnstwist permutation match + edit-distance gate.
- Alert payload: matched domain, cert SANs, issuance time.
- CLI + JSON log; no dashboard.

## Out of scope
- Automated takedown filing.
- Multi-tenant billing, teams, SSO.
- Passive DNS / newly-registered-domain feeds beyond CT.

## Risks & unknowns
- certstream reliability (public instance drops; may need self-hosted CT tailing).
- False-positive fatigue for generic/short brands.
- Legal care: alert only, never probe/attack the impersonator.

## Done means
Enroll a test brand, register a lookalike domain and issue a Let's Encrypt cert for it, and receive a correctly-scored ntfy alert with the cert SANs within 60 seconds of the cert appearing in CT — with zero alerts from a control run over a benign brand string during the same window.
