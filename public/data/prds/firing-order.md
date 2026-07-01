## Overview
Firing Order is a browser puzzle game built around a live, animated cutaway of an internal combustion engine. Each level hands you a misbehaving engine and a set of dials — spark advance, valve timing, air/fuel ratio, idle throttle — and asks you to make it run right. For gearheads, physics tinkerers, and anyone who loved the Ciechanowski engine explainer and wished it were playable.

## Problem
Interactive explainers show you *how* an engine works but never let you *break and fix* one. The satisfying part — the causal chain from a mistimed spark to a knock to a stall — is exactly what a static article can't give you. There's a game-shaped hole where the explainer ends.

## How it works
Each puzzle presents a symptom: it knocks under load, it stalls at idle, it backfires through the intake. You watch the cutaway (piston, valves, spark, flame front) in slow motion and adjust a small panel of parameters. A simplified thermodynamic + timing model scores the result on smoothness, power, and whether anything detonates. Levels escalate: single cylinder → inline-four firing order → forced induction. A "dyno" mode challenges you to maximize power without grenading the engine.

## Technical approach
TypeScript + Canvas2D (or a thin Box2D/Box3D layer only for the visual piston-crank linkage). The engine model is deliberately not a full CFD sim: a per-cylinder state machine (intake/compression/power/exhaust) with an Otto-cycle-ish pressure curve, plus heuristics for knock (peak pressure × timing advance beyond a threshold) and stall (net torque below friction at idle RPM). Render the flame front and valve lift as parametric curves. The hard part is a model that's *wrong but teachable* — physically plausible cause-and-effect without pretending to be Ricardo WAVE.

## v1 scope
- One single-cylinder engine, animated cutaway
- Three dials: spark advance, air/fuel, idle throttle
- Three puzzles (stall, knock, redline) with pass/fail scoring
- A slow-motion toggle to watch the combustion event

## Out of scope
- Multi-cylinder firing orders, turbos
- Real dyno curves / manufacturer data
- Sound synthesis (nice-to-have later)

## Risks & unknowns
Getting the model to feel causal without being a physics lie is the whole design risk. Too forgiving and it's a slider toy; too strict and it's frustrating. The animation must stay readable at slow speed.

## Done means
A player can take a stalling single-cylinder engine, adjust timing and mixture, watch the cutaway respond frame-by-frame, and reach a stable idle — with a knock failure state that's visibly caused by over-advanced spark.
