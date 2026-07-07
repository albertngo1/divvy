## Overview
Sidelobe is a browser physics puzzle about beamforming. You control a row of wave emitters and, by adjusting each one's phase (and later amplitude), aim a constructive beam at target receivers while avoiding 'null zones' and stray sidelobes that would trigger forbidden sensors. Sparked by the Rotman Lens front-page post. For people who like elegant wave-physics toys.

## Problem
Beamforming and phased arrays are gorgeous, counterintuitive physics — steering a beam with no moving parts, purely by timing — but they live in EE textbooks and radar manuals. There's no playful, tactile way to build intuition for how phase gradients steer a main lobe and where the ugly sidelobes go.

## How it works
Each level gives you N emitters along a baseline and a scene with green targets (must receive strong field) and red sensors (must stay in a null). You drag per-emitter phase sliders; the canvas live-renders the summed wavefield as an interference heatmap and highlights the current beam direction and sidelobe lobes. A linear phase gradient steers the main lobe; you discover that hitting an off-axis target creates grating lobes that can illuminate a red sensor. Solve = all greens above a threshold, all reds below one. Later levels add amplitude tapering (windowing) to suppress sidelobes, obstacles, and a par 'energy budget'.

## Technical approach
Pure client-side, TypeScript + canvas/WebGL. Field at each pixel = sum over emitters of `A_i * cos(k*r_i + phi_i)`, where `r_i` is distance from emitter i and `k = 2π/λ`; render the time-averaged intensity `|Σ A_i e^{j(k r_i + phi_i)}|²` as a heatmap. A fragment shader computes the complex sum per pixel for smooth 60fps as sliders move. Target/sensor evaluation samples intensity at those points. Levels are authored JSON (emitter count, spacing, λ, target/sensor positions, thresholds) plus a date-seeded daily. The genuinely hard part is tuning difficulty and readability — making the physics honest while giving clear visual feedback about *why* a sidelobe lit up the wrong sensor, and auto-verifying each authored level is solvable.

## v1 scope
- WebGL interference heatmap over 4–8 emitters
- Phase-only sliders
- 10 hand-authored levels with target/sensor win check
- Solve animation + move counter

## Out of scope
- Amplitude tapering / windowing (v2)
- 2D emitter grids, near-field effects
- Multiplayer / leaderboards
- Real radar accuracy

## Risks & unknowns
- Might read as 'edutainment' without a hook — needs a clever level-design twist
- Shader math must stay 60fps on mid laptops
- Balancing physical honesty vs. approachability

## Done means
A player opens the page, drags phase sliders on a level, watches the beam steer and a sidelobe illuminate a red sensor, corrects it, and the level registers a win — all rendered live at 60fps with no server round-trip.
