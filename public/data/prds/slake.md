## Overview
Slake is a browser puzzle-sandbox about *durability by design*. You formulate an ancient-style concrete — aggregate size, pozzolan (volcanic ash) ratio, and hot-mix lime clast density — pour it into a structure, and watch a compressed two-millennia weathering simulation decide whether it survives. It's for tinkerers who loved the HN story about the 1,900-year-old latrine revealing why Roman concrete self-heals, and who nod at the "SQLite should have editions" ethos of building things meant to outlive us.

## Problem
Modern engineering optimizes for day-one strength; Roman concrete optimized for century-three resilience via self-healing lime clasts that dissolve and re-precipitate calcite into fresh cracks. That mechanism is delightful, legible, and completely unexploited as a game. There's no toy that lets you *feel* the tradeoff between initial strength and long-term self-repair.

## How it works
A level gives you a load (an arch, a pier in surf, a cistern wall) and an environment profile (freeze-thaw cycles, chloride-rich seawater, seismic ticks). You spend a fixed budget across mix parameters. Hit "cure," and the sim runs a millennium-per-few-seconds. Micro-cracks nucleate from stress and frost; when water reaches a crack adjacent to a lime clast, the clast dissolves and re-precipitates, healing the crack — but only so many times per clast. Too few clasts and cracks network into collapse; too many and you've traded away compressive strength and it crushes on day one. You're scored on centuries-survived and a shareable "ruin state" screenshot.

## Technical approach
Pure client-side: TypeScript + a 2D grid cellular automaton on a canvas/WebGL. Each cell carries material type (aggregate/matrix/clast/void/water), local stress, and saturation. Rules per tick: elastic stress relaxation (a cheap iterative solver), crack propagation when local tensile stress exceeds a threshold, water diffusion through crack networks, and the clast heal rule (consume clast "charge" to convert adjacent crack cells back to matrix). Environment schedules drive freeze-thaw expansion and chloride attack on the matrix. Hard part: making a physically *plausible* strength/healing tradeoff that's tunable enough to have a real skill curve, and keeping a 2,000-tick sim at 60fps — likely a coarse grid with GPU-side stress relaxation and clever batching of the healing pass.

## v1 scope
- One structure (a single arch) and one environment (freeze-thaw)
- Three tunable mix sliders: aggregate ratio, clast density, pozzolan ratio
- Deterministic seeded sim + centuries-survived score + share image

## Out of scope
- Real FEA accuracy or validated material constants
- 3D structures, multiplayer, campaign/tech tree

## Risks & unknowns
The physics is caricature; getting it to *feel* right without being a solver is the whole risk. Performance on the healing pass across large grids is unproven.

## Done means
A player can complete the arch level, and two mixes that differ only in clast density produce visibly different, deterministic 2,000-year outcomes (one collapses, one survives) from the same seed.
