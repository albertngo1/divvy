## Overview
Grainline is a single-player browser optimization puzzle about pattern drafting: given a 3D form (a sleeve cap, a bust, a teapot cozy, a shoe last), you must decide *where to cut it open* so it can lie flat as cloth. It's aimed at the Opus Magnum / Infinifactory crowd — people who replay a solved level to shave the score — not at sewists, though sewists will recognize every word of it.

## Problem
Flattening a curved surface without distortion is *provably impossible* (Gauss's Theorema Egregium), which is exactly the tension a good puzzle wants: there is no perfect answer, only a Pareto front. Real pattern drafting is a deep spatial craft that is completely invisible to people who don't sew, and no game has stolen it. Meanwhile every "crafting" game abstracts cloth into an inventory count.

## How it works
A mesh sits on screen, rotatable. Three tools: **Seam** (click two points, a geodesic cut path snaps along the surface), **Dart** (drop a wedge whose apex and width you drag — removes material to absorb curvature), **Grainline** (set the fabric's warp direction per piece). Hit **Flatten**: pieces spring apart and drop onto a fabric roll of fixed width. Two numbers appear: **Distortion** (a per-triangle stretch heatmap, red = the fabric is lying to you) and **Waste** (roll length consumed after nesting). Par values per level, plus a histogram of everyone's scores on both axes — you can win on distortion and lose badly on yardage. Later levels add constraints: max piece count, no-seam zones on the visible front, and striped fabric where grainline mismatch across a seam is penalized.

## Technical approach
three.js front end; hand-authored meshes at 2–5k triangles with a half-edge structure built from a twin map. Seam paths = Dijkstra over a subdivided edge graph (cheap stand-in for exact geodesics). Cutting duplicates vertices along the path and recomputes connected components. Flattening = LSCM (Lévy 2002): sparse least-squares with two pinned vertices, solved by an Eigen build compiled to wasm. Distortion = singular values of each triangle's 2×2 Jacobian (σ1/σ2 for shear-stretch, σ1σ2 for area). Nesting is the sleeper difficulty — true no-fit-polygon packing is a research problem, so v1 uses rotation-limited (0/90/180°) bottom-left-fill on the piece bounding boxes. Determinism matters for shared scores: fixed iteration counts, no threading, seeded by level id. The genuinely hard part is keeping Flatten under ~80ms so it feels like a live tool, and making "distortion" legible to someone who has never held a pattern piece.

## v1 scope
- 5 hand-authored shapes, no daily rotation
- Seam + dart tools, geodesic snapping
- LSCM flatten with distortion heatmap
- Shelf-pack nesting and a yardage number
- Personal best per level in localStorage

## Out of scope
PDF pattern export, cloth simulation, user mesh upload, accounts, anything multiplayer.

## Risks & unknowns
LSCM flips triangles on pathological cuts — needs fold detection and a graceful "this cut doesn't work" state. Darts may be too abstract as a UI primitive. Nesting could dominate scoring and turn the game into bin-packing wearing a costume.

## Done means
From a cold load: pick the sleeve cap, draw two seams and one dart, hit Flatten, see 2D pieces plus a distortion score under par in under 100ms — and replaying the identical inputs reproduces the identical score.
