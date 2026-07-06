## Overview
Tarpit is a self-hosted security toy that reskins your web server's access logs as a tower-defense game, for homelabbers who host anything public. Every scanner probing your box for `.git/config`, `.env`, or `/wp-admin` becomes a creep marching down a lane; the decoy endpoints you deploy are the towers.

## Problem
The Lobsters post 'Caught a .git/config crawler' captures a universal experience: if you expose a port, bots immediately probe it for leaked secrets. Everyone sees this in their logs and does nothing with it. It's a stream of adversaries begging to be gamified — and deploying real honeypots turns idle logs into actual threat intel.

## How it works
You run Tarpit alongside your reverse proxy. It serves believable decoy endpoints — a fake `.git/config` pointing at a nonexistent repo, a fake `.env` full of canary tokens, a `/admin` login that logs every attempt. Each request to a decoy spawns a creep tagged with its IP, ASN, and requested path. Creeps advance along a lane; the longer a bot stays (following your breadcrumb decoys deeper), the more intel you extract and the more points you bank. 'Towers' are decoy configs you place to slow, redirect, or tarpit a crawler (e.g. a slow-drip endpoint that trickles bytes to waste its time). A wave summary shows top offenders, most-probed paths, and a shareable 'catch of the day.'

## Technical approach
Go or Rust single binary: a small HTTP server for the decoy endpoints + a log tailer that reads Nginx/Caddy access logs (or its own request stream). Requests are parsed into events (ip, ua, path, ts), enriched with offline ASN/geo via MaxMind GeoLite2, and pushed over websocket to a canvas front-end (PixiJS) doing the tower-defense rendering. Data model: append-only event log in SQLite/DuckDB, aggregated into per-IP 'creep' entities. Canary tokens are unique per decoy so if one is ever *used* elsewhere you get a high-value alert. The genuinely hard part is safety: decoys must be provably inert (no real secrets, no SSRF, rate-limited) so you never widen your own attack surface.

## v1 scope
- One decoy endpoint (`/.git/config`) + log tailer
- Websocket feed to a single-lane canvas
- Per-IP creep with ASN enrichment
- Daily 'catch' summary

## Out of scope
- Placing/upgrading multiple tower types
- Active blocking / fail2ban integration
- Multi-host aggregation

## Risks & unknowns
- Legal/ethical line: honeypots are fine, active countermeasures are not — stay passive
- Decoys must never leak or enable abuse
- Low-traffic boxes = empty game; may need a demo-log replay mode

## Done means
Deployed in front of a real public server, a genuine internet scanner hits the fake `.git/config` within hours and appears as a labeled creep with its correct ASN, and the daily summary names it as the top offender.
