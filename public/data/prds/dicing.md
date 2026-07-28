## Overview
A browser physics toy and engineering puzzle about tempered glass, aimed at people who like Powder Toy but want the numbers to mean something. You control the process, not the break: quench air pressure, glass thickness, soak temperature. Those set a residual stress field. Then you hit it, and the stored energy decides how it comes apart.

## Problem
Graphics fracture sims look great and are physically meaningless — shards are Voronoi cells with a noise term. Real tempered glass has a beautiful, non-obvious property: it dices into thousands of small blunt cubes *because* of the parabolic residual stress profile, and fragment size is set by stored elastic energy versus fracture surface energy. That's a genuinely teachable, genuinely simulable mechanism nobody has made playable.

## How it works
Sandbox: drag sliders for thickness (3–19 mm), surface compression (20–150 MPa), quench asymmetry. A cross-section widget draws the resulting parabola — compression at both faces, tension in the core, force balance enforced. Strike anywhere with a spring-loaded center punch. Watch it go.

Puzzle mode grades you against the real spec: EN 12150-1 requires ≥40 particles in the worst 50×50 mm window and no shard longer than 100 mm, and you must hit it at minimum quench energy cost. Under-temper and you get long dagger shards (fail, and visibly nasty). Over-temper and you pass the count but the plate spontaneously self-destructs.

Forensics mode is the reason to build it: place a nickel sulfide inclusion in the tensile core and let it phase-transform. You get the real butterfly-wing fracture origin that forensic engineers use to distinguish spontaneous NiS failure from impact — reproduced from mechanism, not painted on.

## Technical approach
Bond-based peridynamics on a 2D plate, ~1–2M particles, WebGPU compute. Uniform grid spacing Δx with horizon δ = 3Δx, neighbor lists built once on CPU and packed into a storage buffer. Residual stress enters as per-bond pre-stretch derived from the depth parabola. Bonds break at critical stretch s₀ = √(5G₀/(9Kδ)); crack branching emerges naturally once the tip can't dissipate the incoming energy flux, which is exactly the observed behavior. Velocity-Verlet, ~5e-8 s steps, substepped per frame.

Fragment counting is GPU connected-components over surviving bonds: label-propagation with pointer jumping and atomics, then a scan to histogram component areas and run the 50×50 mm sliding window.

Hard part: calibration. Getting qualitative branching is easy; getting ~5 mm particles at 100 MPa surface compression to match published dice counts requires tuning G₀ and Δx against real data, and the answer is resolution-sensitive.

## v1 scope
- Single 300×300 mm plate, one thickness slider, one stress slider
- Center punch only, one strike location
- Live fragment count + pass/fail against the 40-particle rule
- No NiS mode, no cross-section widget

## Out of scope
3D, laminated glass, thermal simulation of the actual quench, sound.

## Risks & unknowns
Peridynamic fragment size may not converge at browser-affordable resolution — fallback is a calibrated Δx with an honest "scale factor" disclosure. WebGPU availability. Frame budget for 1M particles at 60 Hz is tight.

## Done means
At 6 mm / 100 MPa the sim produces a worst-window count within ±25% of published EN 12150 test data, and dropping surface compression to 40 MPa visibly produces long dagger shards that fail the spec.
