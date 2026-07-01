## Overview
Cell Line is a browser puzzle game about *differentiation*. Each level hands you a shapeless clump of identical stem cells and a target silhouette (a hand, a leaf, an eye, a tiny lizard). You win not by placing cells but by placing **morphogen sources** — chemical emitters whose overlapping gradients instruct cells to become bone, skin, nerve, or nothing. For biology-curious tinkerers and Zachtronics/opus-magnum types.

## Problem
Embryology is the most astonishing algorithm nobody gets to play with: undifferentiated cells reading concentration gradients and self-organizing into a body. The recent stem-cell headlines make it topical, but there's no toy that lets you *feel* how positional information becomes anatomy. Cell Line turns a real, deep idea (French-flag model, Turing patterns) into something you can push around with a mouse.

## How it works
The playfield is a grid of cells, each holding an internal state and reading local morphogen concentrations. You have a limited budget of emitters (e.g. two SHH sources, one WNT, one inhibitor) to place and tune (strength, decay radius). Press **Grow** and time runs: morphogens diffuse, reaction-diffusion produces stable gradients and stripes, and each cell differentiates by threshold rules ("high SHH + low WNT → nerve"). The resulting body is scored against the target mask. It's a place-then-simulate puzzle: you don't micromanage during growth, you set up the initial conditions and watch the pattern resolve, then iterate. Later levels add symmetry-breaking, apoptosis (cells that must die to carve fingers), and time-gated signals.

## Technical approach
Pure client-side: React + a Canvas/WebGL grid. Simulation is a cellular automaton over two float fields (morphogen A/B) updated with a Gray-Scott reaction-diffusion step, run on the GPU via a fragment shader ping-pong (or a Web Worker for CPU fallback). Differentiation is a lookup: each cell's final type = argmax over threshold rules against its sampled concentrations at steady state. Scoring = IoU of the produced tissue mask vs the target. Levels are authored JSON: target mask + available emitters + rule set. The genuinely hard part is **puzzle design that's solvable and legible** — hand-tuning reaction-diffusion params so a small set of emitter placements yields a *stable, repeatable* target pattern (RD systems are chaotic near bifurcations), and giving the player readable feedback about why a gradient produced the wrong tissue.

## v1 scope
- One field pair, Gray-Scott diffusion in a Web Worker
- 5 hand-authored levels with 2–3 emitters each and threshold differentiation
- Place/tune emitters, Grow button, IoU score + pass threshold
- Deterministic sim (seeded, fixed timestep) so a solution always replays

## Out of scope
- 3D morphogenesis, GPU shader path, apoptosis mechanics
- Level editor / sharing, story, sound

## Risks & unknowns
- RD instability may make levels feel random rather than solvable — the core design risk
- Players may not intuit gradients without strong visualization (need a concentration heat-overlay)
- Balancing "real biology" flavor vs. a fair puzzle

## Done means
A player can load level 3, place and tune emitters, hit Grow, and reach ≥90% IoU with the target; re-running the same emitter setup produces the identical tissue every time; a deliberately wrong placement visibly grows the wrong organ.
