## Overview

A 4-player, one-round co-op for a living room with a TV and four phones. One player (the Draughtsman) holds the only map of a chalk maze. The other three are blind pieces who must reach the exit. The twist: the map is chalk, and feet smudge chalk. Every tile a piece steps on is erased from the Draughtsman's phone permanently. Knowledge doesn't get shared in this game — it migrates, from one screen that had all of it to three phones that each hold a broken sliver.

## Problem

Every map-holder game is the same curve: the sighted player talks, the blind players obey, and the fun decays as the holder gets better at describing. Nothing ever forces the *roles to invert*. Groups also default to one loud navigator; there is no mechanical pressure to make the quiet players the authority.

## How it works

A 6×6 chalk maze with interior walls, three piece-dots, one exit tile.

**Draughtsman's phone (private):** the full maze, live dot positions, and a growing hole. When a piece enters tile T, T and its four wall segments are wiped from this render — permanently, even if the piece leaves. Roughly 20 moves in, the middle of the map is white paper.

**Each piece's phone (private, and different from each other):** no map. A D-pad in their own heading frame, and an auto-written notebook that logs only what that piece personally hit: "turn 4 — wall ahead", "turn 6 — wall on your right", "turn 9 — open both sides." Entries are heading-relative and never contain coordinates, so a piece who has turned twice can't reconstruct anything alone. Pieces can read entries aloud; that's the only export.

**Host TV (public):** turn counter, moves remaining, and a smudge meter — how much of the map is gone. Never the maze.

The exit sits in a corner nobody has visited, so it is still on the Draughtsman's map at the start. The Draughtsman's optimal play is to front-load: dump the route before their own screen eats itself. The endgame reliably arrives where the Draughtsman is staring at blank paper and the last piece has to be talked out by another piece cross-referencing two notebooks aloud.

## Technical approach

PartyKit Durable Object per room, authoritative. State: `{maze: walls[6][6], pieces: {id, pos, heading}, visited: Set<tile>, notebooks: {id: entry[]}, turn}`. Clients never receive the maze; the server computes and pushes a *filtered view* per socket — Draughtsman gets `maze minus visited`, each piece gets only its own notebook plus a legal-move mask. Moves are simultaneous with a 4-second tick; server resolves, appends notebook entries, expands the smudge set, fans out.

Hard part: filtered projections must be genuinely server-side (a client-side mask leaks the maze to anyone with devtools), and the smudge must feel *instant* on the Draughtsman's screen — so the piece move is optimistically animated but the erase is authoritative, meaning a rejected move must un-erase cleanly.

## v1 scope

- Exactly 4 players, 1 fixed hand-authored 6×6 maze, one round, ~4 minutes
- 4-second simultaneous ticks, 24 ticks hard cap
- Notebook = plain text list, append-only, no editing
- Win/lose screen with a replay of the maze filling back in
- Room code on TV, phones join by URL

## Out of scope

Maze generation, scoring, 5+ players, hazards, partial smudge/fade, spectators, reconnect polish.

## Risks & unknowns

- The smudge may erase the exit path before anyone reaches it — needs a tuned maze where the front-load strategy is discoverable in one round.
- Heading-relative notebooks may be too hard to translate aloud under time pressure; fallback is logging cardinal directions.
- The endgame flip could just feel like losing rather than a handoff.

## Done means

Four phones join by room code; the Draughtsman sees tiles vanish within 200ms of a piece's move; each piece's notebook contains only its own bumps; and in a live playtest at least one group reaches a state where the Draughtsman's map is empty and a piece successfully directs another piece to the exit using only read-aloud notebook lines.
