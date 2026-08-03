## Overview
Coat Hanger is a browser desktop toy that is also a real instrument: one length of steel wire drawn on a canvas. You bend it with the mouse, you strike it with the spacebar, and it rings. The sound is not sampled and not a filtered oscillator — it is computed from the wire's *current* shape, so bending it while it rings is a continuous timbre gesture. For sound designers, physics tinkerers, and anyone who ever held a coat hanger on a string against their ears.

## Problem
Physical-modeling synths hide behind sliders labeled "tension" and "brightness" that correspond to nothing you can see. Shape-based sound demos (bells, plates, bars) are static: you pick an object, you strike it, the object never changes. But deformation is the most legible timbre control a human has — everyone knows what an unbending wire sounds like — and no instrument exposes it. The gesture and the spectrum should be the same control.

## How it works
Drag any point on the wire; it relaxes to an elastica under your drag constraint. Click or hit space to strike at the cursor — an impulse excites the modes. As curvature rises, the partials split and go inharmonic; as you straighten it, they converge on the classic free–free bar ratios (1 : 2.76 : 5.40 : 8.93). Pin the ends and you get clamped modes instead. A "thread" toggle swaps the output coupling to the coat-hanger-on-string case: enormous low end, decay measured in seconds.

## Technical approach
Rod: 40–60 segment discrete elastic rod (Bergou et al. 2008), 2D bending only for v1, integrated implicitly at 60 fps in a Web Worker. Sound: at ~30 Hz, linearize about the current shape — build stiffness K = ∂²E/∂x² and lumped mass M, then solve the generalized eigenproblem Kφ = λMφ for the lowest ~24 modes with warm-started Lanczos seeded from the previous frame's basis. Track modes across frames by maximizing |φᵢᵀMφⱼ| so mode crossings do not pop. Audio runs in an AudioWorklet as a bank of two-pole resonators: frequency √λ/2π, Rayleigh damping α + βλ, per-mode gain = φ evaluated at the strike point times φ at the listening point. Interpolate resonator coefficients per 128-sample block with slew limiting.

The genuinely hard part is the eigen-tracking: a naive re-solve every frame produces zipper noise and swapped partials, and K must stay symmetric positive-definite through large deflections (shift-and-Cholesky, clamp the drag constraint stiffness).

## v1 scope
- One straight wire, 2D, 40 segments, no twist
- One mouse drag constraint; spacebar strikes at cursor
- 12 modes, fixed damping constants
- Desktop Chrome only, no persistence

## Out of scope
MIDI, presets, recording, twist/3D, self-collision, mobile, multiple wires.

## Risks & unknowns
A 24-mode eigensolve at 30 Hz in JS/WASM may not hold — fallback is precomputing modes over a one-parameter family of bend angles and interpolating. Modal damping realism for steel is a guess until measured. Open question: does bending read as musical, or just as noise sweeping?

## Done means
Strike the wire, then bend it slowly: the ringing partials glide audibly with zero clicks or dropouts. With the wire straight, an FFT of the output matches the analytic free–free bar ratios within 2%.
