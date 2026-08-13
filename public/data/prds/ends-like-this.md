## Overview

A browser toy that runs a physics engine backwards. Every physics sandbox goes forward: you place things, you push, you watch chaos. This one takes a *final frame* you sketch and searches for initial conditions that reach it. For tinkerers, trick-shot people, and anyone who has ever said "there's no way you could set that up on purpose."

## Problem

Forward sims are a shrug — you poke it and something happens. The interesting question is the inverse: given an outcome, what setup produces it? That question is normally locked behind gradient-based research code (differentiable physics papers) with no interface a person can hold. Meanwhile every chaotic-sim toy dies after ten minutes because there's no goal.

## How it works

1. You place static scenery (ramps, pegs, walls) in a 2D scene.
2. You place *ghosts*: translucent targets marking where bodies should end up — "this marble here, this domino flat, this box on top of that box."
3. You mark 1–3 free parameters: the launch impulse on one body, the angle of one ramp, the drop height of one weight.
4. Hit Solve. The screen fills with 60 faint ghost-trails running in parallel, tightening every generation, until one run snaps into place and gets promoted to a clean replay you can scrub and share.
5. The score is the *parameter tolerance*: a solution that only works within ±0.01 impulse gets called a fluke; one that works across a fat basin gets called a machine.

## Technical approach

Rapier2D (WASM) or Box2D-wasm for the sim, deterministic fixed-timestep, seeded — determinism is non-negotiable since the whole search assumes replayability. Search runs in a pool of Web Workers, each with its own sim instance, 200–500 rollouts/sec for small scenes.

Optimizer: CMA-ES over the free parameter vector (3–8 dims), which handles the discontinuous, non-differentiable loss that contact physics produces far better than gradients. Loss = sum over ghosts of (positional error + angular error, weighted) at settle time, where settle is detected by total kinetic energy dropping below a threshold, plus a small penalty on time-to-settle to prefer decisive solutions.

Robustness score: after a hit, resample the winning parameters with Gaussian jitter (σ = 2% of range, 100 draws) and report the hit rate. This is also the anti-degeneracy trick — chaotic scenes will happily produce a knife-edge solution that means nothing.

Hard part: loss landscapes in contact-rich scenes are near-flat with cliff edges (the marble either clears the peg or it doesn't). Mitigation is a two-stage loss — stage one scores *progress* (min distance to ghost achieved at any point in the rollout, not just at settle), stage two switches to settle-state error once any rollout gets close.

## v1 scope

- 2D only, circles and boxes, gravity fixed
- Exactly one free parameter: the impulse vector on one designated body
- Up to 3 ghost targets
- CMA-ES in 4 workers, hard 20-second budget, best-effort result
- Scene + solution serialize to a URL fragment

## Out of scope

Level editor with joints/motors, 3D, user-authored loss functions, accounts, a level browser.

## Risks & unknowns

Determinism across browsers (WASM float behavior is fine; iteration order in the broadphase is the risk — pin the engine version and ship the seed). Scenes may be unsolvable and the toy must say so gracefully rather than spin. Twenty seconds may feel long; needs the ghost-trail animation to be pleasant on its own.

## Done means

I sketch a three-domino chain plus a marble ghost in a cup, hit Solve, and within 20 seconds get a replay that lands it — with a robustness number ≥40%, and the same URL replays identically in a different browser.
