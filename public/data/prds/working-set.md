## Overview
Working Set is a single-player, browser-based tactical puzzle game built on one idea stolen from a CPU cache: you cannot see the whole level, and you don't choose what you forget. The game keeps a fixed-size LRU set of tiles. Touching a tile pages it in; that eviction pushes out the least-recently-touched tile, which goes black and keeps running its simulation offscreen. For puzzle players who liked Baba Is You's rule-fiddling and Into the Breach's perfect-information determinism — this is the inverse of Into the Breach.

## Problem
Fog of war in games is a spatial radius: you see near, not far. That's stale, and it rewards nothing but walking. LRU eviction makes forgetting *temporal* and *self-inflicted* — the fog is a consequence of your own attention history. Nobody has built a puzzle game where the resource being managed is the player's own visibility budget, and where the optimal solve looks like a cache-friendly loop-tiling problem.

## How it works
A 12×12 grid; your working set is 12 tiles. Each turn you move one step or perform an action on an adjacent tile — both count as a touch, and touched tiles jump to the front of the recency list. Hazards (rising water, patrolling walkers, growing vines) simulate every turn everywhere, seen or not. Evicted tiles render as flat black; when they're paged back in you see the *result* of N turns of hidden simulation, not the process.

The skill is scheduling. A naive player walks a long path and evicts the pressure plate they needed to remember. A good player interleaves: touch the far switch every 8 turns to keep it resident, batch work in one quadrant to preserve locality, or deliberately evict a tile because the monster on it freezes when unobserved. Late levels add a *prefetch* verb (page in a tile without acting on it, at a turn cost) and *pinned* tiles that never evict but shrink the working set by one.

## Technical approach
TypeScript + a plain canvas renderer, no engine — the whole state is a 144-cell typed array plus an intrusive doubly-linked recency list with a Map for O(1) promotion, i.e. an actual LRU cache implementation used as the game rule. Simulation is a deterministic pure function `step(state) -> state`, seeded PRNG (xoshiro128), full undo via a state ring buffer, and a replay-hash so solutions can be shared as a 40-character string. Levels are hand-authored JSON validated by a brute-force BFS solver over (grid state × recency-list state) that must find a solution within a target move count and must NOT find one that ignores eviction.

The genuinely hard part is legibility: a player must be able to *feel* their recency order without reading a list. Prototype answer — every visible tile carries a thin desaturation ramp keyed to its position in the list, so the tile about to die is visibly ghosting, and a 12-slot tape along the bottom edge shows the queue.

## v1 scope
- One 12×12 grid size, working set fixed at 12
- Three hazard types: water, walker, vine
- 15 hand-authored levels
- Undo, restart, no save file, no audio

## Out of scope
Procedural level generation, associativity/set-conflict mechanics, story, mobile touch, Steam release.

## Risks & unknowns
The mechanic may be more cute than deep — if levels are solvable by "touch everything in a tight spiral," it's dead. Mitigation: the solver must reject levels whose solution has locality above a threshold. Also real risk of nausea-by-blackness; may need memory *ghosts* (last-known-state at 20% opacity) which softens the whole idea.

## Done means
Five playtesters clear level 10, and at least three of them independently describe a strategy in scheduling terms ("I had to go back and re-touch the door every few moves") without ever being told the rule is an LRU cache.
