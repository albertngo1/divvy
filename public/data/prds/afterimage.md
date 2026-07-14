## Overview
Afterimage is a 3-player cooperative party game for a shared host screen plus per-phone private controllers. The host briefly flashes a small lit-cell pattern; each player must privately reconstruct it from memory, and the room wins only when all reconstructions become bit-for-bit identical — the truth is optional. The fun is the drift: where memories disagree, you stop chasing what was really there and start guessing what everyone *else* remembers.

## Problem
Most memory games test individual accuracy against a ground truth. That's solitary and per-phone is decorative. Afterimage makes memory *social*: your reconstruction has to match your friends' reconstructions, so the interesting cells are the ambiguous ones where the room's collective false memory converges on a wrong-but-shared answer — a silent Schelling negotiation with no talking allowed.

## How it works
Host screen (shared): shows a 4×4 grid. At round start it lights ~6 cells for 1.5s, then goes dark. Between attempts it shows ONLY a unanimity meter: how many of the 16 cells all three phones currently agree on (lit-or-unlit), never who differs or which cells. It never re-shows the original.

Each phone (private): a personal 4×4 grid, all cells off. You privately toggle cells to reproduce what you saw. You submit; you cannot see anyone else's grid, ever. After all submit, the host's unanimity number updates and a countdown starts the next 20s attempt. You keep editing across attempts, silently converging.

Win: three consecutive... no — win when all 16 cells are unanimous (all three grids identical) at the end of any attempt. A round is capped at 5 attempts. The reveal at the end overlays the shared final grid on the original flash so everyone sees how far the collective memory drifted.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { phase, flashPattern:uint16, attempt, grids: {playerId: uint16} }` — each grid is a 16-bit mask. On submit the server stores the mask; when all submitted it computes unanimity = popcount of `~(A^B | A^C | B^C)` and broadcasts only that scalar to the host, plus a private ACK to each phone. Sync is turn-batched (submit → resolve), so there's no hard real-time constraint. The genuinely hard part is *information hygiene*: the server must leak nothing that lets a player reverse-engineer another's grid — only the aggregate count, and only at attempt boundaries — or the silent-guessing tension collapses.

## v1 scope
- Exactly 3 players, one host, one round.
- Single 4×4 grid, one 1.5s flash, up to 5 attempts.
- Unanimity meter is the only shared feedback.
- End-of-round overlay of final consensus vs. original.

## Out of scope
- Scoring, streaks, multiple rounds, difficulty tiers.
- >3 players, color cells, non-grid patterns.
- Spectators, reconnection, animations beyond a fade.

## Risks & unknowns
- Does 5 attempts give enough signal to converge, or does the room stall on a 15/16 standoff? Tune attempt count and grid size in playtest.
- Griefer who edits randomly can never let unanimity hit 16 — acceptable for a co-op party toy but worth noting.
- Flash duration is the whole difficulty knob and is device-latency sensitive.

## Done means
Three phones join a room code, see a 1.5s flash, privately edit their own 4×4 grids across attempts, the host shows a live unanimity count that never reveals individual grids, and the room triggers a win overlay the instant all three masks are equal.
