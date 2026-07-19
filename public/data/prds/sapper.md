## Overview
A 3-4 player co-op deduction crawl. One player's phone is the **map** (Overwatch) — they see the field layout and the goal, but the mines are invisible to them. Every other player is a **sapper** inching across that field whose phone shows only a Minesweeper-style local danger count and a move pad — no map, no coordinates. Neither side can win alone.

## Problem
Most map-holder games are one-directional: the seer commands, the blind obey. That's a chore, not a game. The itch: make the *blind* players hold information the seer desperately needs, so the map-holder isn't a dictator but a negotiator. True two-way dependency is the fun.

## How it works
A small grid (say 6×6) has hidden mines and a goal cell. 2-3 sappers must each reach the goal without stepping on a mine, within a move budget or timer.

- **Host screen (shared TV):** a fogged grid — sapper tokens visible as dots, goal visible, mines hidden from everyone here too. Purely a shared spectacle so onlookers feel the tension.
- **Overwatch's phone (PRIVATE map):** the full grid geometry, walls, goal position, and every sapper's exact cell — but mines rendered as blanks. Overwatch knows *where* everyone is and *where to go*, nothing about danger.
- **Each sapper's phone (PRIVATE):** NO map, no position readout. Just a 3×3 proximity readout — a single number: how many of the 8 neighboring cells are mined (classic Minesweeper) — plus a directional move pad (N/E/S/W). A wrong step buzzes and ends that sapper.

So Overwatch says "you're one cell left of the goal, move right." The sapper answers "I'm reading THREE adjacent — pick another route." Only by merging geography (Overwatch) with live danger (each sapper's private, position-dependent sensor) do they thread a path. Because each sapper senses a *different* location simultaneously, one passed-around phone literally cannot play — the local readings are per-body, per-cell, at once.

## Technical approach
Authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit). Room state: `{ grid: {w,h,mines:Set,goal}, sappers: [{id,cell,alive}], clock }`. On each sapper move the server validates the target cell, checks the mine set, and returns to that sapper ONLY their new 3×3 adjacency count (server computes it — clients never receive the mine set). Overwatch receives geometry + sapper cells but the mine set is stripped from its payload. Hard part: keeping the asymmetry airtight — mines must never be sent to any client that could render them, so adjacency counts are computed server-side per move. Sync is turn-ish (discrete moves) so latency is forgiving; a small optimistic "stepping…" state hides RTT.

## v1 scope
- 6×6 grid, ~6 mines, one goal, 2 sappers, one round, 3-minute timer.
- Move = 4-direction taps; proximity = single adjacency integer.
- Win = both sappers reach goal alive; lose = any detonation or timeout.

## Out of scope
- Flags/marking, diagonal moves, variable mine yields.
- Scoring, multiple rounds, procedurally scaled difficulty.
- Reconnect handling, spectator interaction.

## Risks & unknowns
- Balancing so info-merge is necessary but not impossible; 6 mines may be too dense — tune.
- Verbal bandwidth: two sappers talking at once may overwhelm Overwatch; may need a "one sapper active" pacing hint.
- Detonation = instant elimination might feel harsh; consider a 3-life pool later.

## Done means
Two sapper phones + one Overwatch phone join via QR; Overwatch sees the map with mines blanked while each sapper sees only their own live adjacency count; a mine detonates only on the exact hidden cells; and a room can guide both sappers to the goal using only voice + the two private information halves.
