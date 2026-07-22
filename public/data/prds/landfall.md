## Overview
A cooperative white-knuckle steering game for 1 Navigator + 2 rowers. The Navigator's phone is the nautical chart — the only view of the reefs and the harbor. Everyone else holds one oar and cannot see the water at all.

## Problem
Most 'one phone is the map' games make the pieces passive tokens the seer drags around. The itch here: make the pieces *do the physics themselves*, blind, so the Navigator has to trust hands they can't see and the rowers have to trust a mouth that can see everything but can't touch anything.

## How it works
The boat crosses a strait in 8 discrete beats. Each beat, a 4-second commit window opens.

**Navigator phone (the board, PRIVATE):** an overhead chart — the boat as an arrow with current heading, scattered hidden reefs, a drifting current vector, and the harbor mouth. The Navigator has NO oar controls. They can only look and talk.

**Rower phones (PRIVATE, one each):** no chart at all. Each shows a single big oar dial — PULL-LEFT / PULL-RIGHT / BACK — plus a private *fatigue* meter for that one oar. Over-pulling a tired oar makes the stroke slip to half-strength (the rower knows; the Navigator does not). Each beat, every rower secretly picks a stroke and locks it before the timer ends.

**Resolve:** on the shared host TV, all committed strokes reveal at once and sum into a movement vector; the boat lurches, current shoves it, and the TV shows the wake — but never the reefs. Only the Navigator's chart shows how close the hull just came to rock. Hit a reef and you take a hull crack; three cracks sink you. Reach the harbor in 8 beats to win.

The fun is the Navigator screaming 'HARD LEFT, don't back-oar!' while a rower privately sees their left oar is spent and has to decide whether to fake-strength it.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{beat, boatPos, boatHeading, current, reefs[], harbor, cracks}`, `Oar{playerId, side, fatigue, committedStroke|null}`. Reefs/harbor pushed ONLY to the Navigator socket; rowers get only their own oar state. Each beat the server opens a commit window, collects locked strokes (or a null=drift for anyone who missed), computes the vector sum + current, updates boat pose, runs reef collision server-side, broadcasts the new wake to all but leaks reef proximity only to the Navigator. Hard part: the simultaneous secret-commit + fair timeout — a rower who never locks must deterministically 'drift', and the reveal must feel instantaneous across three phones, so commits are buffered server-side and released on a single tick.

## v1 scope
- 1 Navigator + 2 rowers, fixed roles
- One 8-beat crossing, one hand-authored reef layout
- Three stroke options, linear fatigue, three-crack sink
- Voice is the players' own mouths; no in-app comms

## Out of scope
- Multiple boats / competitive fleets
- Wind, tide tables, sail management
- Role rotation, campaigns, procedurally generated straits

## Risks & unknowns
- Balancing so voice coordination matters but isn't trivially solvable
- Whether hidden fatigue adds tension or just feels like bad luck
- 4-second window pacing across variable phone latency

## Done means
Three phones join; the Navigator sees reefs the rowers can't; a beat collects three secret strokes, sums them into a lurch on the TV, and a reef hit registers a crack. A clean 8-beat run reaches harbor and shows a win screen.
