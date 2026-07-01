## Overview
Linkage is a mechanism-assembly puzzle game inspired by Ciechanowski-style interactive explainers, but where reading becomes *doing*. Each level hands you a bag of mechanical parts — gears, cams, con-rods, ratchets, escapement wheels — and a goal ("make the output shaft spin at half input speed and reverse"). You place and pin the parts; when you hit Run, a real rigid-body physics engine either turns your contraption into smooth motion or a grinding jam. For tinkerers, engineering-curious folks, and Zachtronics fans.

## Problem
Mechanical intuition is beautiful and almost never taught interactively. Explainer articles are gorgeous but passive — you scrub a slider and nod. There's no failure, no puzzle, no "I figured that out." Linkage adds stakes and a solution space.

## How it works
Each level is a constraint puzzle: fixed anchor points, a driven input, and a target output behavior (speed ratio, direction, phase, dwell). You drag parts from a tray, snap them to a grid of mount points, and connect them with pins/belts. Pressing Run drops you into the live sim; a HUD shows output RPM and phase versus target. Early levels teach one concept (gear ratio); later levels stack them (a four-stroke firing order, an anti-backlash escapement, a working differential on a turn). A par system rewards fewer parts.

## Technical approach
TS + a thin WASM binding to a 2D rigid-body engine (Box2D via box2d-wasm, or the new Box3D if going 3D) for deterministic constraint solving — revolute joints for pins, gear joints for meshes, prismatic for pistons. Rendering in PixiJS or raw WebGL2. Levels are authored as JSON: part inventory, mount graph, driven joint, and a success predicate evaluated over N sim-seconds (e.g. `abs(outputRPM/inputRPM - 0.5) < 0.02 && direction < 0`). The hard part is a *forgiving-but-honest* validator: real gear trains bind on tiny misalignments, so I quantize mounts to a lattice and use idealized gear joints, keeping the physics readable while still letting a genuinely wrong layout jam or fly apart. A deterministic fixed-timestep is essential so a solution that passes for me passes for you.

## v1 scope
- 2D only, Box2D-wasm
- Six hand-authored levels culminating in a 2:1 reversing gear train
- Drag-snap placement on a lattice, one driven input, Run/Reset
- Pass/fail on a single output-RPM predicate

## Out of scope
- 3D, belts/chains, level editor, sound design, campaign/story

## Risks & unknowns
Physics determinism across browsers can drift; may need a fixed-seed, fixed-dt lockstep. Snapping UX is make-or-break. Difficulty of authoring predicates for complex mechanisms.

## Done means
A player can open the 2:1 reversing-train level, assemble a correct gear layout, press Run, and see the success HUD go green — while an obviously-wrong layout visibly jams or fails the predicate.
