## Overview

A solo browser puzzle game about the actual craft of pattern drafting. Each level hands you a 3D garment surface — a bodice, a raglan sleeve, a fitted bucket hat — and you must decide *where to cut it* so it can be flattened into 2D fabric pieces, then lay those pieces on a limited bolt of cloth. It is Fold-the-World in reverse: a doubly-curved surface cannot lie flat, and your only tools for absorbing that curvature are seams, darts, and ease.

For puzzle players who liked Opus Magnum's "here is a real objective function, now optimize it," and for anyone who has ever wondered why a shirt has that weird triangle under the arm.

## Problem

Most craft games abstract the craft away. Meanwhile the real skill here — where to hide a dart, when to cut on the bias, how to nest for yield — is genuinely deep, visually gorgeous, teachable in ten minutes, and has never been made into a game. The underlying math (Gaussian curvature must go somewhere) is a punchline you can *feel* rather than be told.

## How it works

Orbit the 3D garment. Draw cut curves directly on the surface with the mouse. On release, the game slices the mesh along your curves and flattens each resulting piece, showing a red/blue distortion heatmap: red where fabric would have to stretch, blue where it would bunch. Curvature you didn't cut out has to go somewhere, and it shows.

Three scores, all real: **distortion** (does it hang right), **seam length** (sewing labor — more cuts always fixes distortion, so this is the tension), and **yield** (fabric wasted when you nest the flat pieces on the bolt). Then commissions add constraints that reshape the whole puzzle: *no seam visible on the center front*; *stripe fabric — patterns must align across every seam*, which forces grainline angles and instantly makes yield brutal; *this client is asymmetric*, which kills the mirror trick.

Progression is a small run structure: five commissions, a shared fabric budget, unlockable techniques (dart rotation, slash-and-spread, gussets) that are literally new cut tools.

## Technical approach

Three.js front end; the geometry core in Rust compiled to WASM. Mesh surgery is the hard part — cutting a triangle mesh along an arbitrary user-drawn curve means projecting the screen-space stroke to the surface, snapping it to an exact geodesic (MMP / Sharp & Crane's flip-geodesics), then splitting faces and rebuilding a half-edge structure without producing degenerate slivers. Flattening uses Boundary-First Flattening for speed with ARAP as a refinement pass; distortion is read directly off per-triangle singular values of the 3D→2D Jacobian. Nesting is 2D irregular bin packing — no-fit polygon plus simulated annealing over placement order and (when grainline permits) rotation; stripe matching becomes a constraint that pins each piece's rotation and adds an offset-alignment penalty between paired seam edges. Garment meshes authored in Blender; a hidden "reference solution" per level gives the score curve.

## v1 scope

- Three levels: a cone (trivial, teaches flattening), a sphere cap (teaches darts), one bodice front
- Cuts restricted to a precomputed candidate-edge network — no arbitrary geodesic surgery yet
- Distortion heatmap + seam-length score only; no nesting, no fabric bolt
- Solid-color fabric, no stripes

## Out of scope

Cloth simulation / draping physics, exporting real sewable PDF patterns, character body customization, any multiplayer.

## Risks & unknowns

The fun may live entirely in the nesting minigame rather than the cutting, or vice versa — playtest before building both deep. Geodesic mesh cutting is where the schedule goes to die; the v1 candidate-edge restriction exists precisely to defer it. And distortion heatmaps may read as "pretty colors" rather than "this shirt will pull across the shoulder" — needs a draped preview or a wear-test animation to land emotionally.

## Done means

A player who has never sewn can, in under five minutes on the sphere-cap level, discover unprompted that adding a second dart drops distortion sharply while a third barely helps — and can say why.
