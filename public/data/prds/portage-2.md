## Overview
Portage is a cooperative coupled-movement party game for 3: one Pilot and two Bearers hauling a canoe down a wooded trail. The trail map lives on one device only — the Pilot's phone. The two Bearers are pieces who cannot see the trail; each physically controls one END of a single rigid canoe, so their inputs fight each other in real time.

## Problem
Co-op movement games hand each player an independent avatar. The specific comedy of *coupled* control — where my correction rotates the whole object and undoes yours — is almost unexplored, and marrying it to map-blindness (only the Pilot sees the obstacles) is genuinely fresh.

## How it works
The canoe is a fixed-length rigid segment on a top-down trail with trees and one narrow gap. The Pilot's phone shows the trail plus the canoe. Each Bearer's phone shows ONLY two things: a nudge pad that pushes their own endpoint, and a private **strain meter** — how hard their end is being yanked by the coupling. No map, no trees, no view of the other end. Because the segment is rigid, pushing one end both translates and rotates the whole canoe: if both Bearers push the same way it slides; if they oppose, it spins in place and both strain meters redline. The Pilot, seeing only what the Bearers can't, calls it: 'Front end, ease left; back end, hold.' The segment must thread the gap without either endpoint touching a tree. If combined strain maxes out for 3 continuous seconds, the crew 'drops' the canoe and resets to the start. Win: the canoe's midpoint crosses the finish clearing within 90s.

The per-phone split is load-bearing: real-time coupled rigid-body control needs two concurrent private controllers plus one private map — you cannot pass a single phone around.

## Technical approach
Authoritative server (PartyKit / Socket.IO over Tailscale Serve) holds the segment as two endpoints with a length constraint (or center+angle). Each Bearer streams a force vector; the server integrates simple 2D physics at ~30Hz, enforces the length constraint, detects tree collisions, and computes each endpoint's strain as the magnitude of the constraint force at that end. It broadcasts the full segment only to the Pilot; each Bearer receives only their own strain scalar. The hard part is stable constraint physics under two jittery remote inputs at low latency — server-authoritative integration with input smoothing so the canoe feels heavy-but-honest, not mushy or unfair, and strain that reads as 'we're fighting' not noise.

## v1 scope
- 1 Pilot + 2 Bearers, one handcrafted trail with a single gap
- Nudge pad + private strain meter only on Bearer phones
- Drop-on-max-strain reset; 90s timer; one win screen

## Out of scope
- 3-Bearer canoes, obstacles beyond trees, mud/current
- Scoring, multiple maps, haptics, reconnection

## Risks & unknowns
- Rigid-body physics over WebSocket may feel unfair; heavy calibration.
- The strain metaphor may be unintuitive; the puzzle may be too hard for a first play.

## Done means
Three phones join; the Pilot sees a trail and canoe neither Bearer can; two Bearers each push one end in real time; opposed pushes visibly spin the canoe and redline both strain meters; and a coordinated run threads the gap to a win — one round, no trail data ever reaching a Bearer phone or the TV.
