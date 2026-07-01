## Overview

Viscosity Drip animates ~80 common liquids as fluid droplets falling and pooling at their *true relative viscosity*, side by side. Water splashes; honey oozes; pitch barely moves. Then you drag a temperature slider and watch the whole grid respond: honey thins to syrup, ketchup shear-thins, molten glass stiffens, some liquids crystallize out. The delight is watching eighty little drips race at physically honest speeds and then bend the physics with one slider. Fluid sim is a proven shareable form (every Bartosz Ciechanowski post); the temperature scrubber over a wall of real liquids is the novel angle.

## Problem

Viscosity is taught as a number in centipoise that means nothing to anyone. Ball-drop demos and single-liquid teaching sims exist, but no one has animated *eighty* liquids together at true relative viscosity with a temperature scrubber that shows the dramatic temperature dependence (honey's viscosity roughly halves every ~10°C). The data is scattered across engineering handbooks; the artifact is unbuilt.

## How it works

A grid of droplet cells, one per liquid, each labeled and continuously dripping/pooling from a spout. Fall speed, thread thickness, and pool spread are all driven by that liquid's viscosity at the current temperature. A temperature slider spans a sensible range (say −20 to 200 °C); dragging it re-reads each liquid's viscosity-vs-T curve and re-times the animation live. Liquids outside their liquid range visibly freeze (crystallize) or boil off. Click a cell to zoom one drip full-screen with its cP value, source, and curve.

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: static site, Vite + TypeScript, WebGL (via a light shader layer or regl) for the drips; fall back to Canvas for the grid. No backend.

Data sources by name:
- **NIST WebBook** — free viscosity data for many common fluids, including temperature-dependent values; the primary free source.
- **Perry's Chemical Engineers' Handbook** — one-stop viscosity-vs-temperature coverage but paywalled; use only for cross-checking hand-entered curves, not as the shipped source.
- Where a curve isn't tabulated, fit **Andrade / Arrhenius** form (μ = A·e^(B/T)) to the available points.

Data model: `liquids[{id, name, curve:{A,B} | points:[{T,cP}], liquid_range:[Tmin,Tmax], color}]`. Viscosity at slider T computed from the fitted curve or interpolated points.

Key algorithms: (1) μ(T) via Andrade fit or piecewise interpolation; (2) map μ → animation timing — fall speed ∝ 1/μ (gravity vs viscous drag, gross simplification), thread thickness and pool viscosity scaled likewise; (3) rather than solve Navier–Stokes per cell in real time, use **lattice-Boltzmann** as a cheap 2D fluid approximation *or* pre-bake short sim loops per liquid per temperature bin and play them back — the ideation's own recommendation for keeping 80 liquids tractable in-browser.

The hard part: real fluid simulation for 80 cells at 60 fps is infeasible; the whole build hinges on the simplification. Pre-baked per-bin loops or a stylized LBM approximation keeps it honest-looking without a physics engine — and getting the *relative* speeds visibly correct (honey vs water spans ~4 orders of magnitude) without water becoming invisible is the real design tension.

## v1 scope (humiliatingly small)

- ~20 recognizable liquids (water, honey, ketchup, oil, glycerin, mercury, molasses…).
- Stylized drip animation with speed ∝ 1/viscosity — no true Navier–Stokes.
- Temperature slider re-timing the grid via fitted μ(T) curves.
- Precomputed `liquids.json` from NIST.

## Out of scope (for now)

- Real-time Navier–Stokes; full 80-liquid catalog.
- Non-Newtonian shear-thinning modeling (ketchup faked, not simulated).
- Pressure/altitude effects; mixtures.

## Risks & unknowns

Prior-art verdict: **Partial**. Ball-drop sims and teaching activities exist; none animate 80 liquids with a temperature scrubber. Fresh angle = the temperature scrubber over a wall of true relative viscosities. Risks: (1) real fluid sim in-browser is too heavy — mitigate with lattice-Boltzmann approximation or pre-baked per-temperature-bin loops; (2) 4-orders-of-magnitude viscosity range makes water and honey hard to show on one screen — use a compressed visual mapping; (3) NIST coverage gaps force curve-fitting, so some liquids are approximate.

## Done means

A visitor sees ~20 liquids dripping at visibly correct relative speeds (water fast, honey slow, pitch nearly frozen), drags the temperature slider and watches honey thin and a liquid crystallize, and every value traces to NIST. Deployed static, 60 fps on a laptop.
