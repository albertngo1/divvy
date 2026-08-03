## Overview

A silent 3-player coordination game about common knowledge. A bare fictional map sits on the host TV. Each phone shows the same map plus a few landmarks *only that player can see*. All three players must independently drop a pin on the same spot. No talking. The joke is that your private information is the thing that will make you lose.

## Problem

Schelling-point games ("pick a place in New York to meet") die instantly because everyone picks the obvious landmark and the round is over. Adding private info usually makes the game *easier* (more to reason with). Rally Point inverts it: private info is a liability. The skill is recognising that the huge obvious TOWN HALL on your screen is invisible to everyone else, and picking the boring river bend instead.

## How it works

Host TV shows a shared terrain: a coastline, a river, a hill, a road fork. No labels, no landmarks. That is the entire common knowledge.

Each phone shows the identical terrain plus 3 private landmarks drawn from a 9-landmark set — a chapel, a water tower, a burnt tree — placed at real coordinates. Overlaps are deliberate: two players may share a landmark, all three never do.

Three simultaneous placement rounds:

- **Phone (private):** pan/zoom-free map, drag a pin, LOCK. Your own private landmarks always visible. You never see another pin.
- **Host TV (shared):** during placement, only a lock counter. After each round resolves, a single quantised verdict word — **SCATTERED / CLOSE / TIGHT** — derived from the bounding-circle radius of the three pins. No positions, no directions, no per-player feedback.

Rounds 2 and 3 re-place from scratch. Win if the final bounding circle is under ~8% of map width. On win, the TV drops all three pins and every private landmark at once, so the room finally sees what each other was staring at.

## Technical approach

Host tab + phone PWAs over a PartyKit / Durable Object room. State: `{ terrainSeed, landmarks: {playerId: [{id,x,y}]}, round, pins: {playerId: {x,y}}, locked: Set }`. Pins are normalised 0–1 map coordinates so phone screen size and aspect never matter; each client letterboxes the same terrain SVG to identical proportions.

Pins are sent on lock only and held server-side — the host never receives a coordinate until the round resolves, so screen-mirroring the TV leaks nothing. Server computes the minimum enclosing circle of three points, quantises to one of three bands, and broadcasts only the band.

The hard part is not throughput; it is **calibrating the band thresholds and landmark overlap** so three rounds of one-word feedback are actually enough to converge without turning into blind gradient descent. Too generous and the game solves itself; too coarse and the feedback is noise.

## v1 scope

- 3 players, one room, one hand-authored terrain SVG
- One fixed landmark layout with hardcoded per-player assignment
- 3 placement rounds, no timer
- Host TV: lock counter, one band word per round, final overlay reveal
- Win/lose screen, refresh to replay

## Out of scope

Map generation, pan/zoom, 4+ players, scoring across rounds, timers, drawn routes, multiple maps, mobile-landscape support.

## Risks & unknowns

The terrain may contain one screamingly obvious feature that makes round 1 an instant win — the map needs deliberately several mediocre candidate spots. Coordinate normalisation bugs across screen sizes would silently poison the radius math. Also unproven: whether "discount your own knowledge" is fun to *do* or just frustrating.

## Done means

Three phones show the same terrain with distinct private landmarks, three simultaneous locked pins resolve to one correct band word on the TV, and the final reveal overlays all pins plus all nine landmarks with a correct win/lose verdict. A pin dropped at the same visual spot on a phone and an iPad produces normalised coordinates within 1%.
