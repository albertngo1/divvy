## Overview

A four-player cooperative puzzle round, five minutes long, for a room with a TV. One player (the Cartographer) holds the only board. The other three are pawns on it who never see it. The Cartographer's entire vocabulary is displacement vectors; each pawn's entire knowledge is a private movement rule they were shown once and then had taken away.

## Problem

"One player sees the map" games usually fail in one of two directions: the sighted player just narrates a solution, or the blind players are pure input devices. Neither side is playing. The fix here is double ignorance — the Cartographer knows the geography but not what moves are legal, the pawns know what's legal but not where anything is, and neither can describe their half in words the other can use.

## How it works

The Cartographer's phone privately shows an 8×8 grid: walls, four pits, one exit tile, and three pawns. Nobody else ever sees it, including the TV.

At round start, each Pawn's phone shows their movement rule for exactly 8 seconds, then hides it forever. Rules are simple and easy to *almost* remember: "exactly 3 tiles in a straight line", "diagonals only", "never the same direction twice in a row", "orthogonal, 1 or 2 tiles".

Play is a loop of proposals. The Cartographer picks a pawn and a vector on their phone — say P2, (+2,+1) — and sends it. The TV shows the proposal in plain text. That pawn's phone shows only the vector and two buttons: YES and NO. They answer from memory.

The server executes what they *answered*, not what was true. Say YES to an illegal move and the pawn attempts it: it lands in the void, takes 2 damage, and the TV logs "P2 misremembered" without saying what the rule actually is. Say NO to a legal move and you burn one of the team's 12 proposals for nothing.

The team has 12 proposals and must land all three pawns on the exit tile. The fun is the room reconstructing three rules out loud from the pattern of yeses and noes on the TV — and one pawn quietly realizing halfway through that they've been wrong about their own card since the second minute.

## Technical approach

Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, one object per room).

Data model: `Room { code, phase, board: {walls, pits, exit}, pawns: [{id, pos, hp, ruleId}], proposalsLeft, log: [{pawnId, vector, answer, wasLegal}] }`. `ruleId` is never sent to any client after the 8-second reveal; legality is evaluated server-side by a pure `isLegal(ruleId, pawn, vector)` function.

Sync: turn-based, so latency is easy — the hard part is *exclusivity and ordering*. A proposal must land on exactly one phone, lock every other input, and produce a public answer that the TV and the Cartographer see in the same order. The server is a strict state machine: `AWAITING_PROPOSAL → AWAITING_ANSWER(pawnId) → RESOLVING`. Answers arriving in the wrong phase are dropped, not queued. A pawn's phone must render the vector in *their* frame, not the board's, so "+2,+1" is shown as "two right, one up" with arrows — a pawn who thinks in grid coordinates has already been given too much.

## v1 scope

- Exactly 4 players; first to join is Cartographer
- One hand-authored board, one exit, four rule cards
- 12 proposals, one round, win-or-lose screen
- No timer — talking is the game
- TV shows: proposal log, pawn HP, proposals remaining

## Out of scope

Board generation, more pawns, rule cards that change mid-round, a hidden traitor pawn, scoring across rounds, reconnect, sound.

## Risks & unknowns

The rules may be too memorable for the memory failure to ever bite — the 8-second window and the rule wording need tuning, and "never the same direction twice" is probably the only one that reliably breaks people. 12 proposals may be far too few. There's also a real chance the Cartographer just solves it in three moves if the board is small; pits and rule interaction have to make greedy paths wrong.

## Done means

Four phones join, the Cartographer sends a vector, exactly one phone lights up with an arrow and two buttons, the answer appears on the TV within 300 ms, an answered-wrong move visibly damages the pawn and logs "misremembered", and a real group of four both wins and loses across ten sessions — with at least one recorded instance of a player confidently answering wrong about their own rule.
