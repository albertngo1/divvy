## Overview
Chevron is a 3-player cooperative keepsake maker. A shared host screen shows a friendship bracelet growing row by row on a virtual loom; each player's phone privately owns one colored strand they steer blind. For friend groups, couples, or families who want to *make a thing together* in five minutes and walk away with a saveable artifact — not a leaderboard.

## Problem
Most phone party games end in a winner and an empty feeling. There's an itch for a tiny, tactile, collaborative craft — the digital equivalent of braiding a bracelet on a summer porch — where the whole point is the object you made together and the surprise of watching a pattern emerge from choices nobody fully sees.

## How it works
The bracelet is a plait of 3 colored strands across a narrow grid. Play proceeds in ~8 rows. Each row, every phone privately shows: your strand's current column, its color swatch, and three big buttons — **cross left / hold / cross right**. Everyone commits their move for the row **simultaneously and blind** — you cannot see your neighbors' intents. When all three commit, the authoritative server resolves the crossings (deterministic tie/collision rule when two strands target the same cell), advances one row, and the **host screen reveals the new woven row** with a little snap animation. That per-row reveal is the drama: you were steering toward a shape you couldn't fully predict.

The host TV also shows a faint **ghosted target chevron** the group is cooperatively trying to approximate — the shared goal that turns three private hands into one intention. Phones never show the target's per-strand solution, only the same ghost, so you must read the woven rows and *feel* where to send your thread. There are no points and no scoreboard. After the final row, the bracelet renders as a **keepsake PNG** — each player's strand-path highlighted in a legend — and the group taps **keep** or **reroll**.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ code, players[3], row, strands: {playerId: {column, color}}, pendingMoves: {playerId: move}, target[] }`. Sync strategy: phones send `commit(row, move)`; the DO buffers until all three arrive, then computes the next row atomically and broadcasts `rowResolved{row, cells, strandPositions}` to everyone at once — the host animates, phones update their column. The genuinely hard part is the **simultaneity barrier plus reconnection**: a dropped phone mid-row must not deadlock the round, so unсommitted strands auto-**hold** after a short timeout, and rejoining clients rehydrate from server row-state (server is source of truth, clients render only).

## v1 scope
- Exactly 3 players, 3 fixed colors, one bracelet, 8 rows.
- Three moves: cross left / hold / right; blind simultaneous commit per row.
- One ghosted chevron target; per-row host reveal animation.
- Export bracelet + strand-legend as a downloadable PNG.

## Out of scope
- 4+ strands, real knot physics (forward/backward knots), custom palettes.
- Scoring, match-to-target accuracy meter, multiple rounds.
- Accounts, gallery, sharing beyond the local PNG.

## Risks & unknowns
- Decision depth is thin — 3 blind choices may feel arbitrary rather than intentional; tuning the collision rule to reward reading the loom is the whole game.
- Simultaneous-commit pacing can stall on one slow player; the hold-timeout must feel graceful, not punitive.
- Emergent patterns might read as noise; the ghost target and color contrast must make "we made a chevron" legible.

## Done means
Three phones join a room code, each steers one strand blind through 8 simultaneous-commit rows with correct per-row host reveals, a disconnect mid-row resolves via auto-hold without deadlock, and the room downloads a single bracelet PNG with all three strand-paths labeled — with no score shown anywhere.
