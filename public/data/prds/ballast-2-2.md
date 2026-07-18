## Overview
Ballast is a 3–4 player cooperative reflex game for a room with a shared TV and phones. The host screen shows a square tray tilting in real time with a marble rolling on it; each player's phone is exactly one corner of that tray. The room's shared task is to keep the marble near center for a sustained window — but the only way to move the tray is to *push down* your corner, and if two corners get shoved in the same instant the tray over-corrects and the marble rockets off. You have to take turns nudging without ever agreeing out loud who goes when.

## Problem
Most 'keep it balanced' co-op is trivially solved by everyone talking. The itch here is a physical system that punishes doing the obvious thing — reacting at the same time as your neighbor — so the fun is in *waiting* and reading the delay.

## How it works
Each phone is assigned a fixed corner (NE/NW/SE/SW). PRIVATE per phone: a big PUSH pad, a small live readout of *only your own* corner height, and a haptic 'impulse' pulse that buzzes when the marble is drifting toward your side (your cue that a nudge from you would help). You do NOT see anyone else's corner, push timing, or impulse.

SHARED host TV: the tray rendered in 3D tilting under the summed corner forces, the marble physics, a center 'safe ring,' and a hold-timer that only advances while the marble is inside the ring.

Mechanic: a PUSH applies a downward impulse to your corner. If two (or more) pushes land within a 180ms collision window, they don't average — they *stack*, badly overshooting, and the marble is flung. So the room must silently stagger nudges: feel your haptic impulse, but hold if you sense the tray is already correcting (someone else just went). Win = keep the marble in the safe ring for a cumulative 8 seconds.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) runs the tray physics at ~30Hz: state = 4 corner heights + velocities, marble x/y/vx/vy, hold-timer. Phones send timestamped PUSH events; server buckets them into 180ms windows to detect collisions and applies stacked vs. staggered impulses. Host subscribes to full physics state; phones subscribe only to their corner scalar + a derived boolean impulse flag. Hard part: fairness of the collision window under variable phone latency — server timestamps on receipt with a per-client clock-offset estimate (periodic ping/pong) so a laggy player isn't perpetually 'colliding.'

## v1 scope
- 4 fixed players, one shared tray, one 8-second-hold round.
- Tap-to-PUSH only (no analog force); haptic impulse cue.
- Host physics + collision klaxon; simple pass/fail.

## Out of scope
- Analog pressure via accelerometer, >4 players, multiple marbles, obstacles, scoring ladder, reconnect grace.

## Risks & unknowns
- 180ms window may feel arbitrary/unfair on bad wifi — needs offset calibration tuning.
- Without seeing others, players may freeze; the haptic impulse must be legible enough to act on.

## Done means
4 phones each drive one corner; two simultaneous pushes visibly overshoot and fling the marble on the host screen; a round where players stagger nudges reaches the 8-second hold and shows WIN.
