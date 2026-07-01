## Overview
Preload is a browser physics puzzle for tinkerers who love a satisfying mechanism. Each level is a cross-section of dirt and twigs; ants and beetles scuttle along fixed paths. Your job is to build and *pre-load* a spring trap — compress a spring, wind a torsion beam, bend a sapling — and release the stored energy at exactly the right instant to snap it shut on your target. It's the ballista spider's snare and a pull-back car's flywheel, turned into a toy box.

## Problem
Most physics games are about pushing things (Angry Birds) or stacking things. Almost none are about *stored* potential energy — the tense, cocked, about-to-fire feeling of a mousetrap. That mechanical anticipation is criminally underused, and the spider/pull-back-car teardowns show people are viscerally curious about how loaded mechanisms release.

## How it works
You drag components from a tray: springs (set compression), hinges, anchor pins, a trigger tripwire, and mass blocks. Compressing a spring or bending a sapling costs from a per-level 'energy budget' shown as a gauge — over-winding is possible but scored down. You hit PLAY; critters march; when a critter crosses your tripwire (a sensor body), the pinned spring releases and the snare fires. Catch the target with the fewest components and least stored energy for a three-star, par-golf score. A ghost replay lets you tune timing frame by frame.

## Technical approach
Stack: vanilla TS + matter.js for rigid-body sim, rendered to Canvas. Springs are `Matter.Constraint`s with tuned stiffness; 'loading' means displacing a body against a constraint and holding it with a temporary pin constraint that the tripwire's collision callback removes, converting stored constraint energy into motion. The tripwire is a static sensor body checked in `Matter.Events.on('collisionStart')`. Deterministic replay is the hard part: matter.js is only near-deterministic across machines, so levels use a fixed timestep (`Matter.Runner` at locked 60Hz), fixed iteration counts, and a seeded critter AI (pure state machine, no RNG) so a solution that works locally reproduces on the leaderboard. Energy budget = sum of ½·k·x² across loaded constraints, computed at PLAY.

## v1 scope
- One spring type + one hinge + tripwire + anchor pins
- Three handcrafted levels, one critter type on a linear path
- Energy gauge and star scoring; local best-time only
- Play / reset / step-frame controls

## Out of scope
- Level editor, sharing, online leaderboards
- Multiple materials (rope, elastic, water), destructible terrain
- Mobile touch controls

## Risks & unknowns
- Cross-machine determinism in matter.js may not hold; may need to record input-only and replay, or accept local-only scoring
- 'Fun' of timing may collapse into frustrating pixel-perfect trial-and-error without generous trigger windows
- Communicating stored-energy state visually (how cocked is this spring?) is a real UX challenge

## Done means
A player can load a spring against a pin, place a tripwire, hit PLAY, and watch an ant trip the wire and get snapped by the released spring — with the energy gauge reflecting the spring's compression and a star rating awarded on catch.
