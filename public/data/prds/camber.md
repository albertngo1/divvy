## Overview
Camber is a 3–4 player cooperative party game where the host TV shows a single ball resting on a virtual tilting plane, and each player's phone is a live tilt paddle. The on-screen plane is a top-down map of the actual room: players physically surround the TV at different sides, and each person's lean pushes the ball away from *their* side. It's a group labyrinth where the maze controllers are human beings standing at the cardinal points of the room.

## Problem
Tilt-maze toys are single-player and solitary. Party tilt games usually collapse to one phone passed around. There's no easy way to feel a shared physical object that four people are *simultaneously* wrestling with from four sides of a room.

## How it works
At setup each player does a 'face the TV and hold level' zeroing step. The host then assigns each phone a room-relative push vector based on its compass heading toward the screen — the player at the north wall pushes the ball south when they lean forward, the west-wall player pushes east, etc. During play, the host TV shows ONLY the shared plane, the ball, walls, and the goal hole. Each PHONE privately shows just a tiny arrow — 'lean this way to push toward center' — plus a strength bar and a warning when the player's tilt is fighting a teammate's. Nobody's phone shows the ball position; you must look up at the TV and coordinate out loud. Guide the ball into the hole within 60 seconds without it rolling off an edge.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room {ballX, ballY, vx, vy, goal, phase}`; per-player `{id, headingOffset, pushVector, tilt:{x,y}}`. Phones read `deviceorientation` (beta/gamma tilt) plus `alpha` for the one-time heading assignment, and stream tilt at ~20Hz. Server runs a fixed 60Hz physics tick: sum each player's `pushVector * tiltMagnitude` into ball acceleration, integrate, clamp to plane, broadcast ball state to the HOST only (phones get just their private arrow/warning). The genuinely hard part is real-time fairness: reconciling 3–4 noisy tilt streams at different latencies into one stable ball without jitter or one laggy phone dominating — solved with per-stream smoothing, server-side authority, and normalizing contributions so total force is capped.

## v1 scope
- 3 players, one flat plane, one goal hole, one 60s round.
- Compass used ONCE for role assignment, then only tilt matters.
- Single ball, simple friction, no obstacles.
- Host shows ball; phones show a 1-arrow hint only.

## Out of scope
- Mazes, walls, multiple balls, moving goals.
- Scoring, rounds, leaderboards.
- Live compass re-calibration mid-round.

## Risks & unknowns
- Compass heading assignment can be wrong if players cluster on one side; needs a clear spread-out prompt.
- Tilt-stream latency spikes could make the ball feel unfair.
- iOS requires a tap to grant motion permission.

## Done means
3 phones on 3 sides of the room can, purely by leaning and shouting, roll the TV ball into the hole in under 60s, and passing a single phone around visibly fails because you can't be on four sides at once.
