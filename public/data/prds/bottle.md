## Overview
Bottle is a 3–6 player nerve-and-betting game that grafts a crash-game (Aviator-style) mechanic onto a shared suspense clip. The room watches a single 'wait for it' video — a kettle nearing boil, a Jenga tower leaning, a balloon over-inflating, a sprinter approaching the line — while each phone privately runs a rising multiplier. The whole game is a test of who bottles it first.

## Problem
Suspense clips are the purest passive consumption: everyone stares, someone yells 'NOW,' the moment happens, done. There's no cost to being wrong and no reward for holding your nerve. The itch: turn 'wait for it' into a silent, simultaneous wager where hesitation is the whole point.

## How it works
The host plays a clip containing exactly one climactic event that fires at an unknown time inside a window (say 5–40s). As the clip plays, each phone privately shows a live multiplier climbing from 1.0× upward and a single fat CASH OUT button. Tap to lock your bet at the current multiplier and sit safe. But if the event fires while you're still holding, you BUST and score zero for the round. Longer nerve = higher multiplier = higher payout, but the event can end everything at any instant.

Each player decides independently and simultaneously — you cannot see anyone else's multiplier or whether they've cashed. The host shows the clip plus a row of 'still in' lights (holding vs. cashed) but never anyone's multiplier. On event-fire, all holders bust; the highest locked multiplier among survivors wins the round. Per-phone is load-bearing: the fun is three people privately, simultaneously sweating the same live clip with no shared control — a passed-around phone is physically impossible during a real-time crash.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Round{clipId, fireAtMs, startedAt, players: Map<id, {status:'in'|'cashed'|'bust', multiplier}>}`. The server owns `fireAtMs` and the authoritative round clock; the multiplier is a deterministic function of elapsed server time so all phones agree without streaming per-tick values. Cash-outs are server-stamped. The genuinely hard part is fairness at the boundary: the host clip playback, the server clock, and each phone's tap must be reconciled so a cash-out that lands within ~150ms of the event fire is adjudicated consistently for everyone — requiring clock-offset handshakes on join and server-side timestamp arbitration, not client-reported times.

## v1 scope
- 3 players, one hard-coded clip, one fixed fire time
- Linear multiplier curve, single round, closest-survivor-wins
- No persistence, no accounts

## Out of scope
- Multiple clips/rounds, running bankroll, custom multiplier curves, video upload

## Risks & unknowns
- Boundary fairness (tap vs. fire within milliseconds) is the make-or-break
- Clip/event timing must feel unpredictable but be authoritative
- Curve tuning so cashing early ever feels tempting

## Done means
Three phones each run an independent climbing multiplier over one shared clip, cash-outs lock at server-stamped multipliers, holders at fire time bust, and the highest surviving multiplier is declared winner — with tap-vs-fire adjudicated identically for all three.
