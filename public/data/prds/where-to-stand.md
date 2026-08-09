## Overview

A single-player browser puzzle about differential heuristics. Each level is a map. You get a small budget of landmarks to place. Then the level runs twenty hidden start→goal queries through A*, and your score is total nodes expanded. The character walks itself; your only influence is where you chose to stand things.

## Problem

Pathfinding is one of the most beautiful algorithmic subjects and it is taught with slideware. The genuine insight — that a heuristic is a *lower bound built from precomputed knowledge*, that a landmark far outside the region of interest is worth more than one inside it, that the right landmarks make search collapse to nearly a straight line down a corridor — is spatial and playable. Nobody has made it playable.

## How it works

Place k landmarks (k = 2 to 6 depending on level). Hit Run. A* solves each query with h(n) = max over landmarks of |d(L,n) − d(L,goal)|, and the expansion frontier animates as a spreading stain, then snaps to the path. The counter ticks up. Par is shown; three stars for beating it. Crucially, queries are hidden until after you commit — landmarks are query-independent, so the puzzle is reading the *topology*, not the route. Later levels add: weighted terrain (mud costs 3), one-way ledges, a "greed" slider that inflates the heuristic for suboptimal-but-fast paths with a path-cost penalty, and adversarial levels where one obvious placement is a trap because a bottleneck makes it useless. A ghost overlay replays the plain-octile-distance baseline behind your run so the improvement is visible as an area, not a number.

## Technical approach

TypeScript, canvas 2D, no engine. Maps come from the Moving AI Lab benchmark set — the freely downloadable `.map` ASCII grids from Dragon Age: Origins, Baldur's Gate II and the street/room collections — parsed client-side, which gives hundreds of hand-authored, genuinely interesting topologies for free. Per landmark, run one Dijkstra over the traversable grid to fill an `Int32Array` distance field (512×512 = 256K entries, ~1MB each, trivially fast). A* uses a binary heap with a fixed tie-break on lower g, so node counts are deterministic and leaderboard-comparable. Par is computed offline per level by farthest-point sampling with 500 random restarts, taking the best; three-star is par, two-star is 1.3×. The hard part is game feel: node count is an abstract scalar, so the expansion animation has to be fast enough to sit through twenty times yet legible enough to read failure — solved by animating in expansion-order batches sized to keep every query under 1.2 seconds, plus a heat overlay showing which tiles were searched across all twenty queries, which is the actual diagnostic the player learns to read.

## v1 scope

- Ten hand-picked maps, uniform cost, octile movement
- Landmark placement + Run + node count vs par
- One animated query, then aggregate heat overlay for the rest
- Baseline ghost comparison

## Out of scope

Weighted terrain, the greed slider, level editor, online leaderboard, mobile.

## Risks & unknowns

The skill ceiling may be low — if farthest-point sampling is near-optimal on every map, there's no game. Mitigation is authoring levels where the optimal set is deliberately non-obvious (long dead-end peninsulas, symmetric rooms). Twenty queries may be tedious; may cut to eight.

## Done means

A player who has never heard the phrase "differential heuristic" beats par on level 5, and can say out loud why the corner of the map was the right place to stand.
