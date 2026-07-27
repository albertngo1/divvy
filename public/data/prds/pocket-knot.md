## Overview
A browser toy that reproduces one of the great deadpan physics results — Raymer & Smith's *Spontaneous Knotting of an Agitated String* (PNAS 2007) — as something you can fiddle with. You set string length, stiffness, and box size; you tumble it; then you virtually grab both ends and lift, and the app names the knot that formed. For anyone who has ever pulled headphones out of a pocket and wondered who did that.

## Problem
The intuition is universal and the real result is delightful and specific: knot probability climbs steeply with length and then saturates near 1, stiffness suppresses knotting, and the knots that appear are drawn from a real distribution across prime knots up to 7 crossings. All of it lives in a paywalled PDF and a few grainy figures. There is no way to *play* with it, and knot identification — the part that makes it science instead of a screensaver — is exactly the part nobody exposes.

## How it works
Sliders: length (0.2–5 m), diameter, bending stiffness, box edge, tumble rate, seed. Press **Tumble** — the box rotates for 30 simulated seconds while the cord writhes. Press **Lift** — the two endpoints are pulled apart until the curve is taut. The verdict appears: *unknot*, *3₁ trefoil*, *4₁ figure-eight*, *5₁*, … plus its determinant and crossing number. Every run drops a tick into two persistent charts you're building yourself: a knot-type histogram, and P(knot) vs. length. Watching your own curve converge onto the published one is the whole payoff.

## Technical approach
Simulation: discrete elastic rod (Bergou et al. 2008) — centerline masses with bending and twisting energy, inextensibility enforced by XPBD distance constraints. Self-contact via uniform spatial hash with capsule–capsule tests and Coulomb friction; **friction is not optional**, the real result depends on the cord gripping itself. Rust → wasm-bindgen, stepped in a Web Worker; three.js tube geometry for render.

Identification is the interesting half. Close the open curve by routing a path from one endpoint out around the bounding sphere to the other. Geometrically pre-simplify (curve-shortening relaxation with self-intersection guards) — this matters enormously. Project onto a random plane, extract segment crossings and their signs, build a Gauss code, reduce with Reidemeister I/II moves on the code, then compute the Alexander polynomial as the determinant of the Alexander matrix and report |Δ(−1)|. Disambiguate equal-determinant pairs with HOMFLY via Kauffman skein recursion on the reduced diagram.

The genuinely hard part: a naive projection of a tumbled 3-meter rod yields a 400-crossing Gauss code, and skein recursion on that never terminates. All the engineering is in geometric simplification *before* topology, plus numerically robust crossing extraction when segments are near-tangent in projection.

## v1 scope
- One box, one stiffness, fixed 30 s tumble.
- Classify only: unknot / trefoil / "bigger than trefoil", using the determinant alone.
- One chart: P(knot) vs. length, filled in by the user's own runs.

## Out of scope
Twist/writhe decomposition, untangling gameplay, multiple cords, mobile perf, exporting knot diagrams.

## Risks & unknowns
The rod solver may not knot at all if friction or self-collision resolution is too soft — the failure mode is a cord that slides through itself and always reports unknot. Real-time in a browser at useful segment counts is not guaranteed; fallback is offline batch runs with playback.

## Done means
Run 50 tumbles at each of five lengths: P(knot) rises monotonically with length, exceeds 0.5 somewhere past ~1.5 m, and at least one trefoil and one non-trefoil knot are correctly identified against a hand-checked diagram.
