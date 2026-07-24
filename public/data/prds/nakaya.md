## Overview
Nakaya is a science-nature toy that grows a single ice crystal on a hexagonal lattice using a real diffusion-limited crystal-growth model, driven by two knobs — temperature and supersaturation — that map onto the actual **Nakaya morphology diagram** (the 1930s empirical map of which snowflake shapes form under which conditions). Named for Ukichiro Nakaya, who grew the first lab snowflakes. For anyone who wants a pretty toy that is also *correct*: change the weather, get the shape nature would actually make.

## Problem
Every snowflake generator online is a decorative fractal — six-fold symmetry slapped on random noise. None of them respect the striking real fact that morphology is a sharp, non-monotonic function of temperature: plates at −2°C, needles at −5°C, plates again at −15°C, ferny dendrites only in a narrow humid band. That physics is more beautiful than the fractal, and nobody has made it playable.

## How it works
A hexagonal grid of cells, each holding a diffusive water-vapor field and a boolean "frozen" state plus quasi-liquid boundary mass. Each tick: (1) vapor diffuses across non-ice cells; (2) boundary cells accrete based on local vapor and an anisotropy term whose *attachment kinetics* depend on the two knobs, so faceting vs. branching shifts realistically. A single seed at center grows outward; you scrub T and supersaturation live and watch the growth front change habit. A minimap plots your current position on the Nakaya diagram with the classic morphology regions shaded, so you can "drive" the crystal into needles, sectored plates, or dendrites on purpose. Export a high-res PNG keepsake with its (T, humidity) caption.

## Technical approach
The Gravner–Griffeath "snowfake" reaction–diffusion cellular automaton (a real, published model that reproduces observed habits) on a triangular/hex lattice, implemented as a WebGL/WebGPU fragment-shader ping-pong so the diffusion field updates every frame on the GPU. State packed into an RGBA float texture (vapor, boundary mass, crystal mass, attached flag). Knobs remap the model's ~7 free parameters (β attachment thresholds, κ, α, diffusion) through a hand-fit lookup so the UI's (T, RH) lands in the right morphology basin. The hard part: keeping the attachment rule numerically stable while still branching — and calibrating the parameter map so the diagram regions produce visibly distinct, recognizable habits.

## v1 scope
- Hex-lattice Gravner–Griffeath sim in a WebGL shader.
- Two sliders (T, supersaturation) mapped to parameters.
- Nakaya-diagram minimap showing your live position.
- PNG export with caption.

## Out of scope
- 3D crystals, riming/aggregation, audio, saving/replaying growth videos, mobile perf tuning.

## Risks & unknowns
- Parameter→morphology calibration is fiddly; may need per-region presets.
- Shader-based CA can hit precision/stability walls at high resolution.
- "Correctness" is qualitative — hard to prove, easy to hand-wave.

## Done means
Starting from a single seed, setting the sliders to the −15°C / high-humidity corner yields recognizable ferny stellar dendrites, moving to −5°C yields hollow needles, and the minimap dot tracks the sliders — all growing live at ≥30fps and exportable as a captioned PNG.
