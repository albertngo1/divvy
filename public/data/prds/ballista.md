## Overview
Ballista is a small physics puzzle game inspired by the newly described ballista spider, which loads a silk snare like a spring and fires it at passing ants. You are that spider. Each level is a stage you rig in advance: anchor silk lines, load tension into them, then trigger the release to catapult prey into your web. For puzzle players who liked The Incredible Machine and anyone who read the spider headline twice.

## Problem
Tower-defense and trap games are all about *reacting* to enemies in real time. The ballista spider does the opposite — it invests energy up front and springs a single perfect ambush. No game captures that 'wind it up, wait, snap' loop, and stored-elastic-energy is an underused, tactile mechanic.

## How it works
Each level pre-scripts prey walking a path. In build phase you place silk anchors and stretch threads between them; stretching stores potential energy shown as a glowing gauge, but over-stretch and the thread snaps. You set a trigger zone. Hit play: when prey crosses the trigger, threads release, converting stored energy to kinetic and flinging the snare. You win by capturing the quota with the *fewest anchors* and *least wasted energy*, which drives a leaderboard.

## Technical approach
Box2D (the actual HN repo) compiled to WASM, driving a canvas/WebGL front end — silk modeled as chains of distance joints with a break threshold, energy = summed joint strain. Prey are simple kinematic bodies on splines. Deterministic fixed-timestep sim so a level solution is reproducible and rankable; I hash the (level seed, placement list) and replay server-side to validate leaderboard entries against cheating. Hard part: making elastic silk *feel* springy and predictable, not spongy — tuning joint stiffness/damping and a clear pre-release trajectory ghost so players can aim.

## v1 scope
- Box2D-WASM sim with distance-joint silk that stores and releases energy
- 8 hand-authored levels, single prey type
- Build phase + play phase + a par-based star rating
- Local best-score only

## Out of scope
- Global leaderboards and replay validation server
- Multiple prey types, wind, or environmental hazards
- Level editor / sharing

## Risks & unknowns
- Elastic feel is make-or-break and hard to tune; may need many iterations.
- Trajectory prediction for a multi-joint spring is nonlinear — the aim ghost could be misleading.

## Done means
A player can rig a snare in 8 levels, release stored energy to catch the quota, earn a par-based star rating, and the same placement always yields the same catch.
