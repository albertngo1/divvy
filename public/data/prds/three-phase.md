## Overview
A browser sandbox/puzzle game where you construct digital logic out of parametrons — the parametric-oscillator logic element that ran Japan's PC-1 in 1958, using neither transistors nor tubes. Every element is a nonlinear oscillator whose ODE is integrated at audio sample rate, so the circuit you build is simultaneously the sound you hear. For people who liked NAND-game-style puzzles but found abstract truth tables bloodless, and for anyone who wants to *feel* parametric resonance.

## Problem
Logic-puzzle games hand you gates as lookup tables. Parametron logic is genuinely alien and teaches something real: a bit is which of two stable phases an oscillator settled into (0 or π), a gate is a majority vote over summed input currents, an inverter is a physical twist in a wire, and information only flows forward because three pump clocks fire in rotation. None of that is playable anywhere, and the underlying physics — degenerate subharmonic bifurcation, Mathieu instability, metastability from thermal noise — is beautiful and almost never made tactile.

## How it works
Drop oscillators on a grid; wire them with couplings that are either straight or twisted (twist = invert). Assign each element one of three pump clocks (I, II, III). An element only latches while its pump ramps up, taking the summed drive of its neighbors on the previous clock — three inputs, majority wins. AND is majority with one input tied to a constant-0 element; a full adder is three parametrons. Puzzles: inverter, majority, full adder, 4-bit ripple counter, shift register — scored on element count and pump energy. A pump-ramp-rate dial exposes the real hazard: ramp too hard on a near-tied input and the element locks onto thermal noise instead of its inputs. Slow the carrier to 2 Hz to watch phasors crawl; crank to 5 kHz to hear the same simulation as a chord where a carry bit flipping is an audible phase inversion.

## Technical approach
TypeScript + Canvas + an AudioWorklet that owns the integrator. Per element state (x, v), integrated with velocity-Verlet at 48 kHz:
`ẍ + 2γẋ + ω₀²(1 + h_k(t)·cos(2ω₀t))x + βx³ = Σ_j w_ij x_j + n(t)`
where β is the saturating ferrite-core nonlinearity that makes two phase states stable, h_k(t) is a trapezoidal pump envelope on one of three 1/3-duty-offset clocks, and n(t) is Box–Muller Johnson noise scaled by γ so metastability is emergent, not scripted. Bit readout = sign of a one-pole quadrature demodulation of x against cos(ω₀t). Circuit is a plain adjacency list; audio out is the summed x of tapped elements. Puzzle validation runs the same integrator headless over all input combinations with noise injected, at three different pump ramps.

Hard part: stiffness and CPU. ω₀ ≈ 1 kHz with 100 coupled elements at 48 kHz is ~5M state updates/sec in a worklet with a 3 ms deadline. Fallback: run a slowly-varying-envelope (complex amplitude) model for validation and off-screen elements, full ODE only for the visible/audible subgraph.

## v1 scope
- 12 elements max, fixed 1 kHz carrier, fixed γ/β
- 3 puzzles: inverter, majority-3, full adder
- Phasor view (hue = phase), single audio tap, run/step/slow
- Validation over all input combos with noise on

## Out of scope
- Real ferrite hysteresis from datasheets, save/share circuits, mobile, campaign progression, multi-clock-domain designs

## Risks & unknowns
- The physics may be fiddly rather than fun; mitigate with a "clean mode" that snaps phases and a noise slider starting at zero
- Audio may just be a drone — needs a comb/tap design pass to make bit flips legible by ear
- Worklet CPU budget may force the envelope model earlier than planned

## Done means
A player wires three parametrons plus one twist into a full adder, hits run, hears the carry flip the chord, and the puzzle validates green across all 8 input combinations with noise enabled — and turning the pump-ramp dial past 0.7 makes it fail with a visible metastable element.
