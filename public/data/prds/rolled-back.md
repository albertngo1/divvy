## Overview

A 4-player real-time claiming game that steals rollback netcode — the thing fighting games do to hide latency — and makes it the entire mechanic. Your phone shows you a confident, immediate, frequently wrong version of the match. The truth arrives a beat later and visibly rewrites what you just watched happen. For people who like a game that lies to them on purpose.

## Problem

Simultaneous-action party games resolve honestly: everyone reveals, everyone sees the same board. That makes them fair and a little flat. Real games hide latency by predicting other players' inputs and eating the rollback when the prediction is wrong — a mechanic every player has felt and nobody has ever been allowed to exploit.

## How it works

A 12-tile board on the TV. Beats are 2.5 s. Each beat, every player taps one tile to claim. Unclaimed tiles are worth 1; two or more players claiming the same tile void it for everyone.

When you tap, your phone resolves instantly and optimistically: your claim lights up as yours, and the three other players appear on your board too — **predicted**, by assuming each repeats their last move as a relative offset (exactly what a rollback predictor does). So your phone shows you a plausible, complete, confident world one beat before that world exists.

The server settles the beat and pushes truth. Where prediction was wrong, your phone plays a visible rollback: the board glitches, ghost claims are erased, and points you watched yourself bank can evaporate. The TV shows only the authoritative board, one beat behind the phones — so the room watching sees the truth before the players do, and yells about it.

The exploit is the point: everyone else's phone predicts you by your last move. Claim three tiles in a straight line and every other screen confidently shows you continuing the line. Break the pattern and you've mispositioned all three of them at once. Beat 8 ends the round.

**Phone (private):** your optimistic board, your predicted opponents, your rollback flashes, your provisional score.
**TV (shared):** the settled board one beat back, confirmed scores, void tiles, beat counter.

## Technical approach

Cloudflare Durable Object as the authoritative clock: fixed 2.5 s beats, server timestamps every input, late inputs are dropped (never re-ordered). State is `{beat, tiles[12]: ownerId|VOID|null, lastMove[playerId]: tileIndex, confirmedScore[playerId]}`.

Phones run the same tiny reducer locally, seeded with `lastMove` for the other three, and render prediction + own input immediately. On `beat_settled`, a phone diffs its predicted board against truth and animates the delta. The hard part is making rollback legible rather than confusing — the diff animation must be slow enough to read (~400 ms) while the next beat is already accepting input, and phone clocks must align to server beats via a simple ping-offset estimate.

## v1 scope

- 4 players, 12 tiles, 8 beats, one round
- Prediction rule: repeat last tile's relative offset, clamped to board
- One rollback animation (glitch + fade) and one sound
- TV: settled board, scores, beat counter, final standings

## Out of scope

Multiple rounds, tile values beyond 1, smarter predictors, variable beat length, reconnect, tutorial, spectator phones.

## Risks & unknowns

The biggest risk is that rollback reads as "the game is broken" rather than "the game is doing a bit" — the TV needs a one-line legend and the first beat should be a scripted mispredict. Prediction may be too weak an information source to bother reading. Four players on 12 tiles may collide constantly; tile count needs tuning against player count.

## Done means

Four phones join, a beat resolves every 2.5 s, each phone visibly shows predicted opponent claims before the server confirms, a wrong prediction triggers a rollback that removes a point the player already saw awarded, the TV lags phones by exactly one beat, and a full 8-beat round produces final standings the room agrees with.
