## Overview

A 4-player cooperative deduction game for a living room with a TV. One player is the **Plotter** and holds the only copy of the map on their phone. Three players are **Pieces** who cannot see it — and, crucially, the Plotter cannot see *them*. The map has terrain but no tokens. Position has to be deduced, out loud, from what the pieces feel underfoot. Named for the navigator's *running fix*: you don't get your position from one observation, you get it from two taken at different times.

## Problem

Every "one person sees the maze, everyone else is blind" game collapses into a dispatcher reading coordinates aloud while four people obey. The guide has perfect information, so it's a typing exercise. The itch: make the person holding the map *also* be missing something, so the table has to reason jointly instead of taking dictation.

## How it works

The map is a 6x6 grid, each cell one of four terrains: MOSS, SAND, ROCK, WATER. Three of the cells are chests.

**Plotter's phone (private):** the full terrain grid, drawn plainly. No pawns, no highlights, no trails. A notes layer lets them long-press a cell to drop a colored pin per piece — this is a scratchpad, not truth. A move counter (24 shared moves).

**Each Piece's phone (private):** one word — the terrain of the cell they're standing on — and a four-arrow D-pad. The D-pad is **secretly rotated** 0°, 90°, 180° or 270° relative to the map, differently per piece, and *nobody* knows which, including the Plotter. Pressing an arrow either moves them (terrain word updates) or shows BLOCKED (edge of map). Finding a chest privately shows FOUND.

**Host TV (public):** the terrain legend, moves remaining, chests found (0/3), and a running log of every reported reading — `PIECE 2: sand → rock`. No grid, ever. The TV is deliberately map-less so nobody can peek over a shoulder.

Everyone talks freely. The loop is: Plotter picks one piece, that piece presses an arrow and says what happened, and the table narrows the joint hypothesis — where you are *and* which way your arrows point. `sand → sand → rock` is a fingerprint that fits only a few paths. Get all three chests inside 24 moves.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object as authoritative state. Room state: `{ grid: Terrain[36], chests: idx[3], pieces: { id, pos, rot, found }[], movesLeft, log[] }`. Phones hold no game logic — a move press is `{move:'N'}`, the server applies `rot` and returns only that piece's new terrain word. Sync is trivially small (a few messages per second); the hard part isn't latency, it's **information hygiene**: the server must never broadcast full state, so each socket gets a hand-built projection, and the TV socket gets a third projection. One leaked field kills the game. Enforce with a per-role serializer plus a test asserting no piece payload ever contains `pos`, `rot`, or `grid`.

## v1 scope

- Exactly 4 players, fixed roles, one round, one hand-authored 6x6 map
- 4 terrains, 3 chests, 24 moves, no timer
- Plotter pin scratchpad; win/lose screen only

## Out of scope

Multiple maps, generated maps, hazards, more than 3 pieces, scoring, rematch, reconnect flows.

## Risks & unknowns

The hidden rotation might be too cruel — pieces may spend a third of the budget just learning their own arrows. Mitigation lever: reveal each rotation for free after that piece's 4th move. Second risk: 24 moves may be either trivial or hopeless; expect to tune the map, not the rules.

## Done means

Four phones join by QR, each piece sees only a terrain word, the Plotter sees only terrain, the TV shows only the log — and a real group of four finds all three chests within 24 moves at least once in five sittings, with an inspector on the piece sockets confirming no position data was ever transmitted.
