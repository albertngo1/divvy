## Overview
Blowby is a browser puzzle-sim: you're handed a pile of engine parts — pistons, rods, crank, valves, cam — and must assemble a four-stroke engine that actually turns over. It rewards mechanical intuition over twitch. For the Ciechanowski-explainer crowd who want to *touch* the thing, not just scroll it.

## Problem
Beautiful interactive engine explainers are read-only. Games with engines abstract them to a horsepower number. There's no toy that lets you feel *why* firing order and clearances matter by getting them wrong and hearing it knock.

## How it works
Each level gives loose parts and a target (idle stable for 10s / hit redline / survive a load). You snap parts into a block, set the firing order, and dial clearances via sliders. Hit start: a physics loop drives the crank, pistons reciprocate, valves open on the cam profile, and a simple combustion model applies force pulses at ignition. Bad tolerances leak compression ("blowby"), wrong firing order shakes the mount apart, over-advanced timing makes it knock. Audio is synthesized from the actual crank RPM and cylinder events, so the engine *sounds* right or wrong.

## Technical approach
Stack: TypeScript + Three.js for rendering, and Box3D (the just-announced open-source 3D physics engine) compiled to WASM for the constraint solver — hinge/slider joints model the crank and pistons directly. Combustion is faked as timed impulses on each piston at its ignition point, scaled by a compression factor derived from the clearance slider. Firing order is a schedule the sim reads per crank revolution. Web Audio synthesizes engine note from RPM + per-cylinder event ticks. Data model: `Engine{ cylinders[], firingOrder[], clearances{} }` → deterministic sim step. The hard part: keeping a jointed rigid-body engine numerically stable at high RPM without the solver exploding — needs substepping and sane joint limits.

## v1 scope
- Single inline-2 then inline-4 engine
- Assembly snapping + firing-order + clearance sliders
- Physics-driven crank with impulse combustion
- Synth audio that degrades with bad setup

## Out of scope
- V-engines, turbos, fuel maps
- Fluid/thermal simulation
- Campaign / progression beyond a few levels

## Risks & unknowns
- Box3D is brand-new; WASM bindings and joint stability unproven
- High-RPM solver blowups
- Teaching the controls without a wall of text

## Done means
A player with no manual can assemble the inline-4, set a correct firing order, tune clearances until it idles for 10 seconds, and hear the note smooth out as they do — with a wrong firing order audibly shaking the mount.
