## Overview
A playable circuit simulator, or a synth made of components — either description is right. You place BJTs, resistors, capacitors, diodes and a 9V rail on a small breadboard grid, wire the nodes, and the resulting network *is* the instrument. Aimed at people who own a modular synth and still can't answer why analog gear sounds the way it does.

## Problem
Every browser synth is a graph of idealized blocks: an oscillator that is a perfect sawtooth, a filter that is a transfer function. You learn signal flow and nothing else. Meanwhile every real circuit simulator is offline, silent, and outputs a plot — you can see that a transistor saturated, but you cannot *hear* what saturation costs you. The interesting middle — a circuit slow enough to understand and fast enough to play — doesn't exist as a toy.

## How it works
Drag parts onto an 8×8 breadboard, drag wires between node holes. A DC operating-point solve runs continuously and paints every node's voltage as a color, so you literally watch the collector sag as you lower the base resistor. Audio runs the same network at sample rate. There is no "osc" primitive: to get a tone you build an astable multivibrator from two transistors and two caps, and its frequency is whatever the RC network says it is. Turn a pot and the pitch bends because the time constant changed. Short a base to ground and the node goes dark red, the sound dies, and nothing about that is scripted.

## Technical approach
TypeScript, all DSP inside an `AudioWorkletProcessor` at 48 kHz. The core is modified nodal analysis: assemble the conductance matrix **G** and source vector **i** from the netlist. Capacitors get companion models — backward Euler gives a conductance C/h in parallel with a current source carrying the previous step's state; trapezoidal is the upgrade if ringing is acceptable. Nonlinear parts (BJT via Ebers-Moll with a Vt-based exponential limiter, diodes likewise) are handled by Newton–Raphson, iterating to a voltage delta under 1e-6 or bailing at 20 iterations. Dense LU for ≤32 nodes, refactored only when topology changes or a pot moves. 4× oversampling with an IIR decimator to keep switching edges from aliasing into hash. Typed arrays throughout; if JS misses the deadline, the solver moves to Rust/WASM with the same interface.

The genuinely hard part is real-time convergence. An offline SPICE run can take a coffee break on a stiff step; an AudioWorklet has 2.6ms. Mitigations: seed each Newton solve with the previous sample's solution (usually 1–2 iterations), step-halving on divergence, and — critically — a **smoke state**: if the solver fails repeatedly, the sim declares the circuit unstable, animates a component burning out, and mutes that branch. It must never emit a NaN, because a NaN in an audio graph is a permanent silence and a very loud click on the way there.

## v1 scope
- Six part types: NPN, resistor, capacitor, diode, pot, 9V rail.
- Fixed 8×8 grid, one speaker node, hard limiter on output.
- Node-voltage heatmap overlay.
- One reachable target circuit (two-transistor astable) with a hint card.
- No saving, no sharing.

## Out of scope
Op-amps and ICs, inductors and transformers, SPICE netlist import, temperature coefficients, MIDI, component tolerances.

## Risks & unknowns
Convergence at audio rate is the whole bet — if a 12-node circuit can't hold 48k in a worklet, the toy is a slideshow. "Authentically bad-sounding" and "unpleasant" are separated by a thin margin. And a breadboard UI on a trackpad may simply be miserable to wire.

## Done means
From an empty board I place two transistors, two caps, four resistors, wire them, and hear an audible click track. Swapping one resistor shifts the frequency in the direction the RC math predicts. Shorting a base turns that node red and kills the tone — with no dropouts, no clicks, and no NaN, in Chrome, on a laptop.
