## Overview

A 4-player, one-round cooperative maze game. One player is the Surveyor, holding the only map. Three are Pieces, who see nothing but four blank arrows. The joke is that neither side has a complete language: the Surveyor sees *where* every symbol is but not what a single one means, and each Piece knows the meaning of exactly one symbol but has no idea where anything is.

## Problem

Blind-maze games decay into one person reading coordinates aloud. Two fixes, both aimed at the same itch — make the map-holder dependent on the pieces rather than the other way around. First, her camera is not hers. Second, her map is in a language only they can read.

## How it works

A 7×7 grid holds four glyph types — ◇ ▲ ◯ ✕ — scattered across it, plus three Piece tokens.

**Surveyor phone (private):** a 3×3 window of the grid, centered on the position of whichever Piece moved most recently, showing glyphs and any tokens inside it. Nothing outside the window exists for her. She sees glyph *shapes* only; no legend, ever.

**Piece phone (private):** four unlabeled arrow buttons, and one line of text — their personal legend entry, e.g. "✕ — a pit. Stepping on it removes you from the game." Each of the three Pieces gets a different glyph's meaning. One glyph's meaning is given to nobody. No board, no position, no trail.

**Host TV (shared):** a 7×7 fog grid showing only cells some Piece has occupied, unattributed; a shared step counter (24 steps for the whole room); and a spotlight indicator naming which Piece the Surveyor's camera is currently locked to.

Everyone talks. The core loop: the Surveyor can only describe what she can see, and she can only see near the last mover, so a Piece who wants help must spend one of the room's shared 24 steps *just to yank the camera to themselves* — often stepping into danger to do it. Meanwhile she says "there's a ◇ directly north of you" and waits to find out from the room whether ◇ is the exit or the thing that kills you. Win: all surviving Pieces stand on ▲ (the exit) within 24 steps.

## Technical approach

Host tab + phone PWAs against a PartyKit/Durable Object room; server authoritative, turn-free but serialized — moves are applied in arrival order, one at a time, each one immediately re-anchoring the Surveyor's camera. Data model: `{grid:[[glyph]], pieces:[{id,pos,alive}], lastMoverId, stepsLeft, legend:{glyph:meaning}}`. Per-role projections: Surveyor receives `window3x3(grid, pieces[lastMoverId].pos)`; each Piece receives `{alive, myLegendLine}`; TV receives `{fogSet, stepsLeft, lastMoverId}`. The `legend` map never leaves the server except as one line per Piece.

Hard part: camera thrash. Two Pieces moving within 200ms of each other makes the Surveyor's screen flicker uselessly. Fix with a 900ms camera hold — the window stays anchored for at least 900ms after a move, and queued moves apply after it releases, which also makes "who moves next" a thing the room must actually negotiate.

## v1 scope

- Exactly 4 players, one round, room code join
- One hand-authored 7×7 grid, 4 glyph types, fixed legend
- 24 shared steps, no timer
- Death on ✕ is permanent and silent to everyone except the TV fog
- End screen reveals the full grid and the unassigned glyph's meaning

## Out of scope

Scoring, multiple mazes, lying Surveyor, more Pieces, glyph meanings that change, audio.

## Risks & unknowns

The camera-yank cost may feel punishing rather than tactical if 24 steps is too tight — playtest at 24, 30, and 36. Three legend lines may be too little private state to sustain four minutes; a fallback is giving each Piece a second, false entry.

## Done means

Four phones join; the Surveyor's window demonstrably re-anchors to the last mover and holds 900ms; no client ever receives a legend entry that isn't theirs; a Piece can die on ✕ and the room can still win; the full grid and legend are revealed on the TV at the end.
