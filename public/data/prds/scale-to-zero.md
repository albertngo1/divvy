## Overview
Scale to Zero is a browser puzzle game that inverts Karpenter — instead of scaling *up* for performance, your job is to ruthlessly scale *down* for cost. Each level is a running cluster; you win by draining and terminating nodes until spend hits the floor, without violating any workload's requirements. For infra nerds and anyone who's stared at a cloud bill.

## Problem
(Design itch, not a market one.) Bin-packing, pod eviction, PodDisruptionBudgets, and graceful drains are real, satisfying constraint puzzles that ops folks do intuitively but no game models. Autoscaler docs are dry; the *tension* of consolidation is genuinely gamey and untapped.

## How it works
A level presents nodes (each a grid of CPU/mem cells) hosting pods (tetromino-ish blocks with cpu/mem footprint, an anti-affinity color, and a replica count that must stay ≥ its PDB minimum). You act by: **draining** a node (its pods must be rehomed onto others with room and no anti-affinity clash before it terminates), **cordoning** to stop new placements, and shuffling pods to defragment. A live meter shows $/min = running nodes × rate. Each terminated node drops your cost; the level's par is the theoretical minimum node count. A ticking "traffic" gauge means some workloads scale up mid-level, forcing re-packing. Drop a pod below its PDB and you eat an SLA penalty. Roguelike mode chains levels with modifiers (spot-instance reclaims yank a node from under you, stateful pods that can't move).

## Technical approach
Pure client-side: TypeScript + a canvas/SVG board (or React + Zustand). Core is a bin-packing/first-fit-decreasing solver used two ways — to compute par (offline) and to validate that a drain is legal (can all evicted pods be placed?). Anti-affinity is a graph-coloring constraint on shared nodes. Level definitions are JSON (`nodes[]`, `pods[]` with footprint/affinity/pdb, `events[]` timed scale-ups). Hard part: authoring levels with a *provably* reachable par but no trivial solution — solved by generating candidate packings, then reverse-shuffling pods across extra nodes to produce a scrambled but solvable start. Cosmetic authenticity: mirror real kubectl verbs (cordon/drain/evict) so it reads true to ops players.

## v1 scope
- One board, drag-to-rehome pods, drain button
- CPU/mem two-axis packing + anti-affinity colors
- Cost meter + par score, 8 hand-made levels
- Win = all workloads placed on the fewest nodes

## Out of scope
- Roguelike run mode, spot reclaims, stateful pods
- Multiplayer / leaderboards
- Real cluster connection
- Procedural level generator

## Risks & unknowns
- May feel like homework to non-infra players
- Bin-packing UI can get fiddly on small screens
- Balancing par difficulty by hand doesn't scale past a dozen levels

## Done means
A player can load level 1, rehome pods, drain two nodes to reach par cost, and see a win screen — with an illegal drain (PDB violation) correctly blocked and explained.
