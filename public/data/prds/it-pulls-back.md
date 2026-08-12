## Overview

A browser modular synthesizer built on acausal modeling instead of signal flow. Modules are not functions from input to output; they are electrical components with two-way terminals. You wire an undirected graph, the solver figures out what flows where, and every patch decision has physical consequences — including the ones digital modulars quietly delete. For synth nerds, circuit-bending types, and anyone who has wondered why their VST filter sounds "too clean."

## Problem

Every software modular (VCV, Reaktor, Max) is causal: an output is a buffered value, an input is a read. That is a lie about analog. In real hardware, a passive multiple splits current, so patching one LFO into three destinations sags its amplitude; a filter's input impedance detunes the oscillator feeding it; a patch cable's capacitance rolls off highs. Those "flaws" *are* the sound people chase with expensive Eurorack, and they are structurally impossible to express in a directed-graph engine.

## How it works

Drag components onto a board: voltage sources, resistors, capacitors, inductors, diodes, transistors, op-amps, plus prefab blocks (a real Sallen-Key filter, a diode ladder, a Schmitt oscillator). Cables connect terminals with no arrowheads. Press play and the whole board is solved as one circuit at 48 kHz. A meter shows per-node voltage and per-branch current, so you can *watch* an oscillator's amplitude drop as you add the third mult. A "cable" has real parasitics you can dial: length in meters, capacitance per meter.

## Technical approach

Rust → WASM in an AudioWorklet. Build the system with Modified Nodal Analysis: unknowns are node voltages plus branch currents through voltage sources; each component stamps its contribution into a sparse `G` matrix and `i` vector, exactly as SPICE does. Reactive components use trapezoidal companion models (a capacitor becomes a conductance `2C/h` in parallel with a current source depending on last sample). Nonlinear parts (diode Shockley equation, BJT Ebers-Moll) get Newton-Raphson — but budget one to three iterations per sample and cache the factorization, using KLU-style LU with a fixed sparsity pattern recomputed only when the topology changes (i.e. when the user moves a cable, not per sample). Aliasing on hard nonlinearities is handled by 4× oversampling on the nonlinear subcircuit only. The genuinely hard part: a naive MNA build makes topology edits recompile the matrix on the audio thread. Solution — do the symbolic phase (index detection, ordering, LU pattern) on the main thread, ship the compiled kernel to the worklet, and crossfade between old and new kernels over 5 ms so patching doesn't click.

## v1 scope

- Eight component types: source, R, C, L, diode, op-amp (ideal), switch, output probe
- Max 24 nodes
- Linear solve + one Newton iteration; mono out
- One demo patch: an oscillator that visibly detunes when you patch its second output

## Out of scope

MIDI, polyphony, saving/sharing patches, transistor models, a module marketplace.

## Risks & unknowns

Stiff circuits can blow up at 48 kHz — need a per-sample divergence check that mutes rather than emits a DC bomb. Whether the loading effect is *audible* enough to justify the whole premise is the core bet; validate with an A/B against the same topology run buffered.

## Done means

Patch one oscillator into one filter and record it. Patch the same oscillator into three filters. The recordings differ measurably — amplitude down, cutoff shifted — and no code anywhere in the project contains a per-module `process(input) → output` signature.
