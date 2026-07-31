## Overview
A browser simulation toy of tin whiskers — the single-crystal filaments that spontaneously extrude out of lead-free tin finishes and short circuits years after shipping. You configure a board and an environment, run two decades in half a minute, and get a survival curve. For hardware engineers, reliability folks, EE students, and anyone who enjoys a good haunted-materials story.

## Problem
Tin whiskers are the weirdest well-documented failure mode in electronics: they killed satellites, shut down a nuclear plant, and turned up in the Toyota unintended-acceleration investigation. The knowledge lives in NASA Goddard reports and JEDEC standards written for compliance officers. There is no way to *play* with the phenomenon and build intuition about which choices actually matter.

## How it works
You choose four things:
- **Finish** — bright Sn, matte Sn, SnPb, Sn over a Ni underlayer, or conformal coat
- **Substrate** — brass is worst (Zn/Cu diffuse into the tin, growing Cu₆Sn₅ intermetallic and compressive stress), copper, alloy 42
- **Environment** — bench ambient, avionics thermal cycling (−55/+85), humid tropical
- **Geometry** — pad pitch and gap width, plus your circuit's current limit

Hit run. Whiskers nucleate stochastically, kink as they grow, and some bridge a gap. Output: a Kaplan–Meier curve of P(short) versus years, and a cause-of-death panel — which pair of nets, at what year, how long the whisker was.

## Technical approach
TypeScript, canvas 2D (top-down plus a side elevation), Monte Carlo in a Web Worker.

Model, following IPC-TR-585 and the NASA Goddard data: intermetallic thickness `x = k√t` with Arrhenius k; that drives compressive stress σ(t); nucleation is Poisson over surface sites with rate `λ ∝ exp(σ/σ₀)` and site density from published counts (10–1000/cm² by finish); whisker length is lognormal with μ,σ taken from Goddard's measured distributions (matte tin ≈ ln 30 µm), growing on a diffusion-limited t^½ law after an incubation delay. Direction is a persistent random walk in 3D, so a whisker kinks and bridging is genuinely geometric rather than a naive `L > gap` test — intersection is capsule-vs-capsule against nets at different potential. A contact then gets an electrical check: whiskers fuse open somewhere around 10–50 mA, so whether a touch is a transient or a dead board depends on your current limit. 1000 boards per run, aggregated into the survival curve.

Data is hand-transcribed from the NASA whisker homepage tables into a ~200-row JSON with a citation field per constant; JESD201 acceptance classes serve as validation targets.

The hard part is calibration: reproducing published test outcomes rather than generating pretty nonsense.

## v1 scope
- Two finishes (bright vs matte tin) on brass, one fixed gap width
- Ambient environment only, no thermal cycling
- 200 Monte Carlo runs, one survival chart, one side-view animation

## Out of scope
Gerber/KiCad import, conformal coat penetration physics, real 3D view, tin pest, humidity-driven corrosion whiskers.

## Risks & unknowns
The literature spreads over orders of magnitude — present ranges and a confidence band, not a false point estimate, and cite every constant inline. Second risk is reading as anti-RoHS polemic; keep it neutral by showing that SnPb whiskers too, just far less.

## Done means
For matte tin on brass at a 0.5 mm gap, the simulated median first-bridge time falls inside the published experimental range, and every number in the constants panel shows its source on hover.
