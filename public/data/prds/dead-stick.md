## Overview
Dead Stick is a short browser action game where stealth is acoustic, not visual. You fly a fragile WWII biplane over defended terrain at night; ground crews with acoustic locators hunt you by *engine noise*. To slip through, you climb high, kill the engine ('dead stick'), and glide in silence — trading altitude for invisibility. Inspired by the HN Night Witches story: an all-female Soviet regiment who idled their engines and coasted to their targets so no one heard them coming.

## Problem
Stealth games are all light and line-of-sight (cones, shadows, Among Us vents). Almost nobody models *sound you emit* as the thing hunting you. That's a fresh, tense mechanic and a natural fit for a small physics + audio web game — and a chance to bridge a forgotten piece of history into play.

## How it works
Side/top-scrolling flight. Engine ON: you gain altitude and speed but a noise value climbs, filling detection meters at nearby acoustic-locator posts; when a post fills, a searchlight swings and AA fires. Engine OFF (dead stick): total silence, meters drain, but you steadily lose altitude and control authority. The loop: bank up over a quiet stretch, cut the engine, glide the last run over the target, drop, and coast to the exit before you're too low. Wind and thermals (audible cues) let skilled players extend glides. Score = targets hit + never-detected bonus.

## Technical approach
Stack: TypeScript + a light 2D engine (Kaboom.js or plain canvas) + **Web Audio API** as a first-class system, not decoration. Model engine noise as a value → drives both an oscillator/engine-loop gain (player-audible feedback) and a per-listener detection integral that falls off with distance². Simple point-mass flight physics (thrust, drag, lift-as-altitude-tradeoff) integrated at fixed timestep. Listener posts are objects with position, sensitivity, and a filling meter; a filled meter spawns a searchlight/AA event. Procedural level = seeded placement of posts, targets, and wind bands. Hard part: tuning the risk/reward curve so cutting the engine feels genuinely nerve-wracking but survivable, and making the audio *inform* strategy (you should be able to fly partly by ear).

## v1 scope
- One level, one plane, dead-stick toggle with altitude/noise tradeoff
- 3–4 acoustic posts with fill-meters and one searchlight event
- Single target to bomb + a 'get to exit' finish, score screen

## Out of scope
- Multiplayer, campaign, upgrades
- Historically accurate aircraft models; realistic aerodynamics
- Mobile controls (keyboard first)

## Risks & unknowns
- Audio-as-mechanic may confuse players used to visual tells; needs a visual noise meter too
- Glide physics tuning is fiddly and make-or-break for feel
- Browser autoplay policies gate Web Audio until first input

## Done means
You can climb, cut the engine to sneak past a filling listener meter, glide over and bomb the target undetected, reach the exit, and see a score with a stealth bonus — all in one seeded level.
