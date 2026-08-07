## Overview

A 90-second survival-horror inventory game for 3 people in a room. The genre theft is explicit: Resident Evil's attaché case / Tarkov's rig — polyomino loot packed into a grid under a timer — except the grid is one shared object on the TV and three people are dragging into it simultaneously from their own phones.

## Problem

Inventory Tetris is one of the most compulsively satisfying loops in games, and it is completely dead as a party activity because it's single-player and silent. Meanwhile every "shared board" party game degenerates into one loud person directing everyone. The itch: make packing social without making it a committee.

## How it works

The TV shows an 8×6 case, a 90-second extraction timer, and a per-player "pieces carried" count. Every block on the TV is flat gray — footprint only, no owner, no value.

Each phone privately shows: the same grid, but *your* pieces rendered in color with their point value printed on them, everyone else's still anonymous gray; a queue of your 6 remaining loot pieces (polyominoes, each with a private value 1–9); and a drag surface to place them.

The load-bearing lie is that size and value are uncorrelated. A 4-cell L-piece can be worth 1; a single cell can be worth 9. So nobody can read greed off the TV — the person hogging the corner might be dumping garbage. You cannot infer intent from public state, only from hesitation.

Placements are permanent, except each player holds one DUMP token that ejects any block including someone else's. The TV announces "a block was dumped" without saying who or which.

At 0:20 the TV reveals the zip condition: fewer than 3 empty cells at 0:00 or the case fails and everyone scores half. Greed and packing efficiency collide in the last twenty seconds.

Score = sum of your own placed pieces' private values.

## Technical approach

PartyKit Durable Object per room. Authoritative state: a 48-cell `Uint8Array` of owner IDs, a per-player piece queue, timer, dump tokens. Phones send `PLACE {pieceId, x, y, rot}`; the server validates collision, ownership, and timer, then broadcasts a cell delta.

Sync strategy: phones place optimistically and render immediately; a rejected placement bounces back with a visible snap. A separate 10Hz throttled `HOVER` channel broadcasts *where each player is currently dragging* as a translucent ghost — this is the entire tell surface, so it must feel live.

Hard part: contention at ~150ms phone latency. Two people dropping into the same cells 80ms apart must resolve deterministically without either feeling cheated. Server orders by receipt with a monotonic sequence number, and the loser gets their piece back to the front of their queue plus a 400ms cooldown — losing a race costs tempo, never inventory.

## v1 scope

- Exactly 3 players, one 90-second round
- 8×6 grid, 6 hand-authored pieces per player, fixed values
- One DUMP token each, no cooldown tuning
- Rotation via tap, no free rotation
- Final scoreboard, no persistence, no accounts

## Out of scope

Multiple rounds, loot rarity tiers, a monster/jump-scare layer, spectators, 4+ players, mobile-web install prompts.

## Risks & unknowns

Drag latency on a phone against a TV-rendered grid may feel disconnected — mitigate by making the phone the primary play surface and the TV the tension surface. Grid may be too small for 18 pieces (tune fill ratio to ~85%). Dump tokens could become purely griefy.

## Done means

Three phones on a LAN place pieces into one grid for 90 seconds with no desync; a contested placement resolves identically on all four screens within 250ms; the case-zip check fires correctly; and playtesters spend the last 20 seconds arguing about empty cells.
