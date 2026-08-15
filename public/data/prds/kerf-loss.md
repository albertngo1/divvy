## Overview
A single-player descent roguelike built on one restriction: there is no building. You start inside a solid block of rock and every action you take is subtractive. A continuously running structural solver decides whether what remains stands up. The ore veins are deliberately routed through the material that is load-bearing, so the whole game is the question a real miner asks — how much can I take before it comes down on me. For players who liked the tension of digging in Terraria but wanted the rock to have an opinion.

## Problem
Mining games treat rock as inventory. Removing a block has no consequence except the block being gone, so digging becomes a chore between fights. Meanwhile actual structural collapse is a beautiful game mechanic: irreversible, spatially reasoned, and legible once you can see stress. Nobody has made the *only* verb "cut" and let statics be the enemy.

## How it works
- A 2D cross-section cavern, viewed side-on. You control a cutter with a fixed cut width.
- Every cut removes the targeted cells **plus a one-cell kerf** on each side — so material lost to sloppiness is gone permanently, and precise cuts are strictly better than fast ones.
- After each cut, the solver redistributes load. A stress overlay (toggleable, but limited by lamp fuel) shows which bonds are near yield.
- Bonds above threshold snap. Snapping redistributes load, which can snap more — avalanche. A collapsing ceiling kills you.
- Ore, water pockets, and the exit shaft are procedurally placed with a bias toward *high-stress* cells, so the greedy move is always the dangerous one.
- Run currency: extracted ore. Between runs you buy narrower cutters, better lamps, and shoring beams — the one non-subtractive item, deliberately expensive.

## Technical approach
Godot 4 with the simulation in a C++ GDExtension. The rock is a lattice spring model: a 128×128 grid of nodes, each linked to its 8 neighbors by axial springs plus angular springs to resist shear, with gravity as a body force. Each step solves **Ku = f** for nodal displacement using preconditioned conjugate gradient, warm-started from the previous frame's solution — after a small cut the displacement field barely moves, so convergence is a handful of iterations and stays inside a frame budget. Per-bond strain maps to a scalar stress; bonds over threshold are removed and the solve repeats until stable (the classic quasi-static random fuse / spring network fracture loop).

The hard part is the avalanche case: a big collapse can mean dozens of re-solves in one frame. Mitigation is to run the solver on a worker thread at a fixed tick, let the visuals lag by a beat during a collapse (which reads as rock *groaning* before it falls — a feature), and cap iterations with a graceful "everything in this region fails" fallback. Second hard part is legibility: raw von Mises heatmaps are mush, so v1 renders only the top decile of stressed bonds, as hairline cracks that widen.

## v1 scope
- One hand-authored 128×128 cavern, no procedural generation.
- Mouse-drag cutting, kerf on, stress overlay always visible.
- Two outcomes: reach the exit, or get crushed.
- No ore, no meta-progression, no menus.

## Out of scope
3D. Enemies. Water simulation. Shoring beams. Sound design beyond one collapse cue.

## Risks & unknowns
The fun may live entirely in a narrow band of solver tuning — too forgiving and it's just digging, too brittle and every run ends in 30 seconds. Lattice spring models are notoriously sensitive to threshold distributions; expect a week of tuning disguised as a week of coding. Players may not read stress visuals at all without a tutorial cavern that kills them once on purpose.

## Done means
A playtester with no explanation cuts into a pillar, sees cracks propagate, backs off, and re-routes their tunnel — without being told the rock could fall.
