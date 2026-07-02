## Overview
Cover Charge is a browser extension that puts a paywall on *your own* distractions. Riffing on Cloudflare's x402 "charge for any resource" gateway, it flips the mechanic inward: to enter a site on your blocklist, you pay a small toll — and the toll surges each time you come back the same day. A toy (a paywall) made dangerously useful (a commitment device with teeth).

## Problem
Willpower blockers fail because the escape hatch is free: you click "disable for 5 minutes" at zero cost. Nothing about caving *hurts* in the moment. Existing money-based commitment apps charge a flat, forgettable fee. The missing ingredient is friction that escalates with your own weakness — the more you relapse today, the more it stings.

## How it works
You set a blocklist (reddit, youtube, x…) and a base toll (say $0.50). Hit a blocked site and an interstitial turnstile appears: *"Cover charge to enter: $0.50 — visit #1 today."* Pay and you get a timed pass. Come back and it's $1.00, then $2.00 — surge pricing on your own procrastination, reset at midnight. Money routes to a destination you pre-commit to and can't easily change: a savings pot, a friend, or an "anti-charity" (a cause you'd hate to fund — maximum motivation). A weekly ledger shows exactly what your distractions cost you in dollars and reset-defying willpower.

## Technical approach
Manifest V3 extension. `declarativeNetRequest` redirects blocked hosts to a local interstitial page. Visit counters + surge multiplier in `chrome.storage.local`, keyed by host + local date. Payments: Stripe Checkout for real dollars, or a Cloudflare x402 endpoint for micro-crypto to genuinely honor the source inspiration; a "pledge mode" (Beeminder-style honor tally, no real charge) as the frictionless demo path. The interesting bit is the escalation curve and the *irreversible* destination lock — the anti-charity payout is what turns a gimmick into a real deterrent. Clock via local midnight; guard against tab-reopen gaming by keying passes to host + timestamp.

## v1 scope
- Blocklist + base toll config
- Interstitial turnstile with doubling surge, daily reset
- "Pledge mode" ledger (no real money) as default
- One real-money backend (Stripe Checkout)
- Weekly cost summary page

## Out of scope
- Mobile, cross-browser sync
- x402/crypto rail (stretch)
- Enforced anti-charity payouts (v1 is honor-based destination)

## Risks & unknowns
- Users just disable the extension — mitigate with a friction'd uninstall-pledge, but it's fundamentally honor-bound.
- Handling real money raises support/refund burden; pledge mode sidesteps it for v1.
- Surge could feel punitive rather than motivating; make base toll and curve user-tunable.

## Done means
Installing the extension, blocking one site, and visiting it three times in a day shows tolls of $0.50 → $1.00 → $2.00, records each in the ledger, resets to base after local midnight, and completes at least one real Stripe charge end-to-end.
