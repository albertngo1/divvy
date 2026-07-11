## Overview
Brim is a 3–4 player cooperative game where each phone is a virtual full-to-the-brim glass. Players must carry their phone held perfectly flat (accelerometer measures tilt = spill) while walking a private compass bearing to a secret drop-point across the room. It fuses two underused signals — accelerometer tilt as a 'don't spill' gauge and magnetometer heading as private navigation — with the room floor as the board.

## Problem
Tilt games usually reward *fast* motion (shake, jerk, steer). Brim inverts it: the accelerometer punishes motion, forcing slow, careful, comedic movement. Nobody has married 'carry it level' to 'walk a secret bearing,' and the two demands fight each other beautifully.

## How it works
Each phone privately shows: a live water level in a glass (fills to the brim at start), and a single compass arrow pointing toward that player's PRIVATE target bearing + rough distance. As you walk, tilt beyond a small threshold drains water proportional to angle-over-time; jerky steps cost more than smooth ones. The compass only turns green when you're both facing and standing on your drop-point.

PRIVATE (each phone): your own glass level, your own bearing/distance, and a haptic 'sloshing' buzz that intensifies as you tilt. You never see anyone else's target — targets are scattered to different corners so players physically disperse.

SHARED (host screen): four glasses filling a communal pitcher. Each glass's water level mirrors that player's remaining water; the pitcher completes only when every player has reached their drop-point AND each glass is still above a minimum fill. One clumsy carrier who spills out drags the whole pitcher short.

## Technical approach
Phone PWA: `deviceorientation` (alpha = heading, beta/gamma = tilt) with a 'face the TV' zeroing step to align compasses across devices; `devicemotion` for jerk detection. Host tab + phone clients over an authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve).

Data model: `Room { players: [{id, bearingTarget, dropReached, waterLevel, tiltRms}] }`. Sync: each phone integrates spill locally (10–20 Hz) to keep tilt→spill responsive without network lag, and streams `waterLevel` + `dropReached` to the server, which mirrors to the host. Server is authoritative on win state and prevents cheating by rejecting impossible refills. Hard part: compass drift and per-device tilt-zero variance — mitigated by the shared 'point at the TV' calibration and generous drop-point radius.

## v1 scope
- 3 players, one round.
- Three fixed drop-points (room corners), one private bearing each.
- Level-carry spill model + minimum-fill-on-arrival win check.
- Host = three glasses + one pitcher; phones = glass level + compass arrow.

## Out of scope
- Collisions/PvP, obstacles, multiple rounds, scoring, refills, 5+ players, fancy fluid rendering.

## Risks & unknowns
- Compass drift near appliances/metal could send players the wrong way (calibration + coarse radius as mitigation).
- Tilt-zero differs by how each person naturally holds a phone; may need a per-player 'hold it flat, tap to zero' step.

## Done means
Three phones calibrate facing the TV, players slowly ferry their level phones to three different corners, and the host pitcher fills only when all three arrive with water to spare — and a single passed-around phone cannot win because three simultaneous private bearings must be walked at once.
