## Overview
Blue Plate is a 3-6 player party game that hijacks the single most passively-consumed group ritual — reading a menu — and turns it into a private prediction market. It's for friends at a table (physical or virtual) who want a 90-second game before the food arrives.

## Problem
Everyone browses a menu in parallel silence, then orders, then forgets. There's a hidden social truth in there — who's basic, who's contrarian, what the table gravitates to — that's never surfaced or wagered on. Blue Plate mines that.

## How it works
The host TV shows a curated menu pack of 8 dishes ("Diner," "Taqueria," "Late-Night") with names and photos, plus each dish's live pari-mutuel odds. Every player starts with 10 chips. A single 45-second window opens, during which each phone PRIVATELY does two simultaneous things:
1. **Your real order** — tap exactly one dish you'd actually eat. Nobody sees this.
2. **Your bet** — drop all 10 chips on the ONE dish you predict will be the table's single most-ordered.

The delicious squeeze: you want to bet the crowd favorite, but so does everyone, so the payout thins. A dish you personally love may be a lonely order. The TV shows the odds line drifting as anonymized chip totals move — you feel the market form without knowing who moved it.

At lock, the TV reveals: the real order tally as a bar chart, then each player's bet and order. Payout is pari-mutuel — everyone who bet the actual top dish splits the full pot, weighted so FEWER co-bettors on the winning dish earns MORE (contrarian-correct bonus). Ties in orders broken by earliest lock.

## Technical approach
Host browser tab + phone PWA clients + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room {menuPack, phase, players[]}`, `Player {id, chips, betDishId, orderDishId, locked}`. Bets/orders are written server-side and never broadcast until the reveal phase transition — clients only receive AGGREGATE anonymized chip counts per dish for the live odds line (throttled to ~4 Hz). The genuinely hard part is trust, not raw sync: private state must be authoritative server-side so a sniffed WS frame can't leak another player's order mid-round; the odds broadcast must aggregate before it leaves the server. Reveal is a single atomic state push.

## v1 scope
- One menu pack, one round, 3-6 players
- Fixed 10 chips, all-or-nothing single-dish bet
- One 45s betting window, pari-mutuel payout with contrarian weighting
- Bar-chart reveal on TV

## Out of scope
- Multiple rounds / running bankroll
- Splitting chips across dishes
- Custom menu upload, real ordering integration
- Live odds sophistication beyond a drifting line

## Risks & unknowns
- With 3 players the tally is thin and ties dominate — may need a 4-player floor.
- Contrarian-weighting math must feel fair and legible at reveal.
- "Real order" honesty is unverifiable; it's a party, so fine.

## Done means
Four phones join, each secretly locks an order + a bet inside 45s, the TV shows a live drifting odds line during the window, and at reveal displays the order tally, every bet, and a correct pari-mutuel payout with a contrarian bonus applied.
