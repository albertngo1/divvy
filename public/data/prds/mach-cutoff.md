## Overview
A browser puzzle game for aviation nerds, physics fans, and route-optimizers. You're a supersonic dispatcher in a newly-deregulated sky: connect two cities faster than sound while keeping every audible boom off the ground.

## Problem
The FAA is lifting the 52-year overland supersonic ban — but only conditioned on booms not reaching the ground ('Mach cutoff'). This is a beautiful, invisible piece of physics: below a cutoff Mach number the shock ray refracts upward through the warming/cooling atmosphere and never touches earth. Nobody outside acoustics knows this exists. It's begging to be a puzzle.

## How it works
Top-down US map. You drop waypoints from city A to B and set a Mach number and cruise altitude per leg, under a fuel/time budget. The engine computes a 'boom carpet' for each leg: if your Mach exceeds the local cutoff (a function of the temperature/wind lapse rate) low enough that rays reach the surface, every populated cell under the carpet 'hears' it and you bleed points. Goal: complete the trip within budget with minimum population boom-exposure. A date-seeded daily puzzle plus a global leaderboard by score.

## Technical approach
Fully client-side (TypeScript + MapLibre GL). Physics: acoustic ray-tracing of the shock through a layered atmosphere using Snell's law on the sound-speed gradient a(z); cutoff Mach ~1.15–1.25 depending on lapse rate. v1 uses an ISA standard atmosphere; later, NOAA RAP/GFS soundings. Population from a coarse GHSL or US Census block-centroid raster, precomputed to a quadtree for fast carpet-overlap queries. State is deterministic from a daily seed; scoring precomputed for a par. Hard part: a boom-carpet model that's physically plausible AND tunable enough to be fun (not a coin flip).

## v1 scope
- One fixed aircraft, ISA atmosphere (no live weather)
- 10 hand-authored US city-pair puzzles
- Boom carpet approximated as a width function of Mach & altitude
- Population as a static gridded raster
- Per-puzzle par score + shareable emoji result

## Out of scope
- Live weather soundings
- Multiple aircraft / fuel-burn realism
- 3D flight view
- Real-time multiplayer

## Risks & unknowns
- Physics fidelity vs. fun tension; too-accurate may be unwinnable
- Could mislead people into thinking it's FAA-accurate — needs a loud 'this is a game, not a flight planner' disclaimer
- Niche appeal; needs a satisfying 'aha' in the first 60 seconds

## Done means
In a browser you open today's puzzle, adjust Mach/altitude on each leg, watch the boom carpet redraw live, finish within budget, get scored on booms + fuel, share a result string, and see your rank persist on a leaderboard.
