## Overview

A browser toy and poster-maker built on one idea: blue noise is not a filter, it's a *phase*. Point distributions used for stippling are a 2D Gibbs ensemble with a repulsion potential — at low temperature they crystallize into a triangular lattice, at high temperature they're a Poisson gas, and the useful blue-noise spectrum lives only in the liquid phase between. Melting Point exposes temperature as the main dial and lets you watch an image dissolve and freeze.

For: generative artists, plotter people, and anyone who thinks a dither slider is boring.

## Problem

Every stippling tool ships a single opinionated algorithm (Lloyd relaxation, Wang tiles, void-and-cluster) and one output. The physics underneath — that these are all points in one phase diagram — is invisible, and nobody has made it beautiful. Meanwhile the interesting artifacts (the moiré of an over-crystallized region, the grain of a hot one) are exactly what's been engineered away.

## How it works

- Drop in an image. Its luminance becomes a density field ρ(x,y) targeting local point density.
- One slider: **T**. Metropolis-Hastings runs continuously over the point set with energy `E = Σ_pairs φ(r_ij / r0(ρ))` where φ is a soft-core repulsion; proposals are accepted at `exp(-ΔE/T)`.
- Watch it live: at T≈0 the points snap into hexagonal grains with visible domain boundaries and the picture vanishes into texture. At high T they scatter and the picture drowns in shot noise. Around T*, it's legible and gorgeous.
- **The poster mode (the mischief):** tile the canvas and run each tile at a different T, laid out as an actual phase diagram. The image fades into existence across the sheet and back out. Export SVG single-stroke or point sets for an AxiDraw.
- A live radial power spectrum sits beside the canvas so you can see the blue-noise annulus form and dissolve.

## Technical approach

TypeScript + WebGPU compute. Points in a storage buffer; neighbor queries via a uniform spatial hash rebuilt each step (cell size = 2× interaction radius) so energy deltas are O(neighbors). Metropolis in parallel needs care: use a checkerboard/graph-coloring scheme over hash cells so no two simultaneously-proposed moves are within interaction range — this keeps detailed balance approximately intact, which is the genuinely hard part and the thing most GPU implementations quietly get wrong.

Density coupling: `r0(ρ) = k / sqrt(ρ)` so the equilibrium spacing tracks local luminance. Spectrum panel: radially-averaged periodogram of the point set via a 512² splat + FFT (`fft.js` on CPU is fine at 4 Hz).

Annealing schedule presets: quench (instant crystal grains), slow anneal (large single-crystal domains), hold-at-T* (classic blue noise).

## v1 scope

- Single canvas, one image, one T slider, ~40k points at 60fps
- Live power-spectrum plot
- PNG export

## Out of scope

- Color/multi-plate separation, video input, the tiled phase-diagram poster (that's v2), physical plotter drivers.

## Risks & unknowns

- The legible band may be uncomfortably narrow, making the slider feel broken — may need log-scale T and auto-centering on the estimated T*.
- Parallel Metropolis with coloring may still bias the ensemble; needs a CPU single-threaded reference to diff spectra against.
- WebGPU availability/perf on Safari.

## Done means

Sweeping T on a 512×512 portrait visibly passes through three regimes, the spectrum panel shows the blue-noise annulus appear and vanish in step with it, and the T* output is visually indistinguishable from void-and-cluster blue noise in a side-by-side.
