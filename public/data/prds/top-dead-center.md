## Overview
Top Dead Center is a browser rhythm-of-machinery game inspired by interactive engine explainers. You *are* the distributor: pistons pump in the firing order, and your only job is to trigger each cylinder's spark at the moment its piston hits top dead center. Miss the window and you get knock, misfire, and a shaking, stalling engine. Nail it and the motor purrs and revs.

## Problem
Engine explainers are beautiful but passive — you scrub a slider and watch. There's a latent *game* in the timing itself: firing order, spark advance, and RPM make a genuinely hard, escalating rhythm challenge, and nobody's turned that mechanism into something you play.

## How it works
A cross-section shows N pistons cycling. Each approaches TDC on the compression stroke; a shrinking window opens and you must press its key (or tap its cylinder) inside it. As you keep the engine happy, RPM rises, windows shrink, and — the twist — at higher RPM you must fire *before* TDC (spark advance), so the target moves. Firing order scrambles which cylinder is next. Modes: idle (forgiving), redline run (survive rising RPM), and a firing-order puzzle where you must deduce the sequence from feedback.

## Technical approach
Stack: TypeScript + Canvas, single page, Web Audio for the engine note. A lightweight kinematic model drives piston position: crank angle advances at a rate set by RPM, piston height is `cos(crankAngle)` per cylinder offset by the firing order. Each cylinder has a firing window centered at TDC minus an advance term that grows with RPM. Input is timestamped against `requestAnimationFrame` crank angle; scoring is |Δangle| from the ideal. The engine sound is synthesized — a base oscillator whose frequency tracks RPM plus a click/thump triggered per correct firing — so audio feedback is tight. The genuinely hard part is *game feel*: the input-to-audio-to-visual latency must be low enough that a well-timed press feels crisp, which means pre-scheduling Web Audio events and decoupling the sim tick from render.

## v1 scope
- 4-cylinder engine, fixed firing order (1-3-4-2)
- TDC timing windows + hit/miss scoring
- Rising RPM with shrinking windows (redline mode)
- Synthesized engine note that tracks RPM

## Out of scope
- Spark advance mechanic and firing-order puzzle mode (v2)
- Multiple engine configs (V8, rotary)
- Leaderboards, accounts

## Risks & unknowns
Audio timing precision in-browser is the make-or-break; jitter kills the feel. The kinematics must be visually legible fast — players need to *read* where TDC is without a manual. Difficulty ramp could frustrate before it satisfies.

## Done means
A player can start the engine, correctly time sparks against visibly cycling pistons with crisp audio feedback, and in redline mode survive a rising-RPM curve until the timing windows become too tight — with hits and misses scored against true crank angle.
