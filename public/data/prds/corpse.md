## Overview
Corpse is a 3-5 player party game (theater slang for breaking into laughter on stage). The group passively watches a try-not-to-laugh compilation on the shared TV — but before a single frame plays, every phone has already placed a private bet on who in the room will lose it first. It turns a passive watch-party into a live wager on your friends' faces.

## Problem
Groups watch funny videos together all the time; it's pure consumption with no stakes. "Try not to laugh" adds tension but has no scoring and no reason to watch anyone but the screen. Corpse gives the room a reason to watch each *other*.

## How it works
1. Lobby: host TV shows player names and a shared 60-second reel is queued.
2. **Bet phase (simultaneous, private):** each phone shows the roster and your chip stack (say 10 chips). You privately allocate chips across "who breaks first" — and you may bet on YOURSELF lasting longest. Nobody sees anyone's bets. The host TV shows only "3 of 4 locked in."
3. **Watch phase:** the reel plays on the TV. Each phone shows one giant **I BROKE** button. The instant you laugh/smile, you tap it (peers are watching your face, so lying is socially policed).
4. **Resolve:** the first honest tap ends the round. Payouts are parimutuel — the pot splits among everyone who bet that player, so backing a longshot who few others picked pays big. If nobody breaks before the reel ends, chips on "myself" pay out.
5. Host TV reveals the bet grid and the winner.

PRIVATE per phone: your bet allocation, your I-BROKE button. SHARED on TV: roster, lock progress, the reel, final payouts.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room{players[], reelId, phase, pot}`, `Player{id, chips, bets:{targetId:amount}, brokeAt:ts|null}`. Sync: bets stream to the server and are hidden until reveal; the server timestamps the first `broke` event (RTT-normalized) to declare the loser, then computes parimutuel payouts. The genuinely hard part isn't sync (it's low-frequency) — it's honest break-detection: v1 relies on self-report + peer pressure. Front-camera smile detection (face-api.js on-device, emit only a boolean) is the obvious upgrade but is out of scope.

## v1 scope
- 3-4 players, one pre-loaded 60s reel, one round.
- Fixed 10-chip stack, bet only on "breaks first."
- Self-report I BROKE button; first tap wins.
- Parimutuel payout + reveal grid.

## Out of scope
- Camera-based laugh detection.
- Multiple rounds / running bankroll / prop bets ("breaks in first 10s").
- Curated reel library.

## Risks & unknowns
- Honesty: someone laughs and doesn't tap. Peer enforcement + "you bet on it" pressure mitigates; camera solves it later.
- A too-funny or not-funny-enough reel wrecks pacing.
- Simultaneous ties on the break tap (server picks earliest timestamp).

## Done means
Three phones join, each privately locks a hidden bet, the reel plays, the first I-BROKE tap ends the round, and the host TV shows correct parimutuel payouts with no phone ever having seen another's bet before reveal.
