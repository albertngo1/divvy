## Overview
A cooperative blind-construction convergence game for 3–6 players. The shared host screen shows how much the room's shapes agree; each phone is a private canvas where a player builds a figure from tiles with no target to copy. The room wins when everyone, working alone and in silence, has produced the same overall silhouette.

## Problem
Existing convergence games make you match a *selection* (a lasso, a face part, a word span). None make you converge on a thing you *construct from nothing*. The itch is delicious and untapped: given the same pieces and no reference, do we independently reach for the same shape? It's Schelling-point invention, not recognition.

## How it works
Every phone privately holds an identical set of five polyomino tiles and a blank ~6×6 grid. Players drag and rotate tiles (90° snaps) to build any connected shape — no target, no reference, no talking. The real question each is answering: *what shape will the others build?*

Privately, a phone shows your grid, your tile tray, rotate handles, and a LOCK button. The host TV shows ONLY the silhouette agreement: a 6×6 heat grid where each cell tints by how many players currently fill it (0–3) — never whose tiles, never which piece. A cell everyone fills glows solid; contested cells flicker. The room wins when all players' *filled-cell silhouettes* are identical — piece identity and placement are ignored, only the occupied-cell bitmap must match. So two players can tile the same outline with pieces arranged completely differently and still count as matched; the target is the emergent shape, not the tiling. Reveal overlays all three builds plus the consensus silhouette.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: a shared fixed tileset (five polyominoes); per-player `placements[{tileId,x,y,rot}]` from which the server derives a 36-bit occupancy bitmap. The server broadcasts per-cell counts to the host and a private echo to each phone. Sync is low-frequency; the hard parts are (a) canonicalizing occupancy so comparison is robust — illegal overlaps rejected on both client and server — and (b) tuning the heat feedback: too informative and it's trivial copying, too coarse and it stalls. Win = all occupancy bitmaps equal across locked states.

## v1 scope
- Exactly 3 players
- Five fixed tiles, 6×6 grid
- 90° rotations only, no reflections
- One round
- Host heat grid + win detection + overlay reveal

## Out of scope
- Reflections, variable tilesets, larger grids
- Scoring, timers, hints, partial credit
- Animations beyond snap-to-grid

## Risks & unknowns
- Silhouette space is huge → may never converge; mitigate with a small grid and pieces that "want" to form a few natural shapes (square, plus, arrow).
- The heat grid may leak enough to turn intuition into pixel-copying.
- Rotation/drag UI is fiddly on small phone screens.

## Done means
Three phones each build on private grids; the host heat grid updates live; when all three occupancy bitmaps match on lock, a WIN fires and overlays the builds; no phone ever sees another player's grid before the reveal.
