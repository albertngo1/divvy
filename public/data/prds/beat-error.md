## Overview
Beat Error is a browser puzzle-sim where you play a watchmaker regulating a mechanical movement. A virtual timegrapher shows the classic dual-line acoustic trace; your job is to adjust a handful of physical parameters until the watch runs to spec across all positions. Inspired by the '80-year-old watchmaking school still ticking' story, with an optimization core borrowed from the control/metaheuristic repos trending on GitHub.

## Problem
Watch regulation is a beautiful, legible skill — clear feedback, tight tolerances — but utterly inaccessible without a bench, tools, and a $5k movement to not-destroy. There's no sandbox to *feel* how beat error, amplitude, and rate interact.

## How it works
You get a movement with hidden imperfections (poise error, unbalanced hairspring, escapement drag). The timegrapher renders a scrolling trace: two lines whose slope = daily rate, whose separation = beat error, plus an amplitude readout. Controls: regulator lever (rate), stud carrier (beat), timing screws / poising (position variance), and hairspring pinning. You test in 5 positions (dial up/down, crown up/down/left). Goal: get max rate spread ≤ some target and beat error ≤ 0.3ms. Daily 'movement of the day' with a fixed defect set and a par move-count; leaderboard on fewest adjustments.

## Technical approach
Pure client-side (Canvas/WebAudio optional for tick sound). Physics: model the balance as a damped harmonic oscillator whose period is perturbed per-position by gravity torque on an out-of-poise balance and by hairspring geometry; rate(position) = f(regulator, poise_vector·gravity, amplitude). The timegrapher trace is just accumulated phase error plotted as slope; beat error = phase offset between the two half-oscillations. Optimization framing: each control maps to a parameter, and the hidden 'true' defect vector is what the player is doing gradient-free descent on — you can seed daily defects deterministically and even ship an 'auto-regulate' hint that runs a small metaheuristic (à la mealpy's Nelder-Mead/PSO) to prove a solution exists and set par. Hard part: making the position-dependent rate model physically plausible enough that real watchmakers nod, without a full multibody sim — calibrate against published timegrapher behavior.

## v1 scope
- Single movement, 2 controls (rate + beat), single position
- Scrolling timegrapher trace + rate/beat/amplitude readout
- Win condition: rate within ±5 s/day, beat ≤ 0.5ms
- Daily seed + move counter

## Out of scope
- Multi-position poising, amplitude tuning
- Real acoustic input from a phone mic
- Movement teardown/assembly gameplay

## Risks & unknowns
- Physical fidelity vs fun balance — too realistic gets fiddly
- Niche audience; needs the daily/share hook to spread
- Getting the trace to read intuitively for non-watch people

## Done means
A player can load the daily movement, watch the timegrapher trace update in real time as they drag the regulator and stud carrier, and reach the win state (rate and beat within tolerance), with the move count recorded and a shareable result string.
