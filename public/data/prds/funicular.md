## Overview
A puzzle game about form-finding: you design arches, vaults, and towers using the trick behind the Sagrada Família — Gaudí found his ideal compression shapes by hanging weighted chains and inverting the result. In Funicular you sculpt a hanging catenary net, flip it, and a real physics engine loads the flipped structure to see if it stands. It's for the curious-engineer / museum-brain crowd who found the Sagrada Família math post irresistible.

## Problem
Structural intuition is invisible and rarely playable. People marvel at Gaudí's ruled surfaces and catenary vaults but have no hands-on way to feel *why* a hanging chain is the secret to a standing arch. Existing bridge-builder games optimize trusses in tension/compression soup; none teach the elegant funicular inversion or let you literally hang-and-flip a form.

## How it works
Each level gives supports (piers, a span to cover, a load to carry) and a budget of chain/material. In "hang" mode you pin nodes and let a weighted chain net settle under gravity into its natural catenary — you tune anchor points and weights to shape it. Hit FLIP: the settled shape mirrors vertically into a pure-compression structure. Then "test" mode applies the level's live loads (self-weight, a point load, wind) and runs the solver; struts glow green in compression, red if they go into tension or buckle. You pass if nothing goes red under the required load. Score rewards material economy and elegance (low tension everywhere). Daily seeded challenge + par like a golf hole.

## Technical approach
Stack: TypeScript + a 2D physics/constraint solver. Hang mode is Verlet integration on a distance-constrained node graph (classic cloth/rope sim) — cheap and stable. Flip is a vertical reflection of settled node positions. Test mode evaluates the flipped truss with a small static equilibrium / stiffness-matrix solver (2D pin-jointed truss: assemble the global stiffness matrix, solve `K·u = f`, read member axial forces) to classify each member tension/compression and flag buckling via Euler's critical load given member length and section. Rendering in Canvas/WebGL; levels are JSON (`supports, loads, budget, seed`). The genuinely hard part is making the linear-static solver robust to near-singular/mechanism configurations and surfacing *why* a design fails in an intuitive, colored way rather than a numeric dump.

## v1 scope
- 2D only, pin-jointed members.
- Hang → flip → static test loop on ~6 hand-made levels.
- Green/red member coloring + pass/fail + material score.

## Out of scope
- 3D ruled surfaces / hyperboloids.
- Dynamic/wind simulation beyond a static equivalent load.
- Multiplayer or a level editor.

## Risks & unknowns
- Solver stability on degenerate geometries.
- Teaching the flip concept without a wall of text.
- Fun vs. accuracy tradeoff — real statics can feel punishing.

## Done means
A player hangs a chain across a two-pier gap, flips it into an arch, runs the load test, sees all members glow green under the required point load, and clears the level — while a deliberately flat (non-funicular) shape visibly fails with red tension members.
