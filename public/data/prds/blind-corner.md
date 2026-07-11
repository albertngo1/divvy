## Overview
Blind Corner is a cooperative real-time party game for 3 players in one room, played on a shared TV plus a phone per person. Everyone drives a dot through the same maze at the same time — but each dot is invisible to everyone except its owner. The room's shared enemy is itself: the only hazard is running into a teammate you cannot see.

## Problem
Most co-op games reward tight coordination. This one inverts it: proximity is danger. The itch is the panic of moving through a shared space where your allies are ghosts, forcing everyone to brake, hesitate, and reroute on instinct rather than plan.

## How it works
The host TV renders a single small maze with three marked exits. Each phone shows ONLY that player's own dot and the walls immediately around it — never the other two dots. Players tilt their phones (accelerometer) to steer; a dot moves cell-to-cell continuously.

The goal: all three dots reach their assigned exits within 60 seconds. The catch: if two dots ever occupy the same cell, both freeze for 3 seconds and the run's collision counter ticks up; three collisions ends the run as a loss. The shared signal is a proximity klaxon on the host screen — it grows louder and redder whenever ANY two dots are within one cell of each other, but it never reveals which dots or where. So the room learns to freeze the moment the alarm swells, guess who's near whom, and edge apart. Private phone view (your dot + local walls) vs. shared host view (maze, exits, collision count, proximity klaxon).

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `{ maze: cellGrid, players: {id: {pos:{x,y}, exit, frozenUntil}}, collisions:int, klaxon:float }`. Phones send tilt vectors at ~20Hz; the server integrates positions authoritatively, resolves collisions, and computes klaxon = f(min pairwise distance). Server broadcasts full state to the host at 30fps and a redacted per-player state (own pos + local walls + global klaxon/collision count) to each phone. The genuinely hard part: fair collision detection under variable phone latency — normalize input timestamps against server-measured RTT so a laggy phone isn't unfairly blamed for a same-cell overlap, and debounce collisions so a single overlap doesn't double-count across frames.

## v1 scope
- One hand-authored 8×8 maze, three fixed exits
- Exactly 3 players, single 60s run
- Tilt steering only; win = all reach exits, lose = 3 collisions or timeout
- Klaxon = one global loudness meter on host

## Out of scope
- Multiple mazes / difficulty / procedural generation
- More than 3 players, teams, scoring across rounds
- Power-ups, walls that change, per-dot abilities
- Reconnection mid-run

## Risks & unknowns
- Is a global klaxon enough signal to avoid collisions, or maddeningly opaque? May need a directional buzz (phone haptics) as a tuning knob.
- Accelerometer drift/calibration across phones; needs a 'hold flat to zero' step.
- Latency fairness — the core sync challenge.

## Done means
Three phones each steer a private dot on the shared maze; the klaxon audibly responds to real proximity; two dots entering one cell freezes both and increments the counter; a run ends in a clear win (all exits reached) or loss (3 collisions/timeout) with no desync between host and phones over a full 60s round.
