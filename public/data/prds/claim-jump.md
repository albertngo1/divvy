## Overview
Claim Jump is a fast concurrent-room party game for 3-6 players. The host screen is a small gold-valued plot grid; every phone privately, simultaneously stakes a claim. The tension is pure anti-coordination: you want the richest plots, but so does everyone, and overlapping claims are voided and penalized.

## Problem
The itch is greed under uncertainty about *other people's* greed. Shared-map games usually let you take turns and react. Here nobody reacts — you all reach for the map blind and at once, and the obvious best plot is a trap precisely because it's obvious to everyone.

## How it works
The host TV shows a grid (v1: 4x4) with a few plots labeled with gold values; high-value plots are visible to all. A timer starts. Each phone PRIVATELY shows the same grid and lets that player drag to stake a fixed-size claim — exactly 2 adjacent cells — hidden from everyone until reveal. Your phone shows only YOUR stake; the host shows nothing but the timer and the untouched map.

When the timer ends (or all locked), the host reveals every claim at once. Any plot claimed by 2+ players is 'jumped': it burns to zero AND each colliding player pays a penalty. Plots you claimed alone bank their full gold. The winner is whoever guessed best where the others WON'T go — a Schelling problem in reverse.

Private simultaneous staking is load-bearing: a single passed-around phone destroys both the secrecy and the all-at-once reveal that make the bluff work.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Board { cells: [{id, gold}] }`, `Claim { playerId, cellIds:[a,b], locked }`. Sync: phones send `stake(cellIds)` updates (debounced) and a final `lock`; the server holds claims secret until the round timer fires, then resolves collisions server-side and broadcasts the scored reveal. The hard part isn't real-time — it's the anti-cheat/secrecy guarantee: claims must never leak to other clients before reveal, so no per-move broadcast, only a single authoritative reveal payload. Also validate adjacency and stake size server-side.

## v1 scope
- 3 players, 4x4 grid, ~4 gold-valued plots.
- Each stakes exactly 2 adjacent cells, one reveal, one round.
- Collision = burn + flat penalty; solo = bank gold; show final scores.

## Out of scope
- Multiple rounds, variable claim sizes, negotiation/table talk phases.
- Bigger grids, terrain, per-round map rotation.
- Lobbies, reconnection, animations beyond a reveal flash.

## Risks & unknowns
- With only 3 players collisions may be rare; grid size vs player count needs tuning so the high plots are genuinely contested.
- One-shot reveal may feel thin — might need 2-3 quick rounds to build the read.
- Whether fixed 2-cell stakes are too constraining or just right.

## Done means
3 phones each privately stake 2 adjacent cells on a shared 4x4 map, and on reveal a cell staked by two players visibly burns to zero and fines both, while a solo-claimed gold plot is banked to that player's score.
