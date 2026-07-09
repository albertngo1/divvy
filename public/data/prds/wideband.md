## Overview
Wideband is a browser puzzle-sim about the real, oddly meditative craft of engine tuning. You're handed a bone-stock volumetric-efficiency (VE) table and a simulated four-cylinder, and your job is to fill in the cells so the engine hits its target air-fuel ratio across every RPM and load point of a drive cycle. Aimed at car-curious tinkerers and anyone who liked SpaceChem but wants grease under the nails.

## Problem
Standalone ECU tuning (the rusefi/Speeduino world) is fascinating and completely opaque to outsiders: to learn it you need a real engine, a dyno, and the nerve to lean a motor until it detonates. The core loop—log a pull, read the AFR error, nudge the table, repeat—is pure puzzle, but there's nowhere safe to practice the intuition without money and risk.

## How it works
- The playfield is a 16×16 RPM-vs-load VE table you paint with values.
- Hit "pull": the sim runs a drive cycle and plots a virtual wideband AFR trace against your target line, plus a heatmap of which cells ran rich/lean.
- Lean cells too far under high load and you trigger simulated knock—instant fail, with the offending cell flashing.
- Score = time-weighted AFR error + power delivered − fuel used − knock penalty. Par times per puzzle; a shareable trace.
- Campaign escalates: naturally aspirated → forced induction (now boost adds a whole load axis) → cold-start enrichment corner cases.

## Technical approach
TypeScript + Canvas, no backend. Engine is a mean-value model: airflow = f(RPM, MAP, VE_table) via the speed-density equation, injected fuel from your table and injector flow constant, resulting AFR = airmass / fuelmass. A simple knock model triggers when AFR × load exceeds a per-fuel threshold. The drive cycle is a scripted RPM/throttle timeline (borrowing the shape of real emissions cycles). Data model: `Puzzle{targetAFR, driveCycle, injectorCC, knockThreshold}` + player `VETable[16][16]`. The genuinely hard part is tuning the model to be forgiving enough to be fun but faithful enough that lessons transfer to real speed-density tuning.

## v1 scope
- One NA engine, one drive cycle, editable 16×16 VE table
- Virtual wideband AFR trace + rich/lean cell heatmap
- Knock-fail detection and a single numeric score with par

## Out of scope
- Closed-loop/PID controller authoring (later chapter)
- Boost/forced induction
- Real datalog import

## Risks & unknowns
- Balancing realism vs. fun; too-real and it's homework.
- Knock modeling is a caricature—must label it as such.
- Discoverability: it's a niche within a niche.

## Done means
A player can paint the VE table, run a pull, see an AFR trace and heatmap that visibly improve as they correct lean cells, blow the engine by leaning it under load, and beat a par score on the first puzzle—all client-side.
