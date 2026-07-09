## Overview
An adversarial hidden-movement game for 3-4 players. One player is the **Warden** on the host screen, seeing the entire prison grid, the roaming guard, and every escapee. Everyone else is an **Escapee** whose phone is a keyhole: only their own current cell, the adjacent walls, and how close the guard *sounds*. For groups who like a tense chase but are bored of everyone sharing the same board.

## Problem
Hidden-movement classics (Scotland Yard, Nightmare) still put one physical board on the table that hunters and hunted both stare at. The asymmetry is bookkept, not felt. The itch: make each blind piece experience the maze *privately and simultaneously* — you should feel the guard's footsteps on your own phone while your partner, in a different corridor, feels nothing.

## How it works
The **host screen** (Warden) shows the full grid: walls, the exit door, the guard token, and both escapee tokens. The Warden drags the guard cell-to-cell to hunt.

Each **Escapee's phone** privately shows ONLY: a keyhole view of their current cell and which of the four sides are open, a swipe-to-move control (one move per 2s cooldown), and a **footstep meter** that rises with the guard's Chebyshev distance — plus a distinct 'draft' hint that faintly grows near the exit. They see no map, no exit location, and crucially *not their partner's position*. They must talk out loud — 'I've got a wall east, footsteps loud' — to build a shared mental map, while the Warden listens in and adapts.

Escapees win if either one reaches the exit; the Warden wins by moving the guard adjacent to catch both before then.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object): `{ grid, guardPos, exit, escapees: [{id, pos, caught}] }`. Server enforces move legality and cooldowns. On every state change it computes, *per escapee independently*, a private payload: local cell + open sides, a quantized guard-proximity level, and an exit-draft level — and pushes it to that socket only. The full grid never leaves the server toward an escapee (no client-side fog to peek past). Warden receives full state. Real-time sync is lighter than Final Approach (turn-paced moves), so the genuinely hard part is airtight *information containment* — a leaked coordinate breaks the whole game — plus tuning proximity quantization so footsteps feel fair, not omniscient.

## v1 scope
- 1 Warden + 2 Escapees, one round.
- Fixed 4x4 grid, one exit, one guard.
- 2s move cooldown; catch = guard adjacent.
- Footstep meter + open-sides view + draft hint only.

## Out of scope
- Multiple guards, items, walls that change, fog reveal.
- Scoring across rounds, escapee-vs-escapee betrayal.
- Reconnect / spectators.

## Risks & unknowns
- Is total position-blindness fun or just frustrating? May need a rare 'shared-cell bump' when two escapees collide.
- Quantized proximity could feel arbitrary; needs playtest tuning.
- The Warden overhearing table talk might be too strong on a tiny grid.

## Done means
Three phones join, the Warden sees the full 4x4 while each escapee sees only their keyhole, the footstep meter provably rises on exactly the escapee nearest the guard (and not the other), and a full round ends in either a catch or an escape without any escapee's phone ever revealing the map.
