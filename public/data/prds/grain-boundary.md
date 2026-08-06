## Overview
A single-player deduction game for people who liked *Return of the Obra Dinn* and *Papers, Please* but want the evidence to be **real physics**. Each case hands you a polished cross-section of a metal sample. You spend a limited testing budget, read the microstructure, and commit a verdict: composition, peak temperature, and cooling rate — which collapses to a story ("quenched in water by a smith", "cooled 100°C per million years in an asteroid core", "melted and re-solidified in under a second").

## Problem
Microstructure is the most legible forensic record in the physical world and no game has ever used it. Every metallurgy student learns to read dendrite arm spacing like tree rings; nobody outside a lab has ever seen it. Meanwhile deduction games keep inventing fake evidence systems when a rigorous, generative one is sitting in a textbook.

## How it works
1. Case opens with a low-mag optical image of an etched sample plus a one-line provenance claim (often a lie).
2. You buy tests from a budget: **etch** (nital vs. picral reveals different phases), **hardness indent** (Vickers, gives you a number), **EDS spot** (composition at a point), **higher magnification**, **second section at 90°**.
3. You fill a verdict card with three sliders — %C / alloy content, peak T, log₁₀(cooling rate in °C/s) — and pick a story from a shortlist.
4. Scoring is graded, not binary: being within a decade of the true cooling rate is a pass; nailing it is a gold. Wrong story with right numbers still teaches you something.

## Technical approach
TypeScript + canvas/WebGL, no server. The generator is the game:
- **Grains**: Voronoi seeded by a Poisson-disk sampler; mean grain diameter from a Hall–Petch-consistent draw tied to the case's peak T and hold time.
- **Dendrites**: secondary arm spacing from the real relation λ₂ = A·(dT/dt)^(−n), n ≈ 0.33; drawn as recursive branch sprites at the correct pixel scale for the stated magnification.
- **Phases**: lever rule on a hard-coded Fe–C phase diagram gives pearlite/ferrite/cementite fractions; martensite appears above a critical quench rate and is rendered as needle lath fields.
- **Widmanstätten** (the meteorite case): kamacite band width in mm maps to cooling rate in °C/Myr via the published Wood/Goldstein relation — the level where a player's intuition about "fast" breaks.
- Hardness/EDS readouts are sampled from the same latent parameters with realistic instrument noise, so tests are mutually consistent and cross-checkable.
- **Hard part**: making synthetic micrographs *look* photographic enough that reading them feels like observation, not chart-reading. Etch contrast, polishing scratches, and edge rounding are what sell it.

## v1 scope
- 6 hand-tuned cases, one generator (Fe–C only)
- 3 tests: etch, hardness, magnify
- Verdict = 2 sliders + story pick
- A field guide panel with 8 reference images

## Out of scope
Non-ferrous alloys, 3D sectioning, story campaign, multiplayer, any LLM.

## Risks & unknowns
The generator may produce microstructures that are physically impossible in combination; needs a validity check before render. Difficulty curve is brutal without a good field guide.

## Done means
A metallurgist plays the meteorite case cold, reads the band width, and lands within one decade of the true cooling rate — and a non-expert who read only the in-game field guide does too by case 6.
