## Overview
Sharp Money is a 4-player concurrent-room game where a group watches one short clip together and bets on a single prop about it — except exactly one player already knows the answer. It's for groups who watch things together and end up narrating predictions at each other anyway; this turns that narration into a market with a mole in it.

## Problem
Group watching is passive, and "betting on the show" games collapse into everyone shouting the same obvious guess. Real betting markets are interesting because *someone knows something*, and the interesting information isn't the outcome — it's who moved the line. No party game makes the betting pattern itself the deduction surface.

## How it works
Host TV: a clip queued at frame 0 with one binary prop overlaid ("Does the dog catch the frisbee?"), a live YES% price bar, and an anonymous ticker of fills ("+120 chips → YES", no names). Nothing else, ever.

Each phone privately: 100 chips, YES/NO buttons, a stake slider. The server privately assigns exactly one INSIDER and shows only that phone the true outcome, plus the line: "Win big without getting caught." The other three phones read "You're reading the room."

The clip plays for 60 seconds. The market is open the whole time, with price impact: every fill moves the price against later buyers, so the insider's edge decays — betting early and heavy is worth the most and is also the loudest possible tell. Players talk out loud the entire time ("who just dumped 40 on NO?").

The clip resolves. P&L settles. Then every phone privately votes for the insider. Majority-correct: the insider's winnings are confiscated and split among the accusers. Majority-wrong: the insider's winnings double. Because non-insiders also keep their own betting P&L, the optimal play is often to *copy the sharp money* — which makes you look like the sharp. That's the game.

## Technical approach
PartyKit Durable Object per room, authoritative. State: `{clip: {id, url, propText, trueOutcome}, insiderId, market: {yesPool, noPool, fills[]}, players: {id, chips, positions[], vote}}`. `trueOutcome` and `insiderId` are never in any broadcast payload; the insider's reveal is a single targeted socket message. The public snapshot is a redacted projection computed server-side, so a player who opens devtools sees only the anonymized ticker.

Fills are server-priced: the client sends `(side, amount)`, the server timestamps it, computes price from current pools, appends to `fills`, broadcasts the redacted delta. Clip position is host-owned; the host tab emits a `playhead` tick each 250ms and the DO rejects fills after `t=60s`.

Hard part: the ticker must be *informative enough to deduce from but anonymous* — fill sizes and timing leak identity if the room can correlate them with who was looking at their phone. Tuning fill granularity (bucketed sizes, ~400ms batching jitter) is the real design work.

## v1 scope
- 4 players, one clip, one binary prop, one round
- Clip + `trueOutcome` hardcoded in a JSON manifest
- Fixed 100-chip stacks, 60-second market, three stake sizes (10/25/50)
- One insider, one accusation vote, one scoreboard

## Out of scope
Multiple rounds, over/under props, two insiders, no-insider rounds, clip library/upload, spectators, rejoin-after-disconnect.

## Risks & unknowns
The insider may be trivially obvious (fixable with anonymization tuning) or completely undetectable (fixable by forcing a minimum stake from everyone, so silence isn't camouflage). Clips with genuinely uncertain outcomes are hard to source. Price impact may be too subtle to feel at 4 players.

## Done means
Four phones join, exactly one privately learns the outcome, all four trade during playback, the TV shows only an anonymous line, the market resolves, the accusation vote flips payouts correctly, and no non-insider phone ever receives the outcome or role data over the wire.
