## Overview
Coin Slot is a mischievous defensive toy: a self-hosted trap URL that looks like juicy scrapable content but responds `402 Payment Required` with an x402 payment challenge. Well-behaved crawlers leave; automated agents wired for machine payments can *pay* to proceed — and you pocket micropayments and log the encounter. For homelab operators tired of bot traffic who'd rather monetize it than just block it.

## Problem
Scraper traffic is pure cost: you either serve it for free or block it and see nothing. The new x402 "pay-for-any-resource" pattern flips the incentive — turn abusive automated access into either a hard stop (bots that won't pay leave) or a tiny revenue stream (agents that will pay reveal themselves).

## How it works
You expose one or more decoy paths (linked only from `robots.txt` disallow entries and hidden links — real humans never hit them). Any request gets a `402` with an x402 challenge (price, pay-to address, nonce). Non-paying clients get nothing and are fingerprinted; paying clients get bland synthetic content and are logged as "paid." A dashboard shows requests, unique fingerprints, conversion to payment, and a leaderboard of top-spending bots. It's a tarpit with a cash register.

## Technical approach
Stack: a small Go or Node service behind Cloudflare, using the Monetization Gateway / x402 flow to issue and verify payment challenges. Data model: `hits(ts, ip, ua, fingerprint, path, paid_bool, amount)` in SQLite; fingerprint from a hash of headers + TLS/JA3 if available. The `402` handler mints a challenge with a per-request nonce; a verify step confirms settlement before serving the decoy body. Dashboard is a static page reading aggregate JSON. The genuinely hard part: making the trap discoverable *only* to bots (so no real user is ever charged) and generating decoy content cheap enough that serving it costs less than you collect. Also: verifying payments without a race between challenge issuance and settlement.

## v1 scope
- One decoy path, `402` + x402 challenge, verify, serve stub
- Fingerprint + hit logging to SQLite
- Minimal dashboard: hits, paid %, top payers

## Out of scope
- Real content behind the wall
- Multi-tenant / SaaS
- Auto-blocking non-payers at the firewall

## Risks & unknowns
- x402 adoption is thin — most bots simply won't pay, so "revenue" may be ~zero (the block/telemetry value has to justify it)
- Accidentally trapping a real user or a search crawler
- Payment-verification races and settlement latency

## Done means
A scripted bot hitting the decoy gets a valid `402` challenge, a paying test client completes settlement and receives the stub while showing up on the leaderboard as "paid," and no request from a normal browser session ever reaches the trap.
