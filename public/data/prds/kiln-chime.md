## Overview
A browser toy for anyone who likes watching physical processes unfold: you set glaze thickness, thermal-expansion mismatch, and cooling rate, open the kiln, and a craze network grows across a tile in real time while each crack sings. The finished network exports as an SVG you can tile into wallpaper.

## Problem
Every "cracked ceramic" texture in generative art is a lie — Voronoi cells or ridged noise. Real craze networks have signatures neither reproduces: cracks meet at **90° T-junctions and never cross**, crack spacing **scales linearly with glaze thickness**, and the pattern forms by sequential bisection of surviving domains, so you can read its history off the geometry. Separately, potters know that cooling ware *pings* audibly for hours. Nobody has ever made that process interactive, and the sound is the part that makes the physics land in your body.

## How it works
Sliders: Δα (body/glaze expansion mismatch), glaze thickness h, cooling rate, flaw density. Press **open the kiln**. Temperature drops; tensile stress σ₀ = E·Δα·ΔT/(1−ν) builds in the glaze. When local stress exceeds a flaw's sampled strength, a channel crack nucleates and runs, relaxing stress in a band of width ~λ ∝ h on either side. Later cracks bisect the widest remaining domains and terminate orthogonally on existing cracks. Every propagation event fires a modal-synthesis ping. Slow cool → sparse, wide-spaced, occasional lonely *tink*. Quench → dense crackle you can barely count. Then press **glaze it**: shards get filled from an azulejo-blue palette and repeated under a chosen wallpaper group (p4m, pmm, cmm) → download PNG/SVG or set as screensaver.

## Technical approach
TypeScript, canvas2d for the network, WebGL for the stress field, Web Audio for sound.

- **Stress:** shear-lag approximation instead of FEM. Per-pixel σ = σ₀ · (1 − e^(−d/λ)) where d = distance to nearest crack, computed each frame with a jump-flood distance transform on GPU. λ = k·h is the single knob that makes spacing scale correctly.
- **Nucleation:** Poisson-seeded flaws with Weibull-distributed strengths; each tick, sites where σ_local > strength open.
- **Growth:** crack tips advance along the maximum-principal-stress direction (toward the high-stress interior of a domain), halting on contact with an existing crack — enforcing T-junctions structurally rather than cosmetically.
- **Geometry:** the network is a planar half-edge graph, so shard faces pop out directly for filling, area statistics, and SVG export.
- **Audio:** each crack of length L emits a Kirchhoff plate-mode stack, fₙ ∝ 1/L², 4–6 partials, ~120 ms exponential decay, panned to the crack's centroid.

The hard part is honest statistics: the emergent mean spacing must actually scale with h, from a cheap shear-lag model — and voice-stealing must keep 300 simultaneous cracks from turning into white noise.

## v1 scope
- One fixed square tile
- Three sliders (h, Δα, cooling rate)
- Monochrome cracks on white, ping audio
- PNG export

## Out of scope
3D/curved ware, a real material database, video export, glaze color chemistry.

## Risks & unknowns
It may *look* right while being statistically wrong — validate against published channel-cracking spacing data. Dense crackle can be genuinely unpleasant; needs a ping-density limiter.

## Done means
Sweep h across four values, measure mean crack spacing each time, and the spacing/h ratio stays roughly constant in the 3–6× band the literature reports — and someone who wasn't told what it is says it sounds like real pottery.
