## Overview

A 4-player cooperative room game for a TV plus four phones. One player is the **Holder**: their phone is the only screen in the world that renders the maze. The other three are **Pieces**: blind pawns with four direction buttons and one private scrap of knowledge — the four wall segments they personally drew before the maze existed. The joke and the engine of the game are the same thing: the maze is crowd-sourced from people who will then have to walk through it blindfolded.

## Problem

"One player holds the map" games collapse into a single person reading directions aloud while everyone else becomes a joystick. The blind players have nothing to *think* about. This game gives every blind player a private, verifiable, incomplete piece of the map — so a Piece can occasionally out-navigate the Holder, and the Holder's narration becomes a negotiation rather than a broadcast.

## How it works

**Phase 1 — Build (30s).** Every Piece's phone shows the same blank 6x6 grid. Each privately drags exactly **4 wall segments** onto edges. Nobody sees anyone else's. The TV shows only a wall counter ticking up: 4 / 8 / 12.

**Phase 2 — Walk (one round, ~4 min).** The server unions the 12 walls into one maze, drops three pawns at three corners, and puts one exit tile somewhere inside.

- **Holder's phone (private):** the full maze, all three pawns live, the exit. This is the only complete view in existence.
- **Each Piece's phone (private):** four direction buttons, a bump/step haptic, and a small floating diagram of **their own four walls** — unanchored, no coordinates, just the shape they drew.
- **Host TV (public):** a fog-of-war trail of tiles that have been stepped on, unattributed to any pawn, plus the tick clock. Never the walls.

The constraint that makes it a game: the Holder may address **only one Piece per 4-second tick**, by name, one sentence. All three Pieces must press a direction every tick. So two-thirds of the room is always wandering unsupervised, and the Holder's attention is the scarce resource.

The payoff moment: a Piece bumps N, then E, then N again and realizes that L-shape is *the one they drew* — they now know exactly where they stand, on a board they have never seen, and can self-navigate while the Holder spends attention elsewhere.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs over WebSocket. Server-authoritative state: `{ grid: Set<edgeId>, wallAuthor: Map<edgeId, playerId>, pawns: {playerId: {x,y}}, tick, exit }`. Phones never receive the wall set — only `bump` / `moved` events for their own pawn plus their own authored edges. The Holder receives a full diff each tick.

Sync strategy: fixed 4s server ticks. Presses are queued per player; last press before tick close wins; the server resolves all three moves simultaneously and fans out three *different* payloads. The genuinely hard part is **payload discipline** — one lazy broadcast of full state leaks the maze to every phone and kills the game. Enforce with per-role serializers and a test that asserts a Piece socket never receives an edge it didn't author.

## v1 scope

- Exactly 4 players: 1 Holder, 3 Pieces. No lobby roles beyond first-joiner-is-Holder.
- One 6x6 maze, one round, one exit, no scoring beyond a completion clock.
- Wall drawing: tap an edge, 4 max, no undo beyond re-tap.
- Holder's one-sentence-per-tick rule enforced socially, not by software.
- Host TV: trail fog + tick clock only.

## Out of scope

Multiple rounds, saboteurs, hazards, wall budgets that differ per player, voice capture to police the Holder, reconnect handling beyond a page-refresh state resync, any art beyond squares.

## Risks & unknowns

Twelve random walls may produce a trivially open or fully sealed board — needs a connectivity check and reroll. Four seconds may be too fast to speak a sentence and too slow to feel live. The self-localization "aha" may fire for one player and never for the other two, which is fine once but flat across a night.

## Done means

Four phones join from a QR code on the TV; each draws 4 walls it can see and nobody else can; all three pawns reach the exit; and in the post-round replay the TV highlights at least one moment where a Piece turned *away* from the Holder's instruction because their own wall told them better.
