## Overview
Mainspring is a browser physics game for tinkerers and STEM-curious kids where you design the guts of a pull-back friction car — spiral spring stiffness, gearbox ratio, wheel radius, chassis mass — then release it down a track to hit precise objectives. It takes a beloved toy and hands you the engineer's dials behind it.

## Problem
Everyone has pushed a pull-back car and watched it zip off, but almost nobody knows *why* it goes a fixed distance, why heavier ones stall, or how the ratchet stores energy. The HN pull-back-car teardown is delightful precisely because the mechanism is hidden. There's no playful sandbox that lets you feel the tradeoffs of spring energy vs. traction vs. mass.

## How it works
You wind the car by dragging it backward a set distance (this loads the spiral spring to a torque proportional to turns). On release, the spring discharges through a fixed gear train to the drive axle. Each level poses a goal: stop exactly on a parking spot, clear a ramp gap, out-roll a rival, or crest a hill without stalling. You tune four sliders (spring constant, gear ratio, wheel radius, mass) plus a wind-back distance, then hit Go and watch a side-view sim. Score = closeness to target. Backlash, wheelspin (when torque exceeds traction), and the moment the spring fully unwinds and the car coasts on inertia are all modeled and visible in a live energy meter.

## Technical approach
Stack: TypeScript + a 2D physics engine (matter.js or a hand-rolled rigid-body + torque integrator for accuracy) rendered on canvas. Core model: spring stores E = ½·k·θ². Torque τ = k·θ decays as it unwinds; axle torque = τ · gearRatio; tractive force F = min(axleTorque / wheelRadius, μ·m·g). Integrate with fixed-timestep semi-implicit Euler; detect wheelspin when demanded F exceeds friction cap and dump the excess into a spinning-wheel animation. The genuinely hard part is making wheelspin, coast-down rolling resistance, and spring depletion all feel intuitive rather than fiddly — a lot of tuning of units so sliders map to legible outcomes. Track geometry is a polyline; ramps/gaps are collision segments.

## v1 scope
- Four sliders + wind-back drag, one flat track, one 'stop on the spot' goal
- Side-view canvas sim with a live spring-energy bar
- Score by distance error, three-star thresholds
- 5 hand-authored levels

## Out of scope
- Multiplayer / rivals racing
- 3D, custom track editor, sound design
- Real hardware export / 3D-print files

## Risks & unknowns
- Physics legibility: if wheelspin feels random, players rage-quit
- Slider ranges that make every level a one-tweak solve (too easy) vs. unsolvable
- Whether coast-down realism matters or just adds noise

## Done means
A player can load the page, tune the car, release it, and reliably stop within 5cm of the target on level 1 after ≤4 attempts, with the energy bar visibly emptying as the car moves.
