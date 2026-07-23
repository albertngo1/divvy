## Overview
Blind Aisle is a concurrent-room party game for 3–5 players, each piloting one robot in a shared warehouse on the host TV while holding a *private* fetch list on their phone. The fun is anti-coordination: you can't see anyone's plan, everyone moves simultaneously, and colliding in a cell is a punishing jam — not a bump you shrug off.

## Problem
Most grid games are turn-based and legible — you see the board and react. That kills tension. Here the itch is committing blind: you know where *you* want to go, you can guess the crush around the popular bins, but the moment two of you converge on the same square you both freeze and lose the race. Coordination is the trap.

## How it works
The host TV shows an 8×8 warehouse: shelves, a handful of labeled item bins, and 3–5 robot avatars at their start cells. Each **phone privately** shows only two things: that player's order list (3 items to collect, any order) and a d-pad to commit ONE move for the next tick — up / down / left / right / wait.

Every ~2.5s the tick resolves simultaneously. The authoritative server collects all committed moves, then checks conflicts: if two robots would land on the same cell, both revert to where they started the tick and stall 1 extra tick — the cell flashes red on the TV (a jam). Two robots trying to swap cells also jam. A robot that ends a tick on one of its bins grabs that item. First to complete all 3 items wins; if the 12-tick timer expires, most-items-collected wins.

Crucially the **shared screen never shows** anyone's order list or committed move — only current positions and jams. So the popular bins become natural collision magnets, and reading who *else* probably needs the bin you're eyeing is the whole game.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve).

Data model: `room { grid, tick, deadline, robots: { id, pos, orders[], carried[], stalledUntil } }`. Each tick the server buffers `commit{robotId, dir}` messages until the deadline, defaults any missing commit to `wait`, then resolves in one pass: compute intended cells, detect cell-contention and swap-contention, revert conflicted robots, apply the rest, award grabs, broadcast the new frame.

The genuinely hard part is deterministic simultaneous-commit resolution: cell collisions, position swaps, and chained near-misses must resolve identically every time, and a fixed commit deadline must gracefully default laggards so one slow phone can't stall the room.

## v1 scope
- 3–5 players, one warehouse, one round.
- Fixed 8×8 grid, hand-authored bins, 3 items per player.
- Cell + swap collision → revert and 1-tick stall.
- 12-tick cap; win = all items, tiebreak = item count.

## Out of scope
- Multiple rounds, scoring across games, matchmaking.
- Obstacles beyond static shelves, moving hazards.
- Reconnect/replace of a dropped robot mid-round.
- Animated pathing between cells (snap positions is fine).

## Risks & unknowns
- Tick length: too fast feels twitchy, too slow feels dead — needs playtest tuning.
- Jams could feel unfair rather than funny if players can't infer *why* they collided; the red flash + brief "JAMMED" on the offender's phone must sell it.
- Small grids may deadlock into repeated mutual jams; may need a random tiebreak nudge.

## Done means
Three phones join from a room QR, each sees a distinct private order list, all commit a move each tick, two robots targeting one cell both visibly revert-and-stall on the TV, and a player who lands on all three of their bins triggers a win screen — with no phone ever having shown another player's list or move.
