## Overview
Plane Table (named for the surveyor's field board you draw the map *on* while you're standing in the terrain) is a 4-player real-time cooperative game. One player's phone is the board; three players are blind bodies moving on it. Neither half holds a usable map: the Plotter sees **where** everyone is but not **what** is there; the three Rodmen feel **what** is there but never know **where**.

## Problem
In every "one person guides the blindfolded people" game, the guide has all the information and the others have none, so the guide is playing a game and everyone else is on a phone call. Plane Table cuts the map in half along a seam that forces both sides to be useful, and puts the group's actual shared map on the TV as something they built themselves — and got wrong.

## How it works
An 8×8 walled floor plan lives on the server. One exit tile is invisible to everyone.

**Rodman phone (private, ×3):** a full-screen black pad. Touch and drag; the offset from your touch-down point is an analog velocity vector, with a faint ring at the origin so drag distance is legible. Nothing else is drawn — no walls, no dot, no coordinates. When your body strikes a wall, a hard white slab flashes along the edge of the screen on the side you hit, plus a click and `navigator.vibrate(40)` where supported. Crossing the exit tile fires a distinct double-pulse you feel and nobody else does.

**Plotter phone (private):** a blank white sheet with three live colored dots gliding in real time. No walls, no exit. She sees a dot slide sideways along an invisible edge and hears the room yell "wall on my left!" — and taps to drop a **wall pin** where she thinks the obstruction is, or an **X pin** for the exit.

**Host TV (public):** only the pins. The group's hand-built, accumulating, frequently wrong floor plan, plus a 90-second countdown and a running bump counter. The truth is never drawn on it.

**Win:** within 90 seconds, all three dots stand simultaneously on the exit tile for 2 seconds. Only a Rodman standing there knows it's there; only the Plotter knows where "there" was. The two halves must talk.

## Technical approach
PartyKit Durable Object (or Socket.IO over Tailscale Serve) running an authoritative 30Hz tick. Server-only state: `walls`, `exit`, `pos[playerId]`, `vel[playerId]`, `pins[]`, `bumpCount`. Rodman clients send `{vx, vy}` at 20Hz; the server integrates, resolves swept-AABB collisions against wall segments, and pushes `{edge:'left'|'right'|'up'|'down'}` **only to the colliding player's socket**. Positions stream at 20Hz to the Plotter alone; pins broadcast to Plotter + TV. Dots pass through each other — no piece-piece collision in v1.

The genuinely hard part: **the feedback must round-trip**. A Rodman client cannot do client-side prediction because it has no geometry — giving it walls to predict against would hand it the map. So the buzz latency is the network latency, full stop. Mitigation is to bound the damage: cap speed so 150ms of travel is under a tenth of a tile, and send the collision *normal* rather than a position, so the flash reads as a direction ("something is to my left") that stays true even if it lands late.

## v1 scope
- Exactly 4 players: 1 Plotter, 3 Rodmen. 4-letter room code.
- One hand-drawn 8×8 plan, one exit, one 90-second round.
- Wall pins and one X pin. No eraser, no undo.
- Win screen or timeout screen showing the pinned map beside the truth.

## Out of scope
Moving hazards, procedural plans, more Rodmen, pin editing, per-material audio, spectator view, rematch button, persistence, accounts.

## Risks & unknowns
iOS Safari has no `navigator.vibrate` — the screen flash and click have to carry the whole sensation, and that must be tested on an actual iPhone before anything else is built. A drag pad with no visual anchor may feel unmoored; the origin ring is the hedge. The Plotter may be overloaded tapping pins while three dots move at once. 90 seconds is a guess and may be wildly wrong in either direction.

## Done means
One honest playthrough on three phones (at least one iPhone) plus a laptop on the TV; Rodman sockets provably never receive wall or exit geometry; a wall contact produces visible feedback on the striking phone within 150ms on the local network in the median case; the round ends in either a verified 2-second three-dot hold on the exit or a timeout, with the group's pin map rendered on the TV next to the real plan.
