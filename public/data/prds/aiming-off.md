## Overview
A quiet, talky co-op for 4 players, 6–8 minutes. One player's phone holds a terrain map of a small island. Three others are hikers somewhere on it. The map-holder has the *terrain* but not the *positions*; the hikers have their exact sensation but no idea where they are. Everyone has to talk their way to a rendezvous. It's the lost-with-a-topo-map problem, made social.

## Problem
Most hidden-map games make the blind players into remote-control arms — the informed player already knows where everyone is and just issues turns. That's dictation, not conversation. The interesting version is when the informed player is *also* lost: they know the world but not their friends' place in it, and the only way to locate anyone is to interrogate what they can feel.

## How it works
The island is an 8×8 grid of five terrain types (sand, scree, marsh, pine, rock). Each hiker starts on a secret cell.

**Hiker's phone (private):** one large swatch — the terrain of the cell they're standing on, rendered as a color+texture and a short looping tone. Four move buttons (N/S/E/W). Nothing else. No coordinates, no compass rose beyond the button labels, no view of anyone else. Stepping into the sea bounces you back and your phone flashes **WATER** — a free, precious edge-detection clue.

**Cartographer's phone (private):** the full terrain map plus a single marked rendezvous cell. No hiker dots, ever.

Hikers describe aloud ("mine's crunchy grey, and north of me was more of the same, then water"). The Cartographer narrows candidates by matching reported *sequences* to the map — one terrain type is ambiguous, a three-step walk usually isn't — then directs. Real orienteering technique emerges unprompted: send someone deliberately off-target toward the coastline so the water-bounce pins them exactly. That's the title.

**Host TV (public):** a running transcript of every step each hiker took ("Hiker B: N, N, W — bounced") and a fog-of-war map that fills in a cell only when the Cartographer marks it as confirmed. It's a shared scratchpad, not the board. On success it reveals all three true paths.

Win: all three hikers standing on the rendezvous cell inside 30 total moves.

## Technical approach
Socket.IO over Tailscale Serve; host tab + phone PWAs. State: `{grid: TerrainType[64], goal: index, hikers: {id, cell, moves}, confirmed: Set<index>, log: []}`. The server is authoritative for positions and only ever emits `terrainAt(cell)` to the owning hiker and `move-log` to the host — hiker cells never leave the server for any other client.

Sync is trivially easy here (turn-ish, low frequency); the genuinely hard part is **puzzle generation**: a grid where localization is possible but not instant. Too much variety and one swatch pins you immediately; too little and no sequence disambiguates. v1 hand-authors one grid validated by a brute-force solver that computes, for every start cell, the shortest move sequence with a unique terrain signature — target a median of 3 and a max of 5.

## v1 scope
- 1 Cartographer + 3 hikers, one hand-authored 8×8 grid, one rendezvous, 30-move budget.
- Five terrain swatches, color + texture + tone. No haptics (iOS Safari has no vibrate).
- TV: move log, confirmed-cell fog map, end reveal.

## Out of scope
Procedural islands, hazards, timers, roles rotating, scoring, replays.

## Risks & unknowns
The biggest risk is a stall — four people silently squinting. Mitigate with a 45-second nudge on the TV suggesting "someone walk until you hit water." Colorblind-safe swatches are mandatory since terrain identity is the entire vocabulary. Also unknown: whether the Cartographer becomes a bottleneck that bores the hikers; watch for hikers going quiet.

## Done means
Four phones on the tailnet; three hikers reach the same cell from cold-start ignorance in under 30 moves; and at least one team is observed deliberately walking someone into the sea to find out where they are.
