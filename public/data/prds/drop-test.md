## Overview

A 90-second wordless co-op game for exactly three people in a room with a TV. Each player drags a blank slider on their phone. Each slider feeds a hidden personal value through a secret, wildly different gain. The TV shows one thing: the running **sum** of those three hidden values. The room wins when all three hidden values are equal.

For groups who like the Keep Talking / Hanabi feeling of a shared instrument nobody can read alone.

## Problem

Most "secretly match each other" party games hand the room a spread bar or an agreement meter, and then three people hill-climb the same scalar at once and it oscillates. The interesting version withholds the answer and publishes something you have to *invert* first. Drop Test makes measurement the hard part and convergence the easy part — which is the opposite of every other game in this genre.

## How it works

**Phone (private):** a vertical track, one draggable puck, no numbers, no ticks, no labels. Plus a LOCK button. Your phone never tells you your value — only the server knows your gain (drawn so one player's full travel is worth ~12 units, another ~40, another ~95).

**TV (shared):** one enormous number — the sum of all three hidden values — and a 20-second scrolling sparkline of it. Nothing else. No names, no per-player marks, no spread.

The intended solve, discovered live and in silence:

1. Drag to the bottom. Your value goes to 0 and the sum visibly *drops by exactly what you were worth*. That drop is your measurement.
2. If two people zero simultaneously, both reads are garbage — so the room has to invent wordless turn-taking, watching for the number to sit still before anyone tries.
3. Once you know your worth, aim for one third of the steady sum. Everyone doing that is the averaging map, so the room genuinely settles — the funny part is the sum lurching every time someone re-measures.

All three LOCK (held 1s, overlapping) ends the round. The TV then reveals the three true values as bars. Win: max − min ≤ 8% of the mean.

## Technical approach

PartyKit Durable Object per room code. Host tab and three phone PWAs over WebSocket.

Data model: `Room { code, phase, tick, players[{ id, gain, slider, locked }] }`. `value_i = gain_i * slider_i`. **The server never transmits `gain` or `value` to any client, including its owner** — that invariant is the entire game, so it lives in one serializer, not scattered across handlers.

Sync: phones send `slider` throttled to 30 Hz; server ticks at 20 Hz and broadcasts a single float (`sum`) to everyone. Phones render their own puck locally at rAF with no server reconciliation — since the server holds no opinion about puck position, there is nothing to fight over.

The genuinely hard part is **causal legibility**. The drop test only works if the delay between your finger hitting the bottom and the TV number falling stays under ~150 ms on hotel wifi; and the number must be smoothed just enough to read (≈50 ms EMA) without smearing step changes into ramps, which would destroy the read.

## v1 scope

- Exactly 3 players, one 90-second round, one room.
- Host page: the sum, a sparkline, a countdown, a reveal screen.
- Phone: a puck and a LOCK button.
- Fixed gain triple {12, 40, 95} with randomized assignment.
- Room code, no accounts, no reconnect.

## Out of scope

Multiple rounds, scoring history, 4+ players, inverted or nonlinear gains, sabotage roles, sound, spectators, mid-game rejoin.

## Risks & unknowns

- Players may never discover the drop test; needs one line of on-screen tutorial text, and finding the *minimum* hint that doesn't give it away is the real playtest question.
- The low-gain player may feel irrelevant — their drop is barely visible on the same axis. Autoscaling the TV axis might fix it or might destroy the read.
- Wifi jitter above ~200 ms makes the measurement unreadable and the game unplayable.

## Done means

Three phones join by code on a LAN; the TV sum tracks all three sliders at 20 Hz; a player sliding to zero produces a visible step within 150 ms; the server logs prove no client ever received its own value; and a room that has never played before reaches ≤8% spread inside 90 seconds at least once in five tries.
