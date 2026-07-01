## Overview
Windup Grand Prix is a tiny physics racer built around the humble pull-back toy car: no throttle, no steering-during-race, just one decision — how you *pre-load* a spring — then physics does the rest while you watch it succeed or wipe out. It's for people who loved the pull-back-car teardown and anyone who likes deterministic, ghost-chasing time attacks (Trackmania energy at toy scale).

## Problem
Pull-back cars are pure stored-energy delight but a solved black box — you wind, you release, you passively watch. There's no skill loop, no comparison, no 'one more try.' Meanwhile roguelike racers are twitchy; nobody makes a game about *committing* energy up front and living with it.

## How it works
Before each run you have a coil budget (say 100 units) and three sliders: initial burst, taper curve, and gear ratio (torque vs top speed). You 'wind' by dragging the car backward — distance sets release energy, matching the real ratchet mechanic. Release: the car runs the track fully deterministically, spring energy draining through a torque model, hitting ramps, hazards, and Fall-Guys-style knockout obstacles (swinging hammers, tilting floors from Risk of Rain-ish random track mods). You can't steer mid-run — you can only spend a single 'nudge' token. Beat the track, then race the translucent ghost of your last run and of the daily seed's global best.

## Technical approach
Static web game, Matter.js for 2D rigid-body physics, canvas render. The car is a chassis body + two wheel bodies with a revolute constraint; the pull-back spring is modeled as a decaying torque applied to the rear wheel: `torque(t) = burst * e^(-taper * distanceTraveled)`, clamped by gear ratio, cut when accumulated energy hits the wound budget. Tracks are JSON: polylines for terrain + typed obstacle objects, seeded daily so runs are reproducible. Ghosts are just recorded `[x,y,angle]` frames at 60fps, delta-compressed, stored in localStorage and (v2) a KV store keyed by seed. The hard part: making the physics *deterministic* across machines so ghost times are fair — fixed timestep, integer-seeded RNG for track mods, and pinning Matter.js's solver iterations, because floating-point drift silently invalidates leaderboards.

## v1 scope
- One car, three windup sliders + drag-to-wind
- 3 handcrafted tracks with ramps + one hazard type
- Fixed-timestep deterministic sim
- Local ghost of your best run to race against
- Restart-instantly loop

## Out of scope
- Multiplayer / global leaderboard
- Car customization, unlocks, currency
- Mid-race steering beyond one nudge
- Track editor

## Risks & unknowns
- Cross-browser determinism in Matter.js (may need a custom fixed solver)
- Whether one-decision-then-watch is *fun* or just passive again — the ghost is what saves it
- Tuning the torque curve so windup choices feel meaningfully different

## Done means
A player winds the car back, tweaks the taper slider, releases, watches it clear a ramp and beat a swinging hammer, finishes with a time, and immediately re-races a ghost of that exact run — with identical physics on a reload.
