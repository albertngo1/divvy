## Overview
Tempco is a single-player browser toy/puzzle box about a phenomenon almost nobody gets to see: a resistor's resistance depends on its temperature, its temperature depends on the power it dissipates, and the power depends on its resistance. You place components on a small board, set an ambient temperature, and the simulator solves that circular dependency. For hobbyist EEs, physics teachers, and anyone who liked falling-sand games but wants the sand to obey material science.

## Problem
Every intro circuits course teaches Ohm's law with temperature-independent resistors, which is a lie that hides the most interesting behavior in real electronics: self-regulating PTC heaters with no controller, thermal runaway in paralleled power devices, why precision instruments are built from manganin instead of copper. There is no interactive place to *feel* this loop. Static SPICE plots don't convey that it's a fixed-point search that can fail to converge.

## How it works
Drag components onto a 6×6 board: a voltage source, and resistive elements made of real materials — copper (α ≈ +0.39 %/°C), nichrome (+0.04 %), manganin (±0.002 %), carbon film (negative), plus PTC and NTC thermistors with exponential curves. Each element has a real thermal resistance to ambient and a thermal mass; adjacent tiles conduct heat to each other.

The sim runs a transient loop: solve the resistive network for currents, compute P = I²R per element, integrate each element's temperature with its RC thermal model, update R(T), repeat. Every element emits a sine tone whose pitch tracks its temperature and whose amplitude tracks its dissipated power — a stable board hums a steady chord, a thermal oscillator warbles, and runaway is an audible slide upward into a screech before the tile chars.

Puzzles: (1) hold an LED's current within ±2 % as ambient sweeps 0–70 °C; (2) build a heater that self-regulates at 40 °C with *no* controller (PTC self-limiting — the real trick in car seat heaters); (3) make a relaxation oscillator using only an NTC and thermal lag; (4) survive a paralleled-transistor hot-spot level where the positive tempco steals current from its neighbors.

## Technical approach
Vanilla TypeScript + Canvas, no framework. Circuit solve: modified nodal analysis on a sparse matrix (dense LU is fine at 36 nodes) each timestep; resistances are frozen within a step so the electrical solve stays linear and the nonlinearity lives in the outer time loop. Thermal: explicit Euler on a lumped-capacitance grid, dt adaptive on the fastest thermal time constant. Runaway detection = dT/dt exceeding a threshold while ambient is fixed, which is physically honest (there is no stable fixed point). Material constants from published α and resistivity tables baked into a JSON. Audio: Web Audio, one OscillatorNode per element into a shared gain bus, pitch = log-mapped temperature.

The genuinely hard part is numerical: the electro-thermal loop is stiff, and naive stepping either shows fake oscillation or fake stability. Needs a step-size controller and a check that damping isn't hiding a real instability.

## v1 scope
- 6×6 board, one source, four material types + NTC
- Ambient temperature slider, play/pause, thermal heatmap overlay
- Sonification of temperature per tile
- Three puzzles with pass/fail conditions
- Share-a-board URL hash

## Out of scope
Capacitors/inductors, semiconductors beyond a lumped model, real SPICE import, mobile touch layout.

## Risks & unknowns
Stiffness may force an implicit solver. Sonification with >6 oscillators may turn to mud; may need to sonify only the hottest three. Puzzle 2 might be trivially solvable by brute force — needs playtesting.

## Done means
Placing a PTC element across a source at 20 °C ambient produces a board that heats, self-limits at a stable temperature, and holds a steady tone; raising ambient to 70 °C audibly shifts the pitch but does not run away — while the same board built from copper does run away, and the sim says so before it chars.
