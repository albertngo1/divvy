## Overview
Dyno is a browser puzzle game for tinkerers and armchair gearheads: you tune a virtual engine by hand-editing its fuel and ignition maps to hit power, economy, and emissions targets — without blowing it up. Sparked by rusefi, the trending open-source ECU.

## Problem
Real engine tuning is a gorgeous optimization space — 3D lookup tables, tradeoffs between power, knock, and economy — locked behind expensive hardware and the risk of destroying a real motor. There's no low-stakes sandbox to *feel* how spark advance, air-fuel ratio, and load interact.

## How it works
Each level hands you an engine with a fault or a target: "make 200 hp but stay under the knock threshold," "pass the emissions cycle," "cure a rough idle." You edit two 3D tables — a VE/fuel map and an ignition-timing map — indexed by RPM (x) and load/MAP (y), painting cell values on a heatmap. Hit *Run* and a deterministic sim spins the engine through a drive cycle, plotting torque, lambda, EGT, and knock intensity. Too much advance → knock (fail). Too lean at high load → meltdown. Score = fewest cells edited / closest to target, Zachtronics-style, with a date-seeded daily challenge engine and shareable result.

## Technical approach
Pure client-side TypeScript + Canvas/WebGL. The model is a lumped-parameter mean-value engine: VE table → trapped air mass → fuel from commanded lambda → indicated torque via a Willans-line/BSFC approximation, minus friction (Chen–Flynn). Knock is a lightweight Arrhenius induction-time integral over the burn window driven by timing and charge temperature; cross the threshold and a knock event fires. Emissions via a simple lambda→NOx/HC/CO surrogate curve. Everything runs at fixed timestep and seeded, so scores are reproducible and shareable. Maps are typed arrays with bilinear interpolation. The genuinely hard part: tuning the physics constants so the sim is *learnable and fair* — the power/knock tradeoff must feel real without demanding a PhD — and precomputing each puzzle's par via a grid/anneal search so every level is provably solvable.

## v1 scope
- One inline-4 engine, two editable 16×16 maps
- 5 hand-designed puzzles + a Run button with torque/lambda/knock plots
- Deterministic sim, par score, "share result" string

## Out of scope
- Turbo/boost control, VVT, per-cylinder trim
- Importing real .msq / rusefi tune files
- Multiplayer or global leaderboard

## Risks & unknowns
- Physics fidelity vs. fun balance is the whole ballgame
- May read as too niche for non-gearheads; needs strong onboarding
- Verifying each puzzle is solvable at the claimed par

## Done means
A player loads the page, edits the timing map to cure a knock-limited engine, hits the power target on the plot with zero knock events, and gets a shareable par score — all offline and deterministic across reloads.
