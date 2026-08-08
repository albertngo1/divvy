## Overview

A 4-player, one-round cooperative panic game for a living room with a TV and four phones. One player is the Radar; three are Drifters. The Radar's phone is the only screen showing the board — but it does not show the present. It shows a projection of where each Drifter will be four ticks from now if nobody changes anything. The Radar must talk the room out of a future she can only see by not preventing it.

## Problem

"One player reads the map and tells everyone where to go" collapses into a single person playing a solo puzzle out loud while three people obey. The itch: make the map-holder's information *self-destroying*, so reading it aloud is a costly, strategic act rather than a narration service.

## How it works

A 9×9 grid of open cells, walls, and three pickup cells, invisible to everyone but the Radar. Movement is continuous: each Drifter has a **heading** (N/E/S/W) and moves one cell per 700ms tick automatically. Nobody stops. Hitting a wall costs the room 5 seconds off a 3-minute clock and randomizes that Drifter's heading.

**Drifter phone (private):** a four-way dial showing only their *current* heading, and a private counter — **turns left**, seeded secretly and unequally (3, 5, or 8). No position, no trail, no board. Changing heading spends one turn. At zero turns you are a projectile the room cannot steer.

**Radar phone (private):** the board, with each Drifter drawn *only* as a ghost at their projected 4-tick landing spot plus the projected path line. Current positions are never drawn. The projection recomputes on a slow 2.8s sweep, so the Radar is always describing a future extrapolated from stale headings — and the instant someone turns, her read is garbage until the next sweep.

**Host TV (shared):** the fog only — cells any Drifter has entered, unattributed; the clock; and one number: total turns remaining across the room. Never who owns them.

Win: all three Drifters have crossed all three pickup cells before the clock dies. The Radar may talk freely; Drifters may talk freely. The tension is that each Drifter must decide whether to admit they are nearly out of turns, and the Radar must ration which futures are worth interrupting.

## Technical approach

Host tab + phone PWAs over a PartyKit/Durable Object room. Server is authoritative and runs a fixed 700ms tick loop: `{grid, drifters:[{id, pos, heading, turnsLeft}], sweepAt}`. Clients never simulate; they render server state. Three distinct diffs are emitted per tick — Radar gets projected positions only (`simulate(pos, heading, 4)`), Drifters get `{heading, turnsLeft}`, TV gets `{fogSet, clock, sumTurns}`. Turn presses are queued and applied at the next tick boundary, so a press is never lost to latency but also never resolves faster than the room can hear about it.

Hard part: the projection must feel *honest but useless*. If the sweep is too fast the Radar just plays the present; too slow and it is noise. 2.8s vs a 700ms tick is the number to tune first.

## v1 scope

- Exactly 4 players, one 3-minute round, no lobby beyond a room code
- 9×9 hand-authored grid, 3 pickups, no regeneration
- Four headings, no speed control
- Turn budgets hardcoded to 3/5/8, randomly assigned
- Win/lose screen with the true board finally revealed on the TV

## Out of scope

Scoring, multiple rounds, more than 3 Drifters, a traitor Radar, sound, reconnection, mobile landscape.

## Risks & unknowns

Drifters may find the no-position view disorienting rather than tense. The self-defeating projection may read as a bug, not a mechanic — the TV must show a "PROJECTION STALE" flash when a heading changes so the room *sees* the Radar being blinded by their own advice.

## Done means

Four phones join by code; all three Drifters move continuously without input; the Radar's screen provably shows no current positions; a heading change visibly invalidates the Radar's view within one tick; a room wins or loses on the clock and the true board is revealed.
