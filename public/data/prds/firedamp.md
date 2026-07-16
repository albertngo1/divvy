## Overview
A 3-player (scalable to 5) cooperative escape game. One player is the **Spotter** on the surface, holding the whole tunnel map on their phone. The others are **Miners** underground, each phone showing only blackness and a private hazard reading. The room has to talk its way out before a collapse timer.

## Problem
Most 'one phone is the map' games make the map-holder omniscient and the pieces pure puppets — boring for the pieces. The itch is a guiding game where BOTH sides hold information the other desperately needs, so nobody is just following orders.

## How it works
The server generates a small grid maze with walls, one exit shaft, and an invisible **gas field** (each cell has a firedamp value; some cells are spiking and rising over time).

- **Spotter's phone (the map/board):** full top-down maze — every wall, the exit, and a dot for each Miner's live position. Crucially, the Spotter sees **no gas at all**.
- **Each Miner's phone (private, blind):** near-total darkness. Four move buttons (N/E/S/W) and one **firedamp meter** — a needle showing the gas in THAT miner's current cell only. Each miner sits in a different part of the maze, so every meter reads differently and privately. A miner in a spiking cell watches their needle climb toward red; nobody else can see it.

The loop is two-way negotiation out loud: the Spotter calls routes ('miner two, you're boxed — go east two cells'), while Miners report what only they can feel ('my gas is redlining, get me out NOW'). The Spotter must re-route around walls they can see toward safe air they can't. A Miner whose needle hits max before reaching the shaft passes out (removed). Win = all surviving Miners reach the exit before the collapse timer.

## Technical approach
Host browser tab (optional big-screen 'collapse clock' + dramatic reveal), phone PWA clients, authoritative WebSocket server (PartyKit / Cloudflare Durable Object). **Data model:** `maze{cells[], walls[], exit}`, `gasField[cellId] -> float` diffusing on a server tick, `miners[] {id, cell, alive}`. **Sync:** server owns all state at ~10Hz; Miner taps send a move-intent, server validates against walls and broadcasts the Spotter a fresh dot map and each Miner only their own cell's gas scalar. Miner clients render nothing spatial — just their meter and buttons. **Hard part:** the real-time verbal loop tolerating latency — movement must feel instant enough that 'go east NOW' lands on the right cell, so client-side move prediction with server reconciliation, plus keeping each Miner's gas value strictly private (never leak the field to the Spotter's socket).

## v1 scope
- 3 players: 1 Spotter, 2 Miners.
- One 6×6 maze, one exit, one 90-second collapse timer.
- Static gas spikes that rise linearly (no diffusion).
- Win/lose screen; no scoring, no rounds.

## Out of scope
- Gas diffusion/spread, multiple exits, branching mazes.
- Rotating who is Spotter, best-of series.
- Sabotage/traitor variant.

## Risks & unknowns
- Does the Spotter drown out the Miners, collapsing the two-way tension into one-way? Tune by making gas the true constraint, not walls.
- Verbal chaos with 3+ Miners; may cap at 3.
- Latency making 'go east now' land a cell off and feel unfair.

## Done means
Three phones join a room code; the Spotter sees a maze with two moving dots and no gas; each Miner sees only their own rising needle and four buttons; the group escapes (or gasses out) inside 90s, and at no point is any Miner's gas value present in the Spotter's network traffic.
