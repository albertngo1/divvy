## Overview
Ground Truth is a 4-player cooperative game for one host screen and four phones. One player is the Cartographer: their phone holds the only map in the room, and it starts blank. The other three are Scouts, dropped into an unseen 6×6 grid with no coordinates, no compass, and one sense each. In eight minutes the table has to draw a map of a place none of them can see — the Cartographer never moves, the Scouts never see.

## Problem
Blind-maze party games make the guide omniscient: they see everything, the pieces obey. That's an instruction-following exercise, not a puzzle, and it collapses into one loud person barking turns. The itch here is the opposite and much better problem — SLAM (localize and map at the same time) as a shouting match. Nobody knows where anybody is, *including the person drawing*.

## How it works
The server holds a truth grid: 6×6 cells, ~8 wall segments, 3 landmarks (WELL, FIRE, STATUE). Scouts start on random cells they are not told.

Privately, each Scout's phone shows a D-pad, a bump indicator, and exactly one sense stream — a different one per Scout:
- **Feeler**: which of the 4 sides of my current cell are walls.
- **Nose**: how many steps to the nearest landmark (magnitude only, no direction, no which).
- **Ear**: how many steps to the nearest other Scout.

Nothing else. No coordinates, no trail, no map.

Privately, the Cartographer's phone shows a blank 6×6 canvas: tap edges to draw walls, drag landmark pins, drag three scout tokens. It never shows truth.

The shared host screen shows **neither map**. It shows the clock, the shared 12-report budget, and a public Report Log. Scouts talk freely, but talk is chaos; a Scout may spend one of the 12 shared reports to push their exact current reading to the TV verbatim. Scarcity of the precise channel is the game.

At time-up the TV dissolves the Cartographer's drawing into the truth grid and scores cell-by-cell agreement plus scout-position error.

## Technical approach
PartyKit / Durable Object room, one object per room code. Server owns `truth` (walls, landmarks), `scouts[id].cell`, `reportsLeft`, and `belief` (Cartographer strokes). Phones send `{move, dir}` and `{report}`; the server recomputes each Scout's sense payload and pushes it to that connection only — role-filtered fan-out *is* the entire security model, and the fun dies the instant any payload leaks grid shape. Cartographer strokes stream to the host as small deltas at ~15 Hz, coalesced server-side.

The genuinely hard part isn't throughput, it's authoring: tuning wall density and sense assignment so the three partial senses are *jointly* sufficient but *individually* useless. Rotationally symmetric layouts make localization impossible — the generator must reject them.

## v1 scope
- Exactly 4 players, 1 round, 8 minutes, one hand-authored 6×6 grid.
- 3 fixed senses, 12 shared reports, single accuracy percentage as the only score.
- Reveal can be a hard cut, not an animation.

## Out of scope
Multiple rounds, generated grids, >4 players, moving hazards, canvas undo, spectator view.

## Risks & unknowns
The Cartographer may drown while the other three idle — mitigate by letting Scouts keep moving while drawing lags. Free voice may make the report budget decorative. The Ear sense degenerates when Scouts cluster.

## Done means
Four phones join a code; each Scout sees only its own sense; the Cartographer draws from voice plus reports; at 8:00 the TV overlays belief on truth and prints one accuracy percentage — and playtesters argue about a wall.
