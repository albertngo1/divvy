## Overview
Axle is a browser puzzle game about loading a semi-trailer so that total weight AND per-axle weight both stay legal, using a real rigid-body physics drop (sparked by Box3D's launch). It's for logistics nerds, dispatchers-in-training, and anyone who likes constraint-packing puzzles with a rule most people don't know exists.

## Problem
Trucks get fined and ticketed not for being over gross weight but for exceeding per-axle limits — you can be under the legal total and still illegal because the load sits too far forward over the steer axle. Real loaders learn this by getting scale tickets. It's an invisible, counterintuitive constraint that makes for a great, under-explored puzzle mechanic, and there's no fun way to build the intuition.

## How it works
Each level hands you a manifest of palletized crates (weight + dimensions) and an empty trailer with known axle positions. You place crates front-to-back; the game computes the load's center of gravity and distributes weight across steer, drive, and trailer-tandem axles via static beam reactions, showing a live per-axle scale that goes red when any axle exceeds its limit. Hit "drive" and Box3D simulates a short haul with braking and a turn — a poorly-secured or top-heavy load shifts or topples, failing the run. Scoring rewards legal loads, balanced axles, and fewest repositions. Later levels add hazmat separation and delivery-order (LIFO) constraints.

## Technical approach
Stack: TypeScript + Box3D (WASM build) for the drive-simulation phase; a lightweight 2D/3D Three.js render for placement. Data model: crates as boxes with mass/dims/CoG; trailer as a beam with axle support points. Core algorithm: axle loads via static equilibrium — solve reaction forces at support points from the summed crate moments about each axle (a determinate/indeterminate beam solve; use a simple 2-support-group approximation for v1). Physics phase feeds placed transforms into Box3D bodies with friction and a scripted brake impulse. Hard part: making axle math legible — a live diagram that shows WHY moving a pallet 30cm back drops the drive-axle load — plus reconciling the clean static solve with the messy dynamic Box3D result so "legal on paper" mostly survives the drive.

## v1 scope
- One trailer type, fixed axle config, US limits
- 8 hand-authored crate manifests
- Placement UI + live per-axle scale
- Box3D drive test with topple/shift fail
- Score = legality + balance + move count

## Out of scope
- Load securement (straps/blocking)
- Multiple trailer/axle configurations
- Route/regulatory variance by state or country
- Multiplayer or daily challenge

## Risks & unknowns
- Static axle math for real trailers is fiddly; v1 approximation must still feel fair
- Box3D outcome may contradict the static "legal" verdict — need tuning so it rarely surprises unfairly
- Niche theme may limit appeal beyond logistics folks

## Done means
Placing all crates from a manifest updates a per-axle scale in real time, a front-heavy arrangement lights the steer axle red while a balanced one stays green, and pressing drive runs a Box3D haul that topples an obviously top-heavy load and survives a legal one.
