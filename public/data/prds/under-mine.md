## Overview

**Under Mine** is a 5-player cooperative spatial puzzle for a group with a TV and one loud table. One player is the Operator: their phone holds the whole world map. The other four are Anchors — and Anchors never move. Their tokens are nailed to four fixed screen positions. The Operator drags and rotates the *entire map* beneath them, and each Anchor's phone shows exactly one thing: a single colored square, the tile currently underneath their own token. The Anchors each secretly need to be standing on one specific terrain type. All four must be satisfied at the same instant.

## Problem

Every map-holder game makes the pieces into remote-controlled cars: the holder knows the answer, the pieces execute. The itch is to invert who holds the goal. Here the Operator can see everything and knows nothing — they have no idea what anyone needs. The Anchors know exactly what they need and can see one square inch of the world. The map-holder becomes a servant with a steering wheel, satisfying four demands with one two-degree-of-freedom transform. Four simultaneous constraints, one hand.

## How it works

A 30×30 terrain grid of five tile types (water, sand, forest, stone, ash). Four Anchor tokens sit at fixed points arranged in a square on the map viewport.

**Operator's phone (private):** the full map with the four token positions overlaid, one-finger drag to translate, two-finger twist to rotate. Continuous, not grid-snapped. A big LOCK button, usable three times.

**Anchor's phone (private):** one large square filling the screen, showing the color of the tile beneath their token right now, updating live as the Operator drags. Below it, small and permanent: their secret goal tile ("you need ASH"). Nothing about the map, nothing about the other three, no coordinates.

**Shared TV:** four big squares, one per Anchor, mirroring their live tile colors — so the room can see all four feeds at once while the Operator (looking at their own phone) largely cannot. Plus a lock counter and a HELD/NOT HELD flash. The TV deliberately does *not* show the goals or the map.

So the room becomes an air-traffic-control shout: "I'm on water — water — sand — HOLD, I've got it, don't move!" while the third Anchor is still hunting and every degree of rotation destroys someone's solution. The Operator hits LOCK when they believe all four are satisfied; the server checks the truth.

## Technical approach

Host tab + phone PWAs + one PartyKit Durable Object. Authoritative state: `{terrain: uint8[900], transform: {tx, ty, theta}, anchors: [{sx, sy, goal}], locksLeft}`. The Operator streams pointer deltas at ~30Hz; the server integrates them into the canonical transform, then for each Anchor computes the inverse transform of their fixed screen point into grid space and emits *only* `{t:'tile', v: 3}` — one byte per Anchor per change.

The hard part is that naive streaming sends 30 messages/sec × 4 clients of mostly-unchanged values. Fix: the server emits an Anchor message only when that Anchor's sampled tile *changes*, which collapses traffic to a handful of events per second and makes the feel crisp — the color snapping is the signal. Second hard part is jitter at tile boundaries: a token hovering on an edge strobes between two colors and the Anchor screams. Apply a small hysteresis band (~0.15 tile) before committing a change. Third: LOCK must evaluate against server-side transform at the server's timestamp, not the Operator's optimistic local one, or lag-hunting becomes the meta.

## v1 scope

- Exactly 5 players: 1 Operator, 4 Anchors. Hardcoded.
- One handmade 30×30 map with one guaranteed solution, verified by brute force offline.
- Translation and rotation only. No zoom.
- One round. Three LOCKs, then win/lose.
- Five flat colors, no art, no sound.

## Out of scope

Map generation, solvability solver at runtime, multiple rounds, zoom, a traitor Anchor with a false goal, scoring, reconnects, player counts other than five.

## Risks & unknowns

The biggest unknown is whether a solution is *findable* by shouting, or whether the constraint set is so tight that the team brute-forces by luck — one solution in a 30×30×360° space may be a needle. Mitigation: author the map so the solution basin is fat (large contiguous goal regions) and playtest the basin size before anything else. Two-finger rotate on a phone competing with browser pinch-zoom needs `touch-action: none` and will fight Safari. Anchors may find their single square boring during dead stretches; a subtle "tile changed" haptic tick may be needed to hold attention.

## Done means

Five phones join from a QR code. The Operator drags; all four Anchor phones and the TV's four mirror squares change color within 100ms of crossing a tile boundary, with no strobing on edges. Pressing LOCK with all four Anchors on their goal tiles wins; with any one off, it burns a lock and says so. One group of five, given no rules beyond the screens, solves it in under six minutes.
