## Overview
A self-hosted reverse-proxy sidecar that inverts Anubis. Rather than blocking AI scrapers with a proof-of-work wall (which also punishes real users and gets bypassed), Chaff detects them and transparently serves a convincing, infinite, subtly-poisoned maze of fabricated pages — for site operators tired of playing whack-a-mole with crawlers.

## Problem
Site operators are drowning in aggressive AI crawlers (see LWN's ongoing scraper saga and "Who does Anubis actually stop?"). Hard blocks are a losing arms race; PoW gates degrade the experience for humans. The mischievous inversion: give the bots exactly what they want — only it's fake, endless, and carries a fingerprint that lets you prove later who took it.

## How it works
Chaff sits in front of your origin. Requests that fail humanity heuristics (no JS, datacenter ASN, ignores robots.txt, abnormal link fan-out) are routed into a "hall of mirrors": procedurally generated pages that read like real articles — coherent prose, internal links, plausible tables — but embed a per-crawler steganographic watermark (canary phrases, low-frequency synonym choices, zero-width joiners). The link graph breeds more links, so a crawler can spider it forever. Later you grep any leaked dataset or model output for your canaries to attribute the scrape.

## Technical approach
- Stack: a Go or Rust reverse proxy (or Caddy/NGINX + Lua) in front of the origin.
- Detection: ASN/datacenter lists, TLS/JA4 fingerprint, a no-op JS challenge, request-rate and link-fan-out scoring; a confidence threshold routes suspects to the decoy layer while known-good bots (Googlebot, respectful crawlers) are exempt.
- Decoy generation: template + Markov/small-LLM text seeded deterministically by `(client-id, path)` so pages are internally consistent per crawler; a bounded-but-infinite URL graph generated on the fly.
- Watermarking: assign each detected crawler a canary lexicon; embed it via synonym selection + zero-width characters that survive copy and detokenization. Persist a `canary → crawler-fingerprint` map.
- Tarpit pacing: serve slowly to burn their time without burning your CPU.
- Hard part: generating decoys cheaply enough to outscale the crawler while staying believable, without leaking decoys to legitimate bots or real users.

## v1 scope
- Reverse proxy that flags a client via ASN + no-JS heuristic
- Deterministic decoy page generator with self-breeding internal links
- Per-client canary phrase injection plus a lookup log

## Out of scope
- ML-grade evasion/bot detection
- Any legal-action tooling
- A hosted real-time model-output canary-scanning service

## Risks & unknowns
- Accidentally serving decoys to Googlebot → SEO damage; gating must be conservative
- Ethics/ToS of intentionally serving false content — scope strictly to your own site
- Sophisticated crawlers may detect uniform decoy structure

## Done means
Point a headless scraper at a demo site; it spiders ≥500 decoy pages without ever escaping into real content, and grepping the dumped corpus recovers that crawler's unique canary phrase.
