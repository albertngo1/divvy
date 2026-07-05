## Overview
On Three is a 4-player cooperative real-time game (Spaceteam / Devils & the Details lineage) on a shared host screen plus one phone per player. The ship is failing and its latches must be released — but each latch takes *multiple hands pulling at the same instant*, and no phone shows who its partners are. The whole game is discovering your co-pullers by voice and synchronizing a countdown before the clock runs out.

## Problem
Synchronized simultaneous action — the 'okay, on three: one, two, THREE' moment — is the most joyful beat in real-time party games, but it's usually incidental. On Three makes it the *entire* mechanic, and uses private, per-phone assignments to force the messy, funny scramble of figuring out who's even on your team for each latch.

## How it works
The host screen shows a console of 6 labeled latches (RED, BLUE, GREEN…), a hull-integrity bar, and a timer. A latch glows faintly while someone is holding it, but the screen never reveals assignments.

Private per-phone view (load-bearing):
- Each phone shows only the latches **you** are assigned to (say, RED and GREEN) and one big **PULL** button.
- A latch opens only when **all** players assigned to it are holding PULL within the same ~400 ms window.
- You are never told who shares a latch — so you must call out: 'Who's got RED?!' and, once you find them, count down together to hit PULL in unison.

Overload emerges because you're on two latches with two *different* partner sets, so you can't just camp one countdown — you're being summoned to someone else's 'on three' while running your own. A wrong pull on a latch that isn't yours nudges the hull bar down.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Latch {id, required:[playerIds], open:bool}`, `Player {id, assigned:[latchIds]}`, `Round {timerMs, hull}`. Phones send `press{latchId, t}` / `release`. The **genuinely hard part is fair simultaneity detection under variable phone latency**: the server ignores client clocks and instead opens a latch when it has *received* an active-hold from every required player inside a rolling server-side window; the window must be generous enough (~400 ms) to feel achievable but tight enough that a real countdown is required. Latch state and hull are server-authoritative and broadcast on every change.

## v1 scope
- Exactly 4 players, one 90-second round.
- 6 latches, each requiring exactly 2 players; assignments overlap so everyone shares with two others.
- Single hull bar; win = all 6 latches open before time.
- No accounts, no reconnection grace.

## Out of scope
- 3-player latches, variable window difficulty, multiple rounds.
- Accelerometer/mic sensors (pure tap timing in v1).
- Score leaderboards, cosmetics, spectator view.

## Risks & unknowns
- The 400 ms window may feel unfair on bad Wi-Fi — needs tuning against real latency.
- With only 4 players the discovery scramble might resolve too fast; latch overlap must be dense enough.
- Button-mashing exploit if the wrong-pull penalty is too soft.

## Done means
Four phones join a host room and each privately sees only its own latch assignments; a latch opens exactly when both assigned players hold PULL within the server window and stays shut otherwise; opening all 6 within 90s shows a WIN screen and running out shows a LOSS — all latch/hull state server-authoritative.
