## Overview

A browser toy for people who like both physics and weird music. One button. Each press procedurally designs a wind instrument — bore profile, tone hole positions and radii — then *solves* it rather than assuming anything about it: computes the input impedance, finds which pitches each fingering actually produces, and composes a short solo playable only on that instrument. Outputs a WAV, an SVG fingering chart, and a bore cross-section drawing.

## Problem

Generative music almost always generates *notes* on a fixed 12-tone grid with a sampled instrument. The instrument is never the generated thing. But real instruments determine their own scales — a clarinet overblows a twelfth because of its cylindrical bore, not because someone decided. If you generate the tube, you get a tuning system nobody designed, and the melody has to obey a fingering chart that didn't exist five seconds ago.

## How it works

1. Sample a bore: 8–20 piecewise-conical segments, length 300–800 mm, plus 4–7 tone holes (position, radius, chimney height).
2. For each of ~128 sampled fingerings (open/closed bitmask), compute input impedance Z(f) from 50–3000 Hz.
3. Peak-pick Z: the first strong peak = sounding pitch; peak Q = how playable; ratio of peak 1 to peak 2 = the register jump (octave? twelfth? something ugly?).
4. Reject the instrument unless ≥7 fingerings give Q above threshold and the pitch set spans a usable range — most random bores are garbage, so this is rejection sampling.
5. Sonify: run a reed model against the modal decomposition of Z.
6. Compose: melody constrained so consecutive notes differ by ≤2 finger changes; tempo scaled by finger travel.

## Technical approach

Transfer Matrix Method (Chaigne & Kergomard, ch. 7) in Rust→WASM: each cylindrical/conical segment and each tone hole is a 2×2 matrix over (P, U); multiply, terminate with a radiation impedance (unflanged pipe, Levine–Schwinger approximation). Thermoviscous losses via complex wavenumber or the whole thing is fictitiously lossless and every peak is infinite. Cross-check against `openwind`'s published clarinet impedance curves offline.

Synthesis: fit Z's peaks to a bank of second-order resonators, close the loop with the standard nonlinear reed table (McIntyre–Schumacher–Woodhouse), integrate at 48 kHz in an AudioWorklet. Melody generator is a constrained random walk over the fingering graph (nodes = fingerings, edge weight = Hamming distance).

The hard part: playability scoring. Impedance peaks alone don't tell you whether a human-modeled reed will actually lock onto that mode; you need the reed loop to confirm oscillation, which means simulating each candidate fingering for ~200 ms before you know if the instrument is real.

## v1 scope

- Cylindrical bore only, fixed length, 5 tone holes
- TMM impedance + peak picking, rendered as a plot
- Fingering→pitch table printed as text
- Ascending scale played through one reed model, offline render to WAV

## Out of scope

Conical/saxophone bores, register keys, 3D-printable STL export, MIDI input, any UI beyond one button.

## Risks & unknowns

Rejection rate may be brutal (99% junk bores); mitigate by seeding from perturbed real geometries. Reed model may squeal or go silent across most of the pitch range. Radiation impedance approximations get inaccurate at large hole/bore ratios.

## Done means

Press run three times, get three distinguishable instruments, each producing a 7+ note non-12TET scale with a printed fingering chart, and a musician can pick up the chart and understand it.
