## Overview
Chum is a decoy-leak generator plus tripwire dashboard. Where the AIL framework (trending GitHub) passively *hunts* for real leaked data, Chum does the mischievous opposite: it fabricates convincing fake leaks laced with unique canaries and seeds them in the places attackers and scrapers actually crawl, alerting you the instant one is touched. For solo devs and small teams who want early-warning without a SOC.

## Problem
Most breaches are discovered late, and leak-hunting is inherently reactive — you can only find what's already out. Canary tokens exist but making them *believable* and placing them at scale is tedious, so people don't. Chum makes proactive bait cheap.

## How it works
You generate a decoy artifact — a fake `.env`, an AWS-key-shaped credential, a plausible DB dump, an 'internal' doc — each embedding a unique tripwire: a DNS-callback hostname, a tracking URL, or an alert-wired cloud key. A place-it CLI drops decoys into chosen locations (a repo's git history, a public gist, a staging endpoint). When any canary phones home, the dashboard shows *which* decoy, *where* it was planted, and requester metadata — so a single hit tells you a specific perimeter is being probed.

## Technical approach
Templates + faker generate believable content. Tripwires: unique subdomain DNS logging (canarytokens-style), pixel/URL callbacks, and optionally an IAM key wired to CloudTrail. A small self-hosted callback server (Go or Node) receives hits, stores them in SQLite, and alerts via ntfy/webhook. Data model links each generated decoy to its seed location and canary id. The hard part is decoys believable enough to be taken but harmless if used, and correlating a hit back to the exact seed without false positives from your own security scanners crawling your own bait.

## v1 scope
- Generate a fake `.env` carrying one DNS-canary hostname + one tracking URL.
- A `place` CLI that drops it into a chosen dir or gist and records the seed.
- A tiny callback listener that pings ntfy on any hit, naming the decoy.

## Out of scope
- AWS/CloudTrail integration.
- Automated multi-service seeding and rotation.
- Attribution / IP geolocation of the requester.

## Risks & unknowns
- Sophisticated attackers detect and skip decoys.
- Self-triggering from your own tooling causes alert fatigue.
- Legal/ToS exposure if seeding third-party surfaces — only plant where you're authorized.

## Done means
Plant a decoy `.env`, `curl` its canary URL from a different machine, and receive an ntfy alert naming that specific decoy and its seed location within seconds.
