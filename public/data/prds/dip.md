## Overview
Dip is a tactile browser toy (and screensaver mode) that simulates real soap films spanning wire frames. You sculpt a closed wire boundary in 3D — two rings, a twisted loop, a knot — and the film relaxes in real time to the minimal surface (least area for that boundary), the same physics a soap film obeys. It's for the physics-curious, teachers, and anyone who likes watching a system find its lowest-energy shape.

## Problem
Minimal surfaces (catenoids, helicoids, Costa's surface, Plateau borders) are one of the most beautiful results in geometry, but every online demo is either a static pre-rendered gallery or a parametric plot of a *known* solution. Almost none let you *dip your own frame* and watch the film discover the surface — including the dramatic topology changes (a catenoid pinching in two when you pull the rings apart). That moment is the whole point and it's basically unbuilt as an interactive toy.

## How it works
You draw/drag control points to define a wire boundary. A triangulated membrane is stretched across it and then relaxed: each interior vertex moves down the gradient of surface area (discrete mean-curvature flow) while boundary vertices stay pinned to the wire. As area shrinks the film pulls taut; when a neck gets too thin, the toy detects it and performs a topology surgery (pinch-off), letting a catenoid collapse into two disks — the real instability. Presets snap the wire into classic frames; a slider separates the rings so you can hunt the exact ratio where the film gives up.

## Technical approach
Stack: TypeScript + WebGL2 (regl or three.js) with the sim in a compute-ish fragment pass or a Web Worker. Data model: half-edge triangle mesh, pinned boundary vertex set, per-vertex position. Core algorithm: cotangent-Laplacian discrete mean-curvature flow (x ← x − dt·H·n), area-based step control, plus adaptive remeshing (edge collapse/split to keep triangle quality as the film stretches). Topology surgery: detect min-cut necks by tracking the narrowest ring of edges; below a radius threshold, split the mesh and cap. Render with thin-film interference shading (path-difference → wavelength → RGB) so the film shimmers like real soap. The genuinely hard part is stable remeshing + robust pinch-off without the mesh exploding — that's the whole engineering story.

## v1 scope
- Three preset frames: two-ring catenoid, twisted band, tetra frame
- Real-time mean-curvature relaxation with cotangent Laplacian
- One topology event: catenoid pinch-off with a ring-separation slider
- Iridescent thin-film shading + orbit camera

## Out of scope
- Freeform wire drawing from scratch
- Wet-foam / multi-film Plateau junctions
- VR / touch, export to STL

## Risks & unknowns
- Remeshing stability under large deformation is the make-or-break
- Pinch-off detection false positives on thin-but-stable necks
- Perf: keeping 60fps while remeshing every step on mid-range GPUs

## Done means
Separating the two rings past the analytic critical ratio (~1.33× the neck radius rule) makes the on-screen film actually pinch and collapse into two flat disks, unprompted, at 60fps — matching the real soap-film instability.
