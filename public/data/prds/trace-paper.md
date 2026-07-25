## Overview
Trace Paper is a 3-player cooperative room game about converging on a place none of you can fully see. One hand-drawn town map is separated into three registered layers — roads, water & parks, buildings & labels — and each phone receives exactly one layer. Everyone silently drags a pin. You win only if all three pins land within a tight radius of each other. For groups who like Cross Clues-shaped agreement puzzles but want something wordless.

## Problem
Most "secretly match" games fail the same way: everyone sees the same board, so the obvious Schelling point (top-left corner, the biggest thing, the middle) wins instantly and the round is over in eight seconds. The itch: make convergence hard because players *perceive differently*, not because information about the goal is withheld. You should be reasoning about what your friends can see, not about the map.

## How it works
PHONE (private): your layer, full-bleed, fixed zoom, plus a draggable pin. Your pin must land on **ink in your own layer** — off-ink drags snap back with a haptic buzz. That single rule is the engine: the only mutually legal spot is a feature drawn in *all three* layers. A bridge exists in roads and water but not buildings. The plaza label exists only in buildings. The pond exists only in water. You have to guess the intersection of three perceptions.

HOST TV (shared): a blank sheet of paper, one grey circle — the smallest circle enclosing the three live pins — labelled `SPREAD: 340 m`, and a heartbeat tick that quickens as it shrinks. Never a pin position. Never any map content. Ninety seconds; win when spread stays under 4% of map width for 3 continuous seconds.

PAYOFF: the TV composites all three layers in perfect registration for the first time, animates the three pins landing, and names the spot if you nailed a labelled landmark.

## Technical approach
Host tab renders three SVG layers; each phone PWA fetches its layer SVG plus an alpha-mask PNG for ink validity. Authoritative WS server (PartyKit Durable Object, one object per room code): `{room, phase, players: {id → {layerId, pin:{x,y}}}, startedAt}`. Pins are normalized 0..1 map space; every client letterboxes the map identically so device size and DPR can't shift coordinates. Phones send pin updates at 15 Hz, validity-checked client-side for instant feel and re-checked server-side against the mask. Server computes the enclosing circle of three points (trivial closed form) and broadcasts *only* the radius plus a monotonic hold timer.

The genuinely hard part isn't bandwidth — it's (a) cross-device coordinate registration, where a few pixels of letterbox drift silently makes the win condition unreachable, and (b) authoring layers whose common intersection contains roughly three plausible candidates, so the room actually has to coordinate instead of guessing right immediately.

## v1 scope
- Exactly 3 players, QR join, one room
- One hand-authored map, three fixed layers, fixed zoom, no pan
- One 90-second round, one win threshold
- Ink-validity via a single alpha mask per layer
- Composite reveal screen with the three pins

## Out of scope
Multiple maps or procedural generation; zoom/pan; 4+ players with dynamic layer splitting; scoring or leaderboards; real OSM data; rematch flow; any chat.

## Risks & unknowns
A single dominant shared feature collapses the game to instant-win — the map must be audited for candidate count. Dense linework may be unreadable on a phone. If it proves trivially easy, the tuning lever is more candidates, not a smaller radius.

## Done means
Three phones join by QR and each shows a different layer; off-ink pin drags are rejected; the TV radius updates under 150 ms end-to-end; a room of three strangers wins within 90 seconds at least some of the time; the composite reveal renders all three layers in exact registration with the three pins overlaid.
