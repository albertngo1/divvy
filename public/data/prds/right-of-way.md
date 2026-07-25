## Overview
A solo optimization puzzle about reconnecting habitat that roads have cut in half. You get a real landscape, a road slicing through it, a budget, and a menu of crossing structures (canopy bridge, box culvert retrofit, wildlife overpass, exclusion fencing). You place them; the map re-lights. It's for the SimCity/Factorio-brained player and for conservation nerds who have read about circuit-theory connectivity but never gotten to *play* with it.

## Problem
Landscape connectivity is one of the few ecology subfields with a beautiful, exact mathematical core — it models animal movement as electrical current through a resistance surface — and it is entirely locked inside ArcGIS plugins and Circuitscape scripts that take minutes per run. Nobody has made the feedback loop fast enough to be a *toy*. Meanwhile every player intuitively understands "the road killed the forest" but has no intuition for why one crossing at kilometer 8 is worth ten crossings at kilometer 3.

## How it works
A turn is a decade. You see a habitat raster with the road burned in as near-infinite resistance, and a heatmap of current density — where animals actually try to move. Hovering a candidate crossing site previews the delta; placing it costs money and instantly redraws the flow. Score is composed of three legible numbers: effective resistance between the two core habitat patches, simulated annual roadkill (current density crossing the road × traffic volume), and a genetic diversity index that decays or recovers over turns. A crossing at a pinch point where current is already piling up is worth twenty times one in dead space — the heatmap tells you, but only if you learn to read it. Later turns add development pressure (new subdivisions raising resistance), a maintenance budget, and species with different resistance surfaces that disagree about where the bridge should go.

## Technical approach
Resistance surface from ESA WorldCover 10m or NLCD land cover, reclassified per species; roads from OSM via Overpass; traffic volume from state DOT AADT shapefiles. Build an 8-connected grid graph, weight = 1/mean resistance, form the Laplacian L. Effective resistance between nodes s,t is (e_s−e_t)ᵀL⁺(e_s−e_t); current density is recovered from the potential vector.

The trick that makes it a game: a crossing is a single edge whose conductance changes, i.e. a **rank-one update** to L. Precompute L⁺ columns for the ~200 candidate crossing nodes once (200 AMG-preconditioned CG solves, offline, seconds each), then every placement is exact Sherman–Morrison algebra on a small dense matrix — sub-millisecond. Only the full current-density render needs a solve, and that's one warm-started CG. Core in Rust (`sprs` + an AMG preconditioner) compiled to WASM; rendering in WebGPU. The genuinely hard part is keeping the precomputed basis valid as *terrain* resistance also changes (development), which is not rank-one — v1 sidesteps it by re-baking between chapters.

## v1 scope
- One hand-picked 512×512 corridor, one species, one road
- 12 candidate crossing sites, 2 structure types, fixed budget
- Score = effective-resistance drop only; no turns, no economy
- Current-density heatmap + a "before/after" ghost overlay

## Out of scope
Campaign, multiple species, real-time traffic, procedural landscapes, mobile, any claim of being a planning tool.

## Risks & unknowns
Circuit theory may be *too* smooth to produce interesting decisions — if the optimum is always "the biggest pinch point," there's no game, and the fix is budget granularity plus species disagreement. Resistance reclassification is scientifically contested; the game must own that it's a model, not an oracle. WASM memory at 1M-node grids.

## Done means
On a real 512×512 corridor, placing a crossing updates the effective-resistance score in under 100 ms and the heatmap in under 400 ms, and the incrementally-computed resistance matches a from-scratch dense solve to within 1e-6.
