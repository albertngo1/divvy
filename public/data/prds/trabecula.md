## Overview
Trabecula is a browser puzzle game where each level is a structural design problem: a rectangular design domain, some fixed supports, a stated load, and a mass budget. You run a real topology optimizer and watch material dissolve away into a bone-like lattice. Then the level applies a *hidden* stress test — a load case you were warned about only qualitatively — and your elegant structure either holds or fails in front of you. For people who like Zachtronics-shaped optimization games and anyone who has ever had to explain overfitting.

## Problem
Interactive topology-optimization demos exist and are lovely, but they're sandboxes: you optimize, you get a pretty answer, you leave. They teach the algorithm and hide the actual engineering lesson, which is that a structure optimized hard against one load case is *brittle* against every other one. That lesson is exactly the same shape as overfitting in ML, and nobody has made it a game.

## How it works
1. A level states: domain, supports, published load(s), target mass fraction, and a vague hint — "wind may come from either side," "the payload sometimes shifts aft."
2. You set the knobs: mass fraction, filter radius (min feature size), penalization power, and optionally paint keep-out/keep-in regions.
3. SIMP runs live; you watch the density field converge into trusses over ~60 iterations.
4. Submit. The game samples N hidden load cases from the level's true distribution, solves each, and animates the max-von-Mises element going red and the structure buckling if it exceeds yield.
5. Score = (mass saved) × (worst-case survival margin). A structure that's featherweight and fails on case 7 loses to a slightly chunkier one that survives everything.
6. Later levels introduce printability: a 45° overhang check that rejects unsupported spans, and a minimum-strut-width rule.

## Technical approach
- TypeScript + WASM. Port the classic 88-line SIMP formulation: bilinear quad elements on a 120×60 grid (~14.7k DOF), one precomputed element stiffness matrix K0, global K assembled into CSR typed arrays.
- Solve KU=F with Jacobi-preconditioned conjugate gradient — plenty fast for interactive iteration at this size; reuse the previous iterate as a warm start.
- Optimality-criteria density update with a bisection on the Lagrange multiplier; density (Helmholtz or convolution) filter with radius rmin to kill checkerboarding.
- Hidden-load evaluation: same solver, new F vectors; compute per-element von Mises from U and compare against a yield constant.
- Rendering: density field to a canvas as a grayscale texture, plus a marching-squares contour at ρ=0.5 for the "clean" bone silhouette and the failure animation.
- Hard part: making failure *legible*. A linear FEA doesn't actually break; it just reports high stress. Need a convincing fracture animation — propagate element removal from the overloaded element along the max-stress gradient and re-solve a few times so the collapse looks causal rather than decorative.

## v1 scope
- One level: the standard MBB/cantilever domain, one published tip load.
- Two knobs: mass fraction, filter radius.
- One hidden load, drawn at ±30° from the published direction.
- Pass/fail + mass number. No scoring curve, no level select.

## Out of scope
- 3D. (2D is the whole v1.)
- Robust/stochastic optimization as a player-facing tool — the game's point is that the player invents it manually.
- Real material libraries, nonlinear FEA, actual buckling analysis, export to STL.

## Risks & unknowns
- The lesson may land too fast: after two levels the player just over-thickens everything and wins. Needs a mass budget tight enough that hedging costs real points.
- CG convergence on near-void regions (ρ→0) can stall; needs a density floor of 1e-3.
- Fine line between "puzzle" and "homework" — the failure animation is what makes it a game, so it has to be genuinely satisfying.

## Done means
A browser page where 60 SIMP iterations complete in under three seconds, the converged cantilever visibly matches the canonical published solution, and a ±30° hidden load causes a mass-fraction-0.25 design to fail while a 0.35 design survives — with the failure animated element-by-element.
