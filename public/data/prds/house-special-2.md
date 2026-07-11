## Overview
A private-betting party game for 3-6 hungry friends. The restaurant menu everyone is passively scanning becomes a live pari-mutuel floor: you bet chips on which dish the table will order most — while secretly holding your own order as a lever you can pull.

## Problem
The ten minutes before a group orders takeout are dead air. Everyone stares at the same menu, mumbles "I dunno, what are you getting?", and someone finally decides. That shared passive-consumption lull is begging to become a game — and a menu already has natural "contestants" (the dishes) and a natural outcome (what gets ordered).

## How it works
The host TV shows a 6-dish menu with live pari-mutuel odds and the current pot. Everything interesting happens PRIVATELY on each phone:
- **Phase 1 — Commit:** each phone secretly picks the one dish you'd actually order tonight. Hidden from everyone.
- **Phase 2 — Trade:** each phone privately spreads 100 chips across dishes, predicting the table's *most-ordered* dish. As chips flow, the TV's odds shift — but WHO bet what never shows.
- **The twist:** until lock, you may quietly re-pick your own committed order to swing the majority toward the dish you're backing. Self-dealing is the whole game.
- **Phase 3 — Reveal:** the TV tallies real orders, crowns the most-ordered dish, and pays its backers pari-mutuel from the pot.
Host screen shows ONLY aggregate odds + pot. Each phone shows your secret order, your portfolio, your chip balance.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ menu[6], phase, pool{dishId->chips}, players{id->{order, bets{dishId->chips}, chips}} }`. Phones emit `commit` and `bet` events; the server is sole source of truth, recomputes pari-mutuel odds, and broadcasts only *derived aggregates* to the TV and odds to phones — never per-player state. Genuinely hard part: odds must update live and feel fair while every order and portfolio stays secret (server-side privacy boundary), and last-instant bet/order sniping is prevented with a lock countdown under server-timestamp authority.

## v1 scope
- 3 players, one fixed 6-item text menu, one round.
- 100 chips each, name-only join via QR.
- Single "most-ordered dish" market, pari-mutuel payout.

## Out of scope
- Real restaurant/menu integration, dish images, actual ordering.
- Multi-round bankrolls, multiple simultaneous markets, more than the majority bet.

## Risks & unknowns
- The self-dealing twist may confuse first-timers; needs a one-line tutorial.
- Pari-mutuel payout legibility on a TV glance.
- Does a single round build enough tension, or is 3 rounds the real minimum?

## Done means
3 phones join by QR, each secretly commits an order and allocates bets, the TV shows live shifting odds without leaking any identity, the reveal pays the correct pari-mutuel split, and one player ends with visibly more chips.
