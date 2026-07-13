## Overview
Breadboard is an open-ended engineering puzzle game in the Zachtronics tradition (Shenzhen I/O, KOHCTPYKTOP) — but where nearly every such game lives in the clean world of digital logic, Breadboard lives in **analog**. You solve each level by wiring real passive and active components on a virtual breadboard to make a scope trace match a target: a 1 kHz sine oscillator, a bandpass filter, a comparator with hysteresis, the 'reverse avalanche oscillator' from the HN cursed-circuits post. For hobbyist electronics tinkerers and puzzle-game players who found Turing Complete too tidy.

## Problem
Analog electronics is famously unintuitive — impedance, feedback, parasitics, and non-ideal op-amps trip up even EEs — and it's taught with dry SPICE homework or expensive breadboards where a miswire just does nothing. There's no playful, low-stakes sandbox that makes analog *feel* like the puzzle it is, with instant visual feedback and clever hand-authored challenges.

## How it works
Drag resistors, caps, inductors, diodes, transistors, and op-amps onto a grid; wire nodes; place probes. A live oscilloscope and Bode plot update as you tweak. Each level gives a spec ('output a 2 Vpp triangle wave, ±5% frequency, no external clock') and grades pass/fail plus efficiency-style metrics (part count, power, worst-case error across the tolerance sweep). The twist that makes it a *game*: components have realistic tolerances and non-idealities, so a solution that passes at nominal values can fail the Monte-Carlo tolerance check — you must design for robustness, not just correctness.

## Technical approach
Browser game, TypeScript + Canvas/WebGL for the board and scope. The engine is a compact **modified nodal analysis (MNA)** solver doing transient analysis: build the conductance matrix per timestep, Newton-Raphson for nonlinear devices (diode/BJT via Ebers-Moll, op-amp as a macromodel with finite gain + slew + rails), companion models for L/C. Target ~10–50 kHz effective sample rate solved fast enough for a smooth live scope. Grading runs the netlist plus a 30-sample tolerance Monte-Carlo. The genuinely hard part is a transient solver that's numerically stable (no runaway on oscillators/feedback), converges reliably, and stays real-time in a single browser thread — likely a WASM core (Rust) for the matrix solve.

## v1 scope
- Breadboard editor: place/wire R, C, diode, ideal-ish op-amp
- Real-time transient scope on a probed node
- 6 hand-authored levels (RC filter → relaxation oscillator → comparator)
- Pass/fail grading at nominal values

## Out of scope
- Tolerance Monte-Carlo grading (v2 signature feature)
- Transistors/inductors, AC/Bode view, community level sharing
- Save states, campaign, leaderboards

## Risks & unknowns
- Solver stability on feedback loops is the whole ballgame; may need adaptive timestep.
- 'Fun vs accurate' tension — too-real SPICE behavior may frustrate; needs tuned macromodels.
- Teaching the UI so non-EEs aren't lost on level 1.

## Done means
A player can build an RC low-pass and a relaxation oscillator from scratch, see a correct live waveform on the scope that matches SPICE within ~10%, and the game correctly passes the working oscillator and fails a version with the feedback resistor removed.
