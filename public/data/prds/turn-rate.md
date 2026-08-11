## Overview
A browser drawing toy for people who care about smooth curves — type designers, logo people, CNC/road-geometry nerds, anyone who has ever squinted at a curvature comb. Instead of dragging Bézier handles and inspecting the resulting curvature, you draw the **curvature profile** κ(s) directly and watch the outline it implies materialize above it. The curve is the output, not the input.

## Problem
Every vector tool works in position space, but "smooth" is a property of the second derivative. G2 discontinuities — the visible kinks in a logo that nobody can name — are invisible in the handle view and obvious in the curvature comb. Designers already read combs; nobody lets them *edit* one. Meanwhile the shapes that are trivially expressible in curvature space (Euler spirals, elastica, clothoid transitions) are miserable to build out of cubics.

## How it works
Split screen. Bottom pane: a κ-vs-arclength editor — a horizontal axis of arclength, a freehand/handle-editable curve for signed curvature, with a zero line. Top pane: the integrated shape, redrawn live.

Integration is the Whewell/Cesàro relation: θ(s) = θ₀ + ∫κ ds, then (x,y) = ∫(cos θ, sin θ) ds. Flat κ → circular arc. Linear ramp → Euler spiral. Sine → a wave that closes on itself if you're lucky.

The headline button is **Close It**. An arbitrary κ profile leaves the curve open; closure requires three constraints (∮κ ds = 2πk, ∮cos θ ds = 0, ∮sin θ ds = 0). Press it and a Gauss–Newton solve nudges your profile by the smallest L2 change that satisfies all three — your scribble visibly relaxes into a closed shape without losing its character.

Second mode: drop in an SVG path, see its comb, notice the jumps, smooth them by dragging in κ space, export cubics back out.

## Technical approach
TypeScript, canvas2d, no framework. κ stored as a cubic B-spline over arclength, sampled at 2000 points; integrate with RK4 (naive Euler visibly drifts on closure). Closure solve: 3 residuals, Jacobian by analytic differentiation of the integrals w.r.t. control-point weights, damped Gauss–Newton, ~10 iterations at 60fps. SVG import via `svg-path-parser`; curvature of a cubic computed analytically, arclength by adaptive Gauss–Legendre. Export: resample the integrated curve and fit cubics with Schneider's algorithm, splitting at κ extrema so the fit doesn't smear detail.

The genuinely hard part is making "Close It" feel like a gentle magnet rather than a lottery — regularize toward the user's profile, and detect when no closure exists nearby (κ never changes sign) instead of flailing.

## v1 scope
- One κ editor, one shape view, live integration
- Close It (single winding number, k=1)
- Four presets: arc, Euler spiral, elastica loop, sine
- Export SVG of the sampled polyline (no Bézier fit)

## Out of scope
SVG import, Bézier export/refit, 3D space curves (torsion), multi-contour glyphs, any account or save-to-cloud.

## Risks & unknowns
Freehand κ input may be too noisy to be pleasant — may need aggressive smoothing or handle-only editing. Unclear whether designers actually want to work here or just want a better comb readout. Closure solve can be ill-conditioned for near-degenerate profiles.

## Done means
I draw a squiggle in the curvature pane, press Close It, and get a closed, visibly smooth blob whose comb has no jumps; the Euler-spiral preset matches a reference clothoid to <0.5% deviation over its length.
