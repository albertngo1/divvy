## Overview
Bucket Brigade is a daily routing puzzle set in Jan van der Heyden's 17th-century Amsterdam — the man who literally invented the modern hose-and-pump fire department (HN: 'How Amsterdam invented the fire department'). Each day a house catches fire somewhere on a canal-laced grid; you drag continuous hose lines from water sources to the blaze under a length/time budget and chase a global par.

## Problem
History posts on HN get read once and forgotten. The Van der Heyden story is a genuinely elegant systems-design tale (networked hoses, staged pumps) that's begging to be *played*, not just read. And there's no cozy, brainy daily puzzle in the 'lay a network under constraints' genre the way there is for words and geography.

## How it works
1. A date-seeded map generates a canal grid, building footprints, and one ignition point.
2. You place pump stations (limited count) and draw hose segments along streets/bridges; hose has max run length before it needs a pump to re-pressurize.
3. Fire spreads on a timer to adjacent flammable tiles each 'tick'; water reaching the fire tile extinguishes it and halts spread.
4. Score = total hose length + pumps used + tiles burned, lower is better. You see your rank vs today's par and a shareable result. One puzzle a day, everyone same seed.

## Technical approach
Static site, canvas/SVG rendering, TypeScript. Map generation: Poisson-disc canal seeds → carve a planar graph of streets; buildings are cells with a flammability weight. The routing core is a constrained shortest-path / Steiner-ish problem: hose reachability = BFS/Dijkstra over the street graph with edge cost = length, cut every `maxRun` tiles unless a pump node sits inline. Fire spread is a simple weighted cellular automaton over building cells (probabilistic ignition scaled by adjacency and wind vector). Par is precomputed by the author running a greedy-plus-local-search solver (nearest-source Dijkstra + 2-opt on pump placement) at build time and storing the score. Leaderboard on Cloudflare Workers KV keyed by date. Hard part: making the pump/re-pressurize mechanic legible and the fire timer tense-but-fair — tuned via the CA spread rate and the free-time budget.

## v1 scope
- One daily generated map, single ignition
- Hose drawing + `maxRun` pump mechanic
- Fire CA on a tick timer
- Score vs precomputed par, emoji share, static top-20 board

## Out of scope
- Multiple simultaneous fires, wind gusts mid-round
- Campaign/story mode, historical vignettes
- Real multiplayer

## Risks & unknowns
- Generated maps that are unsolvable or trivial
- Par solver quality (greedy may be too easy to beat)
- Touch UX for drawing hose on mobile

## Done means
Loading the site twice on the same date yields the identical map; a route that reaches the fire before it spreads past 2 tiles registers a win, its score compares against par, and re-drawing a shorter valid route lowers the displayed score.
