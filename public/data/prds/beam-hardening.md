## Overview
A single-player deduction puzzle game. Each level hands you a small set of X-ray projections through an unknown 2D slice and asks you to paint the slice: air, soft tissue, bone, steel. It plays like a Nonogram whose clues are continuous and physically simulated, for people who like Picross but have run out of Picross.

## Problem
Grid-deduction puzzles have a solved-forever feel: constraints are exact, the answer is unique, and the only variable is size. Meanwhile the actual inverse problem that CT solves — few views, noisy data, physics that violates the linear model you're inverting — is dramatically more interesting and nobody has made a game out of it.

## How it works
A level is a 16×16 (later 32×32) grid of material labels. You are shown k projection profiles (k starts at 4, drops to 2 in late levels) at given angles, rendered as line graphs along the detector.

You paint materials into the grid. A live overlay shows your simulated projections against the target's, plus a residual score.

**The twist that carries the game:** the forward model is polychromatic. Steel preferentially absorbs low-energy photons, so rays through two steel objects come out *harder* than the linear model predicts — producing the classic dark streak between them and bright cupping around them. A naive solver that treats the data as linear will happily place phantom low-density blobs to explain the streaks and reach residual ≈ 0 with a wrong slice. So a perfect fit is the failure state. You must recognize "that dip is an artifact, not a hole," mark the steel, and let the artifact go unexplained.

Progression: a run is a shift of patients. Currency buys extra projection angles, a dual-energy scan (two spectra — resolves steel instantly, expensive), or a metal-suppression filter that costs resolution. Grading is per-region: miss a bone fracture line, take a penalty; over-call steel, waste the department's budget.

## Technical approach
TypeScript + canvas, no engine. All simulation runs client-side on grids ≤ 32×32, which is trivially fast.

- **Forward model:** discretize a spectrum into 8 energy bins (a 120 kVp tungsten spectrum, tabulated once). For each bin: `I_e = I0_e · exp(−Σ μ_material(e) · path_length)`. Sum bins, take −log. Mass attenuation coefficients come straight from the NIST XCOM tables for water, cortical bone, iron — hardcode a small table, no runtime fetch.
- **Ray integration:** Siddon's algorithm for exact voxel path lengths. ~200 rays × k angles × 8 bins per redraw — microseconds.
- **Level generation:** procedurally place 2–5 organic blobs (Perlin-thresholded) plus 0–2 steel objects, then *verify the puzzle is fair*: run a filtered-backprojection baseline and a small simulated-annealing solver over the label grid; keep the level only if the naive-linear solver converges to something visibly wrong AND a physics-aware search finds the true grid. That validator is the hard, interesting part — it's what guarantees the artifact is the puzzle rather than noise.
- **Scoring:** per-cell material match, weighted by clinical stakes; residual is shown but is explicitly *not* the score.

## v1 scope
- 16×16 grid, 3 materials (air/tissue/steel), 4 fixed angles.
- Paint tool, residual meter, submit button, per-cell grade screen.
- 12 hand-checked levels — 8 without steel to teach the honest model, 4 with.
- No run structure, no economy, no dual-energy.

## Out of scope
3D/cone-beam, real DICOM import, scatter, motion blur, any medical claim.

## Risks & unknowns
The fun hinges entirely on the moment a player realizes the residual is lying to them — if that lands as "unfair" instead of "aha," the game is dead, so level 9 must telegraph it hard. Difficulty may cliff: reading continuous projections is much harder than reading integer Picross clues, so early levels probably need discrete-valued profiles as training wheels.

## Done means
A playtester with no imaging background completes the 12-level v1, and on the first steel level their initial submission scores >0.95 on residual but <0.7 on cell accuracy — then their second attempt inverts that.
