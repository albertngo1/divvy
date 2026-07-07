## Overview
Riprap is a browser physics puzzle for people who like satisfying stacking games (Poly Bridge, World of Goo) and secretly love coastal engineering. You defend a small harbor by placing interlocking concrete armor units — dolosse, tetrapods, accropodes — on a rubble-mound breakwater, then survive escalating storm waves.

## Problem
The HN Dolosse post is a rabbit hole: weird interlocking concrete shapes, invented in South Africa, quietly holding back oceans worldwide — and nobody has made a game about the genuinely tense puzzle of packing them. Meanwhile Cities: Skylines lets you build coastlines but never makes the sea *fight back* at the armor-unit scale. Riprap builds the bridge: the sea is the boss, the dolosse are your only defense.

## How it works
Each level gives you a harbor cross-section, a budget of armor units of set shapes, and a target design wave height. You drag-drop and rotate units onto the breakwater slope; they settle under gravity with real friction and interlock. Hit START STORM and waves roll in with rising significant wave height H_s. Units that get dislodged tumble; if the mound's crest is breached, harbor water floods and you fail. Score = waves survived + units remaining + how few units you used (elegance bonus). A daily seeded storm gives a shareable leaderboard.

## Technical approach
Rust→WASM Rapier2D (or matter.js for a faster v1) for rigid-body sim; units are compound colliders authored from the real dolos/tetrapod silhouettes so they genuinely hook together. Waves are a scripted force field: a moving pressure pulse along the water surface driving buoyancy + drag on submerged units, with H_s ramped per wave from a Pierson-Moskowitz-flavored spectrum. Scoring cross-checks a simplified Hudson stability number (K_D · relative density · cot slope) so 'correct' engineering roughly wins — the hidden hook is that players rediscover why random-placed dolosse beat neat stacks. The genuinely hard part is a stable, non-jittery pile of thousands of contact points at 60fps; solve with sleeping bodies, sub-stepping, and capping active unit count to the top armor layer.

## v1 scope
- One breakwater cross-section, one unit shape (dolos)
- 8 hand-tuned storm levels of rising H_s
- Drag/rotate placement + START STORM + pass/fail
- Daily seeded storm with a copy-to-clipboard result string

## Out of scope
- 3D, real bathymetry, multiple harbor geometries
- Multiplayer / sandbox city-building
- Accurate CFD wave modeling

## Risks & unknowns
- Rigid-body stacking may feel floaty or explode; needs heavy tuning
- Interlocking colliders are expensive — perf on phones uncertain
- Fun might live entirely in the tuning, which is the whole game

## Done means
A player can place dolosse, survive at least a 5-wave storm, fail by a crest breach, and share a daily seed result — all client-side at a stable frame rate on desktop Chrome.
