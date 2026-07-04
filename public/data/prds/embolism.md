## Overview
Embolism is a slow survival-sim where you play the vascular system of a redwood-scale tree, keeping water flowing to the canopy across a growing season. It fuses two front-page HN items: 'Giant trees have no trouble pumping water to top branches' (xylem tension, cohesion-tension, cavitation) and 'FreeBSD ate my RAM' — embolisms behave exactly like leaked memory pages that permanently block a resource path until you route around them.

## Problem
Most idle/sims are about hoarding numbers. There's a gorgeous, real, under-used mechanic hiding in plant hydraulics: water is pulled up under negative pressure, and when it cavitates, that conduit is dead forever — a genuine, irreversible resource-fragmentation problem that maps beautifully onto memory management but has never been a game.

## How it works
- The tree is a branching graph of xylem conduits, each with a flow capacity. Sunlight sets canopy demand (transpiration pull) that rises through the day.
- Heat + drought raise tension; when tension exceeds a conduit's threshold it embolizes (air bubble) and is removed from the flow network — permanently, unless refilled.
- Overnight, root pressure lets you refill a limited number of embolized conduits and grow a few new ones. You allocate that nightly budget: refill vs. grow vs. reinforce.
- Survive to the end of season; canopy tiles that go too long without water die and cut your score. Fragmentation compounds — the late game is keeping a shrinking network fed, like defragging under load.

## Technical approach
Single-page canvas game, TypeScript, no backend. Data model: a directed graph (nodes = junctions, edges = conduits with capacity + tension threshold). Each tick solves flow as a max-flow / electrical-network analogy (conduits = resistors, canopy demand = current sink, roots = source) — a Laplacian solve or simple iterative relaxation over the graph gives per-edge flow and tension. Embolism = threshold event that deletes an edge and re-solves; the cascade (removing one conduit raises tension on neighbors) is the emergent difficulty, straight out of cohesion-tension theory. Weather is a seeded day/heat curve. Save state in localStorage. Hard part: keeping the flow solve cheap enough to run every tick on a graph of thousands of edges — solved with an incremental re-solve seeded from the previous solution rather than from scratch.

## v1 scope
- One fixed-topology tree, ~500 conduits
- Day/night loop with heat-driven embolism
- Nightly refill/grow budget
- Season timer + final canopy-survival score

## Out of scope
- Procedural tree growth into arbitrary shapes
- Multiple species, soil chemistry, pests
- Leaderboards / online play

## Risks & unknowns
- Flow solve perf on large graphs each tick
- Making cavitation cascades feel fair, not random
- Whether the metaphor reads to players who don't know xylem

## Done means
A season plays start to finish; forcing a heat spike triggers a visible embolism that removes a conduit and measurably reduces downstream flow, canopy tiles cut off from water change state, and a good nightly refill choice keeps the score higher than ignoring the network.
