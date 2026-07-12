## Overview
Water Glass is a short single-player physics puzzler for anyone who liked *Portal*'s "one weird rule" design. The rule here is real and counterintuitive: under a high enough strain rate, even a simple liquid fractures like a solid instead of flowing. Every level is a chamber of fluid barriers, and your only verb is applying force — the *speed* of that force decides whether the fluid behaves as glass or as water.

## Problem
Non-Newtonian and strain-rate physics are usually locked inside CFD papers and cornstarch YouTube clips — fascinating, passively watched, never *played*. There's no toy that lets you internalize "fast = brittle, slow = fluid" as a mechanic you have to master. Most physics games model rigid bodies or blob fluids; almost none make the strain-rate transition the core puzzle.

## How it works
Each level has a start pod and an exit, separated by fluid membranes, pools, and streams. You aim and charge a strike; release velocity sets the strain rate at contact. A *fast* strike fractures a membrane into shards that fall away (open a door). A *slow* push displaces fluid that then re-seals behind you (route it, or drown a switch). Puzzles force mode-switching: shatter a wall fast, then wade the resulting pool slow before it re-coheres; freeze a waterfall mid-fracture to make a temporary platform; bounce a fast projectile off a fluid that's briefly solid. A par-strikes counter and a daily seeded chamber add a leaderboard.

## Technical approach
Stack: TypeScript + a 2D SPH (smoothed-particle hydrodynamics) or PBF (position-based fluids) solver on WebGPU compute, rendered to `<canvas>`. Core trick is a per-particle stress model with a strain-rate threshold: when local velocity gradient exceeds `k`, particles switch to a bonded/cohesive state (distance constraints + a fracture-energy budget), then release back to fluid below the threshold with hysteresis so it doesn't flicker. Fracture propagates by breaking bonds whose stress exceeds a limit, spawning shard rigid bodies. The genuinely hard part is a *stable and deterministic* solid↔fluid transition at 60fps — determinism is required for seeded daily pars, so fixed timestep, fixed particle ordering, and integer-friendly accumulation. Levels are hand-authored JSON (spawn polygons, fluid regions, goals).

## v1 scope
- One fluid type, ~10 hand-built levels
- Single verb: charged directional strike (velocity = charge)
- Solid↔fluid transition + shard fracture
- Par-strikes counter and reset
- Daily seeded chamber with a local high score

## Out of scope
- Multiple fluids/viscosities, temperature, buoyancy puzzles
- Multiplayer, level editor, mobile touch
- 3D

## Risks & unknowns
- SPH determinism across GPUs is fragile; may need a fixed-point or CPU fallback for daily mode
- The transition could feel mushy rather than crisp — tuning `k` and hysteresis is the whole game feel
- WebGPU support gaps on older browsers

## Done means
A player can load a level, shatter a fluid wall with a fast strike, wade the re-sealing pool with a slow push, reach the exit, and see a par-strikes score — and the same daily seed yields byte-identical fracture on two machines.
