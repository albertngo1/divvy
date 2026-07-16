## Overview
Parlay is a Jackbox-shaped party auction for 3-6 players: one host screen (the auction house) and each phone as a private bidding paddle. It compresses the most tedious auction in tabletop gaming — the combinatorial, all-or-nothing bundle auction — into ten silent seconds of simultaneous sealed bids that the server resolves instantly.

## Problem
Bundle auctions are the best mechanic nobody plays at a table, because running one by hand is misery: everyone scribbles package bids on slips, someone collects them, and then a human has to hand-solve which non-overlapping packages maximize revenue while players argue over ties. The math is the fun; the bookkeeping kills it. Private phones + an authoritative server do the bookkeeping invisibly and make the fun the whole game.

## How it works
The host TV shows four face-up **lots** (little icons: a Gear, a Vine, a Lantern, a Crown) and a 20-second clock. That's ALL the shared screen shows during bidding.

Each phone PRIVATELY holds: a budget of 20 coins, a secret per-lot valuation table, and one secret **synergy card** (e.g. "Gear + Crown together: +8"). On your phone you compose exactly ONE all-or-nothing package: tap the subset of lots you want, then set a single price with a slider. You win that package only if it wins WHOLE — no partial fills. Everyone submits blind and simultaneously.

At lock, the server runs winner-determination: pick a set of lot-disjoint packages that maximizes total revenue; a lot can back only one winning package. The host TV animates the reveal — winning bundles glow, coins fly, and each player's net score (won valuations + synergy bonus − price paid) posts. The tension is pure info-asymmetry: is anyone else hungry for the Crown that completes your combo, and dare you overpay to lock the whole bundle?

## Technical approach
Host tab + phone PWAs + one authoritative WebSocket room (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room {lots[], phase, deadline}`, `Player {id, budget, valuations{lot:int}, synergy{lots[], bonus}, bid?{lots[], price}}`. Sync strategy: phones only ever emit their own `bid`; the server never leaks a bid until the `RESOLVE` broadcast, so privacy is server-enforced, not honor-based. The genuinely hard part is winner-determination (weighted set-packing, NP-hard in general) — but at 4 lots and ≤6 packages it's a sub-millisecond brute force over all disjoint subsets, with ties broken by a per-round seed passed in via room config (no Date.now/random on the client).

## v1 scope
- 3 players, exactly 4 lots, ONE auction round.
- Fixed hand-authored valuation + synergy cards (no generation).
- Package = subset + one price; single sealed reveal; net-score leaderboard; done.

## Out of scope
- Multiple rounds, budgets carrying over, English/Dutch fallback modes.
- Player-set synergies, more than ~5 lots, negotiation or re-bids.

## Risks & unknowns
- Does hidden winner-determination feel fair, or magic-black-box? Reveal must show WHY each bundle won ("beat Gear+Vine's 11 with 14").
- Ties and "my bundle lost by 1" salt — needs a crisp animated explanation.
- Reading four secret valuations fast enough in 20s.

## Done means
Three phones submit disjoint/overlapping package bids blind; the host resolves the max-revenue allocation correctly (verified against a hand-computed case), reveals winners with a legible justification, and posts net scores — with no bid ever visible before lock.
