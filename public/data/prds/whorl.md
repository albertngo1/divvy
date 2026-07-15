## Overview
Whorl is a hand-crafted puzzle game about steering incompressible fluid across curved surfaces — a torus, a two-holed handlebody, a warped shell. You place sources, sinks, and vortices and carve channels so that a divergence-free flow satisfies each level's goal, exploiting the surface's holes rather than fighting them. It's for people who liked Opus Magnum's clockwork and secretly enjoy vector calculus.

## Problem
Most "flow" puzzle games are grid pipes: local, discrete, topology-blind. There's an untapped, genuinely alien puzzle space in *continuous* flow on curved manifolds, where a hole in the surface lets a whirlpool exist that couldn't on a flat sheet, and where "you can't have a source without a matching sink" becomes a hard constraint you must plan around.

## How it works
Each level gives a surface, some fixed inlets/outlets, and a goal like "deliver flux to both outlets equally" or "trap a persistent vortex around the left handle without leaking to the right." You spend a budget of sources, sinks, vortices, and carve-able channels. Press Simulate; the field solves and streamlines animate. Constraints — total source flux must equal total sink flux, no flow through walls — are enforced, so the puzzle is arranging elements so a *legal* field also *hits the target*. Par is measured in elements used; leaderboards for the elegant minimal solution, Zachtronics-style.

## Technical approach
Stack: TypeScript + WebGL/regl for rendering, WASM (Rust) for the solve. The surface is a triangle mesh; flow is a discrete divergence-free field solved with Discrete Exterior Calculus — a Hodge/Helmholtz decomposition splits any field into gradient (sources/sinks), curl (vortices), and the harmonic part, whose dimension equals 2×genus (the arXiv "fluid cohomology on surfaces" spark). Sources/sinks set divergence; vortices set curl; the harmonic component is exactly the topological knob the holes expose. We precompute cotangent-Laplacian and Hodge-star operators per level mesh and solve a sparse linear system per simulate. Hard part: keeping the solve fast and stable on coarse meshes while streamline visualization stays legible on a curved surface.

## v1 scope
- 3 fixed surfaces: sphere, torus, genus-2
- Sources, sinks, one vortex type, wall channels
- ~12 hand-authored levels with element-count par
- Streamline visualization + validity checks

## Out of scope
- Level editor / sharing
- Time-varying flow, viscosity, turbulence
- Story, campaign progression, mobile

## Risks & unknowns
- The math may be too opaque to make "fun" without heavy onboarding.
- Reading a vector field on a curved surface is a UX challenge; may need flattened views.
- Difficulty tuning around a concept most players have never met.

## Done means
A player loads the torus level, places a source and sink plus one vortex around the handle, hits Simulate, sees a stable trapped whirlpool with balanced flux, and the game confirms the goal met and reports elements-used vs. par.
