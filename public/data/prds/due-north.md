## Overview
A co-op escape game for 4 players (one Warden + three Runners). The Warden's phone IS the map. Runners are blind pieces who must reach the exit on the Warden's spoken guidance alone — but each Runner's controller is privately rotated, so a single instruction lands differently for each of them.

## Problem
Hidden-maze games usually collapse to 'read me the directions,' which is a solved, boring pipe. The itch: make a shared, public voice channel *insufficient* on its own, so the guide has to actively translate one broadcast into three private frames of reference under a clock.

## How it works
The host TV shows only fog, a countdown, and three anonymous runner-dots pulsing when they move — enough drama, zero spatial help. The **Warden's phone** privately shows the full grid maze: walls, the single exit, and all three Runner tokens live. Each **Runner's phone** shows nothing but a d-pad whose 'up' arrow is secretly assigned a random cardinal (Runner A's up = real east, B's up = real south, etc.) plus a one-word result flash after each tick: *moved / wall / fell*. The Warden may talk freely and continuously, but there is no private text channel — the voice is public and shared. So 'Blue, your up! Green, your left!' forces the Warden to hold three rotations in their head simultaneously and address Runners by relative frame. Every 4 seconds the server resolves all queued moves at once. Reach the exit before the timer to win together.

Per-phone is load-bearing: each Runner holds a *private* rotated frame and submits a *simultaneous secret* move; the Warden holds a *private god-view*. One phone passed around cannot host three conflicting reference frames moving at the same instant — the entire puzzle is the mismatch between one public voice and many private compasses.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object per room). Data model: `{ maze: cell[][], exit, runners: {id, pos, frameRot, mirror, lastResult}[], tick }`. Server owns maze generation and all movement; clients are dumb renderers. Sync: fixed 4s tick; Runners POST a queued direction, server maps `direction` through that runner's `frameRot`, applies collision, broadcasts per-runner private results and the Warden's full view. The genuinely hard part is generating a maze that is solvable yet *still hard* once frames are scrambled (no accidental single-instruction solutions), plus deterministic simultaneous-move collision resolution so two runners can't clip through each other.

## v1 scope
- Exactly 1 Warden + 3 Runners
- One 6x6 hand-tuned maze, one exit, one round, 90s
- Frames = 90° rotations only (no mirroring yet)
- Voice is just the room; app adds no audio

## Out of scope
- Traps, keys, multi-room mazes
- Text/whisper channels, mirrored frames
- Reconnection grace, spectators, scoring across rounds

## Risks & unknowns
- Is scrambled-frame guidance fun or just infuriating? Needs playtest on rotation count.
- 4s tick may feel sluggish or frantic — tune.
- Warden cognitive load with 3+ frames could exceed fun ceiling.

## Done means
Four phones join, Warden sees the maze, three Runners see only rotated d-pads, and a room can talk-and-tick all three blind runners to the shared exit inside 90 seconds at least once.
