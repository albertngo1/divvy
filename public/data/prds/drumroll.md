## Overview
Drumroll is a 3-6 player betting game built on the most passively-consumed format on the internet — the "Top 10, counting down from #5" listicle countdown. It's for a group who'd otherwise just watch a ranking reveal and shout guesses; instead they run a real-time pari-mutuel market on it.

## Problem
Countdown clip shows and listicles are engineered suspense you consume flat — you might blurt "it's gotta be X" but there's no stake, no market, no reward for reading the crowd or the truth. Drumroll converts that dead suspense into private wagering with a moving line.

## How it works
The host TV shows a category ("Most-streamed songs of 2024," "Deadliest houseplants") with 8 candidate items and 5 empty ranked slots (#5 → #1). Each player has 12 chips.

**Opening window (30s):** each phone PRIVATELY allocates chips across candidates, wagering "this is #1." The TV shows a pari-mutuel odds line that drifts live as anonymized chip totals shift — you can bet early to *move the line* and bluff the room, since only aggregates are ever shown, never who staked what.

**Reveal beats:** the TV reveals #5, then #4, etc., drumroll-style. Each revealed item is now provably NOT #1; chips on it are burned (10% refunded). Between reveals a 15s re-bet window opens on survivors with fresh odds — you double down, hedge, or chase. Your position stays private on your phone; the room only sees the moving line.

When #1 lands, everyone still holding it splits the pot pari-mutuel, contrarian-weighted (fewer co-holders = bigger share). Phone shows your P&L; TV shows the leaderboard.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room {listPack, revealedSlots[], phase, oddsSnapshot}`, `Player {id, chips, holdings:{itemId->chips}}`. Server is the sole owner of the true ranking and of each player's holdings; clients receive only aggregate per-item chip totals (throttled ~4 Hz) to render the line. The hard part is a fair, legible live market: pari-mutuel odds must recompute and broadcast on every stake without leaking identity, refunds/burns must resolve atomically at each reveal, and the reveal transition must lock all pending bets server-side to prevent a last-millisecond frame from sniping the answer.

## v1 scope
- One list pack (say 6 categories), one full countdown = one round, 3-6 players
- 12 chips, split allowed across items
- One 30s open window + four 15s re-bet windows
- Live drifting odds line, contrarian-weighted payout, P&L reveal

## Out of scope
- Multiple rounds / persistent bankroll across categories
- Player-authored lists
- Cash-out/sell-back of a position mid-round
- Sophisticated market-maker odds beyond pari-mutuel

## Risks & unknowns
- Burn-vs-refund on eliminated slots must feel fair, not punishing.
- 15s windows may be too tight to re-strategize; needs playtest tuning.
- Categories must be genuinely uncertain — obvious #1s kill the market.

## Done means
Four phones join a category, secretly allocate chips in the opening window while the TV odds line visibly drifts, survive slot-by-slot reveals with burns and re-bet windows, and at #1 receive a correct contrarian-weighted pari-mutuel payout shown as per-player P&L — with no phone ever able to see another's holdings.
