## Overview
Sand Song turns cymatics into an instrument. You choose (or draw) a plate boundary, feed it a frequency — from a keyboard, a slider, or your own voice through the mic — and virtual sand migrates in real time to the nodal lines of the driven standing wave, painting the physically-correct Chladni figure. Freeze any moment as a high-res print. For musicians, science teachers, and generative-art tinkerers.

## Problem
Cymatics videos are everywhere but they're passive spectacle. Existing web demos hard-code a handful of circle/square patterns from lookup tables — you can't *play* them, can't hear the pitch that makes each figure, and can't try your own plate shape. The tight, satisfying loop of 'pitch → pattern → the sand rearranging as you slide between notes' is missing.

## How it works
Pick a boundary shape and a driving frequency. The app superposes the plate's resonant modes weighted by how close the drive is to each mode's natural frequency (a driven-oscillator response curve), giving a live displacement field. Sand grains do gradient descent toward |displacement| minima (nodes) with a little Brownian jitter, so they visibly crawl and pile onto the nodal lines. Sweep the frequency and grains dissolve and re-form into the next figure. A WebAudio oscillator plays the actual tone; a mic mode lets you hum and watch your pitch draw sand. Hit freeze to render a poster-res PNG with the frequency stamped on it.

## Technical approach
Stack: TypeScript + WebAudio + WebGL2 (particles in a transform-feedback / GPU pass). For rectangles, modes are analytic sin(mπx/L)·sin(nπy/W) products; for circles, Bessel-function modes J_n(k r)·cos(nθ) precomputed at load. For arbitrary drawn boundaries, precompute the lowest ~40 eigenmodes of the Laplacian via a quick FEM/FDM eigensolver (or fall back to a coarse grid). Data model: mode basis {shape, eigenfrequency}, live drive freq, ~100k GPU particles (position + velocity textures). Grain motion = ∇|A(x)| descent with damping + noise. Mic path: FFT → dominant pitch → drive freq. The hard part is a fast-enough eigensolver for custom shapes and keeping 100k particles at 60fps.

## v1 scope
- Square + circle plates with analytic modes
- Keyboard/slider frequency drive + WebAudio tone
- 50k GPU particles doing node-seeking
- Freeze-to-PNG export

## Out of scope
- Arbitrary drawn boundaries (eigensolver) at launch
- Mic input
- 3D plates, multi-plate

## Risks & unknowns
- Particle count vs framerate on integrated GPUs
- Physical fidelity of the mode-superposition shortcut vs true forced-plate response
- Custom-shape eigensolver may be too slow for interactive use

## Done means
Sweeping the frequency slider through a plate's first six resonances makes the sand visibly dissolve and re-settle into six distinct, correct Chladni figures at 60fps, and freeze exports a clean labeled PNG of the current pattern.
