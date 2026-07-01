## Overview
Trapline is a browser physics toy where you play an ambush predator — inspired by the newly-discovered Australian ballista spider — building spring-loaded snares to catch ants. It's a goal-driven contraption puzzle for tinkerers and physics-curious players who find open sandboxes aimless.

## Problem
Physics sandboxes (and the shiny new Box3D) are gorgeous but purposeless; classroom elastic-energy demos are dry sliders. The itch: a toy with a *win condition* that quietly teaches how a real animal stores and releases energy, so you feel clever instead of lectured.

## How it works
Each level streams ants along a patrol path. You get a parts budget: silk threads (springs/joints), anchor points, a tripwire sensor, and a latch. You pre-load a snare by stretching silk to store tension, latch it, then hit Run. When an ant crosses the tripwire the latch cuts, releasing the stored elastic energy that whips the snare closed. You're scored on ants caught, silk used, and energy efficiency (stored vs. delivered). Beat par to earn medals; replays are deterministic so you can share a seed and compare solutions.

## Technical approach
Static web app: Canvas + a Box2D-via-WASM binding (planck.js or box2d-wasm). A latch is a distance joint you programmatically destroy on a trigger; stored elastic PE modeled as ½·k·x². The tripwire is a sensor fixture firing on overlap. Data model: `level = { antPath, partBudget, anchors, par }`; a solution is `{ parts[], preloads[] }`. Fixed timestep + seeded solver for deterministic replay. The genuinely hard part is keeping high-stiffness springs from exploding the solver at release — needs soft constraints, bumped velocity/position iterations, a capped max stored energy, and sub-stepping the release frame.

## v1 scope
- 5 hand-authored levels
- One spring type, one tripwire, one latch
- Deterministic run + replay from a seed
- Par score + bronze/silver/gold medal
- Ant AI = pure path-following, no evasion

## Out of scope
- Level editor and sharing
- 3D / Box3D upgrade
- Multiple predator types, multiplayer
- Mobile touch tuning

## Risks & unknowns
- Solver instability at the stiffness needed for a satisfying *snap*
- Fun-tuning: the gap between 'trivial' and 'impossible' is narrow in physics puzzles
- Whether energy-efficiency scoring reads as fun or as homework

## Done means
A player can assemble a latch-and-release snare within the silk budget that catches at least 3 of 5 ants; the run replays identically from its seed; and 5 levels ship with working par scores and medals.
