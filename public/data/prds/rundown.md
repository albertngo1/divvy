## Overview
Rundown is a 3–5 player party game that hijacks the most passive group ritual there is — scrolling a menu (or any list) together and mumbling opinions — and turns it into a private parimutuel betting market. The shared TV runs a cheesy VH1-style 'Top 6 Countdown' reveal; each phone is a secret ballot box and a secret betting slip.

## Problem
When a group looks at a menu, everyone privately has strong opinions and reads on each other ('Dev will 100% get the wings'), but that information just evaporates into small talk. There's no game that harvests those hidden opinions AND the social reads on top of them.

## How it works
A round has three beats.

**1. Feed the show (private).** The host TV shows 6 menu items (a built-in deck for v1). Each phone PRIVATELY rates every item 0–10 on 'how badly do YOU want this right now.' Nobody sees anyone's ratings. The server sums them into a TRUE ranking #6→#1 that no human has ever seen — the group collectively authored an answer they don't know.

**2. Place bets (private, simultaneous).** The TV teases the 6 items. Each phone gets 10 chips and privately stakes them on propositions: 'X is #1', 'Y finishes bottom two', 'X ranks above Y'. Payouts are **parimutuel and contrarian** — a proposition's pool is split among whoever backed it, so a correct bet nobody else made pays huge. Your private info (your own ratings + your read on the table) is your edge.

**3. The reveal.** The TV runs the countdown one slot at a time with drumroll animation. Chips settle live. Leaderboard updates.

What's PRIVATE per phone: your ratings, your chip allocation, your bankroll. What's SHARED on the TV: the item deck, the dramatic reveal, the standings.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room, or Socket.IO over Tailscale Serve). Data model: `Room{code, phase, deck[6], players[]}`, `Player{id, ratings[6], bets[], chips}`, `TrueRank` computed server-side and never emitted until reveal. Sync strategy is turn-gated, not real-time-continuous: phases advance on a server clock, phones POST ratings then bets, server validates chip totals and locks each phone independently, broadcasting only 'N of M submitted' progress. The genuinely hard part is **parimutuel settlement fairness** — resolving overlapping proposition pools (a chip on '#1' and a chip on 'top-two' can both hit) and handling ties in the aggregate ranking deterministically; get the payout math wrong and the whole market feels rigged.

## v1 scope
- 3 players, one round, one hardcoded 6-item menu deck.
- Three proposition types only: exact-#1, bottom-two, A-over-B.
- Flat 10 chips, single parimutuel settlement, simple leaderboard.

## Out of scope
- Multiple rounds / persistent bankroll across rounds.
- Custom or imported menus, external data decks.
- Hidden-role 'insider who knows the ranking' variant.

## Risks & unknowns
- Parimutuel math may feel opaque to casual players — needs a one-line 'nobody else bet this, so it paid 5×' explainer.
- With only 3 players the aggregate ranking has little signal; may need 4+ to feel earned.
- Rating fatigue if items aren't evocative.

## Done means
Three phones each submit secret ratings and a legal 10-chip bet; the TV reveals a countdown derived from the combined ratings; each phone's bankroll updates correctly per parimutuel rules; a winner is declared — all without any phone ever seeing another's ratings or bets before the reveal.
