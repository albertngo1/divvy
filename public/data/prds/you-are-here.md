## Overview

A four-player, five-minute co-op for a living room with a TV and four phones. One player is the **Cartographer**: their phone is the only screen in the room that shows the map. The other three are **Pieces**: they hold a phone with four arrow buttons and no board, no coordinates, no idea where they are. The catch that makes it a game rather than a chore: the Cartographer sees three identical unlabelled dots. They know the terrain perfectly and know nothing about who is who.

## Problem

"Blind maze, one person reads the map" is an old party bit, and it's flat because the sighted player just issues correct orders and everyone obeys. All the thinking happens in one head. The itch is an asymmetry where *both sides* are missing something — the map-holder is missing identity, the pieces are missing space — and the fun is the two halves grinding against each other in speech.

## How it works

A 6×6 grid, three pits, one exit. Three Pieces start on random cells.

Each round is a 12-second commit window. **Privately on a Piece's phone:** a D-pad, a countdown, and their own history strip — a scrolling record of the moves they committed and what happened (`MOVED`, `BLOCKED BY WALL`, `NUDGED SOMEONE`). Never a position. **Privately on the Cartographer's phone:** the full board — terrain, pits, exit, and three grey dots that carry no names.

The Cartographer talks out loud. They cannot say "Priya, go left" because they don't know which dot Priya is. They can only say things like *"whoever is jammed against the top wall, go down"* or *"one of you is two squares from a pit — if you moved right last turn and got blocked, do not move right again."* Pieces commit simultaneously and secretly; at window close the server resolves all three moves at once, so an instruction meant for one dot that two people obey produces immediate, legible chaos.

Self-identification is the real puzzle. A Piece learns who they are by hearing a prediction from the Cartographer and checking it against their own private history. Once someone is confident, they say so — and the Cartographer must decide whether to believe them.

**Host TV** shows only: round number, moves remaining (12), how many Pieces have reached the exit, and a fat fog-of-war rectangle. It is a scoreboard, not a board. At game end it replays the true board with names attached, which is the whole laugh.

## Technical approach

PartyKit Durable Object per room; phone PWAs and the host tab hold WebSockets. Server state: `{ grid: Cell[36], pieces: {id, x, y, escaped}[], role: {connId → 'cart'|'piece'|'host'}, round, commits: {pieceId → dir} }`.

Sync is **per-connection view projection**, and that is the hard part: there is exactly one authoritative board and three materially different renderings of it, so the broadcast helper must be replaced by a `viewFor(connId, state)` function that runs before every send. A single sloppy `room.broadcast(state)` leaks the map to everyone and ends the game. Commits are write-once per round, stored server-side, never echoed to other connections, and resolved in a single tick on window close. Move resolution order is deterministic (piece id order) so replays reconstruct exactly.

## v1 scope

- Exactly 4 players: 1 Cartographer, 3 Pieces. No lobby roles — join order decides.
- One 6×6 board, hand-authored, three pits, one exit.
- One game, 12 rounds, 12-second windows. Win = all three escape.
- Piece phone: D-pad, countdown, history strip. Cartographer phone: board + three grey dots.
- Host TV: rounds left, escape counter, end-of-game replay.

## Out of scope

Random board generation, multiple rounds/scoring, reconnection, more than 4 players, any text channel between phones, animation polish, Cartographer swapping.

## Risks & unknowns

The Cartographer's job may be too hard to *speak* — if referring to an unnamed dot is awkward, the room stalls. Mitigation: give the Cartographer three canned phrase chips ("top-most", "left-most", "the one who just got blocked") as a private prompt strip. Second risk: if all three dots start far apart, identification is trivial; if adjacent, it's impossible. Starting positions need hand-tuning, not randomness.

## Done means

Four phones join, one gets a map nobody else can see even with devtools open, three get D-pads. A full 12-round game runs to a win or loss without a desync, the TV never renders a position, and in playtest at least one Piece audibly says "wait — I think I'm the one on the left" before round 6.
