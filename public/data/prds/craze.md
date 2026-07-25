## Overview
Craze is a browser toy and quiet tool for potters: paste a glaze recipe, pick a clay body and a glaze thickness, and it simulates the craquelure — the crack network that forms when the glaze's coefficient of thermal expansion (CTE) doesn't match the body's. Output is an animated, seeded crack pattern you can export as SVG/PNG, plus a plain verdict: fine crazing, coarse islands, no crazing, or shivering (glaze in compression, popping off edges). Every run with a new seed gives a different, physically-plausible pattern, so it doubles as a generative-art press.

## Problem
Glaze calculation software (Insight, Glazy) will happily hand a potter a number: "calculated CTE 7.4×10⁻⁶/K." That number means nothing to most people holding a bucket. The thing potters actually care about is a *picture*: will this craze, and will it be the fine hairline web you wanted or ugly half-inch islands? That maps to real physics — mean crack spacing scales with film thickness and stiffness ratio — and nobody has bridged the arithmetic to the image. Meanwhile everyone else just wants a beautiful, endlessly-varying crackle generator that isn't a Voronoi diagram pretending.

## How it works
1. Enter a recipe (or paste a Glazy recipe's UMF) → compute the unity molecular formula, then CTE by Winkelmann–Schott additivity: α = Σ (mole fraction of oxide × its expansion coefficient).
2. Pick clay body from a small table (porcelain, stoneware, earthenware) with its own α, plus firing/cooling ΔT and glaze thickness.
3. Stress in the glaze film: σ ≈ E_g·(α_g − α_b)·ΔT / (1 − ν). Positive → tension → crazing. Negative → shivering.
4. Simulate. Watch cracks propagate and bifurcate across the tile, each one relieving stress in a band around itself, until the remaining stress everywhere is below local strength. Scrub the timeline, re-roll the seed, export.

## Technical approach
Stack: TypeScript + WebGL2 (or just canvas at 512² — it's fast enough), no backend. Chemistry: a bundled materials/oxide table (feldspars, silica, whiting, etc.) and Winkelmann–Schott coefficients; UMF computed with straightforward stoichiometry.

The crack simulation is the interesting part and is *not* Voronoi. Model the glaze as a thin elastic film on a rigid substrate, discretized on a Delaunay triangulation of jittered points. Each edge gets a Weibull-distributed failure strength (this is where the seed lives). Sequential fracture loop: find the edge with the highest stress-to-strength ratio, break it, then relieve stress in its neighborhood using a shear-lag kernel — stress recovers over a transfer length λ ∝ glaze thickness × √(E_g/E_interface), so an existing crack shadows a band of width ~2λ beside it. Repeat until no edge exceeds its strength. This hierarchical relief is what produces the real craquelure signature: cracks meeting existing cracks at ~90°, and a log-normal island-size distribution whose mean spacing tracks film thickness — the thing a Voronoi generator gets visibly wrong.

Render islands as filled polygons with a slight per-island tone jitter and stained crack lines. Shivering mode instead peels the film at convex edges.

## v1 scope
- Three hardcoded clay bodies, one ΔT slider, one thickness slider.
- Paste UMF numbers directly (no recipe→UMF conversion yet).
- Flat square tile only. 512² triangulation.
- PNG export with the seed and parameters stamped in the corner.

## Out of scope
- Recipe database import, firing schedules, curved/3D pot geometry.
- Delayed crazing from moisture expansion.
- Predicting color, opacity, or melt behavior.

## Risks & unknowns
Winkelmann–Schott is a crude additive model and fails on boron-heavy glazes; the honest framing is "directionally right, not a lab." Real crack spacing constants need calibrating against photos of known glazes. The sequential-fracture loop may be slow enough to need incremental stress updates rather than a full relax each step.

## Done means
Two recipes with a known CTE gap — one that crazes and one that doesn't — produce visibly correct outcomes, and doubling the thickness slider roughly doubles the mean island size in the exported pattern.
