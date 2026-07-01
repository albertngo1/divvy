## Overview
Pull is a single-screen drag-toy that models a real pull-back car. Wind the spring by dragging the car backward — true Hooke's-law energy accumulates (½kx²) — then let go and watch the stored joules convert to distance across surfaces with honest friction. Over-wind it and torque flips the car instead of launching it: the built-in viral clip. The whole point is that the numbers are real, so the physics is something you feel rather than read.

## Problem
The illustrated pull-back-car teardown went viral because everyone owned one and nobody knew a coiled spring plus flywheel did the work. That intuition — drag back, store energy, release — is a physics lesson people would *feel* if you let them play with the real numbers instead of a cartoon. No toy currently connects "pull twice as far" to "goes four times as far" viscerally.

## How it works
You drag the car left; a spring compresses with force `F = kx` and an energy meter fills to `½kx²`. Release: the stored energy dumps into a flywheel, then the wheels, then across a floor whose friction coefficient you choose (ice, wood, carpet, sandpaper). The car coasts the physically-correct distance and stops. Push past the spring's travel limit and the release torque exceeds the tip threshold — the car flips. Enrichment ramp: swap spring constants, wheel mass, add an incline, race two cars.

## Technical approach — be specific and technical
Stack: TypeScript + a 2D physics engine — Matter.js (or Planck.js/box2d-wasm for stiffer, more accurate contacts) rendered to `<canvas>`. No backend; a static single-page toy. Pointer drag via native pointer events, with `x` = drag distance clamped to the spring's max travel.

Physics: on release, spring PE `E = ½·k·x²` converts to translational KE, giving launch velocity `v = sqrt(2·E·η/m)` where `η` is a drivetrain-efficiency factor and `m` is car mass. Deceleration under kinetic friction is `a = μ·g`, so ideal coast distance is `d = v²/(2·μ·g)` — this closed form is the ground-truth the simulation must match, and it makes the quadratic "twice the pull → 4× distance" fall out honestly (since `v ∝ x`, `d ∝ x²`). The engine integrates the actual rolling body; the closed form is used as a test oracle.

Flip logic: model release as an impulse applied at wheel-contact height; when the resulting angular impulse about the rear axle exceeds the gravitational restoring torque (`impulse·h > m·g·(wheelbase/2)`), the body tips. Data model is tiny: `{ k, x, mass, mu, efficiency, ramp }` plus derived `E, v, d`. A HUD shows live `x`, `E` in joules, and predicted vs. actual distance so the realness is visible.

The genuinely hard part: making the engine-simulated distance agree with the analytic `v²/(2μg)` within a few percent. Discrete-time friction integration, contact-solver damping, and restitution all leak energy, so tuning the engine (or overriding friction with a custom per-step deceleration) to honor the closed form is the real work.

## v1 scope (humiliatingly small)
- One car, one flat floor, one spring
- Drag left to charge, showing the energy number in joules
- Release; car decelerates to a stop at the physically-correct distance
- No friction menu, no flip, no art beyond a rectangle

## Out of scope (for now)
- Friction-surface picker, ramps, flip mechanic
- Multiple cars / racing, tunable wheel mass
- Flywheel visualization, sound, sharing/export

## Risks & unknowns
- Physics engines leak energy; matching the analytic distance is fiddly
- Drag-to-charge feel (resistance, clamp) needs tuning to read as a spring
- May need a custom friction step instead of trusting Matter.js defaults

## Done means — concrete, testable
You drag the block back, feel the spring resist, release, and it coasts to a stop — and pulling twice as far sends it roughly four times as far, because ½kx² is actually driving it.
