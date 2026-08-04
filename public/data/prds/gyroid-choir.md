## Overview
A browser toy (doubling as a screensaver) where you morph a triply periodic minimal surface — Schwarz P, Schwarz D, gyroid, Neovius — and the surface's *actual* vibrational spectrum is synthesized as an evolving additive chord. For people who like generative audio but are bored of arbitrary parameter-to-pitch mappings, and for the 3D-printing/lattice crowd who have only ever seen these surfaces as silent geometry.

## Problem
TPMS are among the most beautiful objects in applied math, and their entire cultural footprint is "infill pattern for a lightweight bracket." Meanwhile generative music toys map sliders to frequencies through mappings the author invented over lunch — nothing is *heard* about the object. There is a real spectrum sitting inside these surfaces (the Laplace–Beltrami eigenvalues, the "Shape-DNA") and nobody has ever played it.

## How it works
A level-set field is built as a weighted sum of the standard trig approximants (gyroid: sin x cos y + sin y cos z + sin z cos x). One slider morphs the weights between families; a second sets the level constant c, which changes wall thickness and, past a critical value, the genus of the unit cell. The lowest ~48 nonzero eigenvalues λ_k become partials at f_k = f₀·√(λ_k/λ₁). A slowly wandering excitation point x on the surface sets each partial's amplitude from |φ_k(x)|, so *where* the surface is struck changes timbre. The payoff: crossing the genus transition audibly reshuffles the whole spectrum — a topology change you can hear.

## Technical approach
Precompute offline in Python: numpy field on a 96³ periodic grid → `skimage.measure.marching_cubes` → cotangent Laplacian + Voronoi mass matrix (libigl) → `scipy.sparse.linalg.eigsh(sigma=0, which='LM')` for 50 modes, swept over a parameter grid (~12 morph × 10 level values to start). Store λ_k plus |φ_k| sampled at 32 fixed fundamental-domain points as a float16 tensor (a few hundred KB). Runtime: TypeScript, WebAudio additive synth (48 `OscillatorNode`s with per-partial gain, or one AudioWorklet doing the sum), Three.js fragment shader raymarching the implicit surface directly — no mesh needed on the client. The genuinely hard part is **mode tracking**: eigenvalues cross and swap index between adjacent grid points, so naive interpolation produces wrong glissandi and clicks. Fix in precompute with continuation — Hungarian assignment on |⟨φ_i, φ_j⟩| between neighboring parameter samples — so each partial follows one mode.

## v1 scope
- One morph axis only (gyroid ↔ Schwarz P), fixed level constant
- 24 partials, fixed excitation point (no strike positioning)
- Raymarched visual, one slider, spacebar to freeze
- Precompute committed as a static binary blob

## Out of scope
MIDI, audio export, convolution reverb from the surface's own impulse response, VR, real (non-trig) minimal surfaces.

## Risks & unknowns
High-index eigenvalue ratios may cluster into inharmonic mush — mitigate by pruning near-degenerate modes and rolling off amplitude ∝ 1/λ. Precompute may take hours per axis. Mode tracking may still fail at exact degeneracies (symmetry points), audible as a pop.

## Done means
Dragging the morph slider 0→1 gives a continuous, click-free timbral sweep, and in a blind A/B the builder can identify which of two recordings crossed the genus transition.
