## Overview
Sprawl steals the ragdoll-physics-runner genre (QWOP, Getting Over It) and shatters its controls across the room. One flailing runner stands on the TV; each phone owns exactly one limb. It's a co-op comedy game for 2–4 people whose fun is entirely in the panicked cross-talk of trying to make a body walk when no one person controls the body.

## Problem
QWOP is hilarious *because* one player fights their own uncooperative limbs. Distribute those limbs across separate people and the internal struggle becomes an external one — a real party. This is impossible with a passed-around phone: you need N limbs actuating *simultaneously*, and the comedy comes precisely from each player only being able to feel their own leg, never the whole gait.

## How it works
The **host TV** shows a side-view ragdoll runner and a finish line 10 meters away. In the 4-player build the limbs are left-thigh, left-calf, right-thigh, right-calf; in the 2-player build each phone owns a whole leg.

Each **phone** shows privately: a single big pad — hold to contract that muscle, release to extend — plus *only its own limb's* telemetry: current joint angle, a fatigue meter, and a "PLANTED / SLIPPING" indicator. No phone sees the composite pose or anyone else's foot state. So coordination is verbal and frantic: "left foot's planted — right thigh PUSH NOW — okay lift, LIFT!" The server runs the physics; the group runs the negotiation.

Goal: cross 10 meters before the runner faceplants or 60 seconds expire. One attempt.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). The server runs a simple 2D rigid-body / verlet ragdoll loop; phones stream muscle-activation floats at ~20Hz. Data model: `runner { bodies[], joints[], x, fallen }` plus per-phone `{ limbId, angle, fatigue, contact }`. The server steps physics, broadcasts full pose to the TV at ~30fps, and pushes each phone *only* its own limb's telemetry channel. The genuinely hard part is a **real-time server-side physics loop** that stays responsive under variable phone latency while streaming just the pose to the TV — and, harder still, tuning the physics to sit in the sweet spot of hard-but-winnable rather than instantly-faceplant.

## v1 scope
- 2 players (one leg each), one flat track, 10 meters, one attempt.
- Contract/extend as the only input; fatigue and plant/slip as the only private readouts.
- Public TV pose + a finish line + a faceplant state. Nothing else.

## Out of scope
- Arms, obstacles, hills, multiple rounds, leaderboards.
- More than 4 players, replays, remote play.

## Risks & unknowns
- Physics tuning is make-or-break: too hard is pure frustration.
- Input latency could make coordinated timing impossible rather than just funny.
- Unclear whether private per-limb feedback adds tension or just noise over plain distributed control.

## Done means
Two phones each drive one leg, the runner on the TV takes at least a few coordinated steps under live shouting, and the round ends in a clear public faceplant or finish — with neither phone having ever shown the other leg's plant state.
