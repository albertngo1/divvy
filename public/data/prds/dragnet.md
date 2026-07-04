## Overview
An asymmetric pursuit game for 4-6. One player is the **Fugitive**, whose phone *is* the board — they see the whole grid and their own position. Everyone else is a **Hunter**, on their own phone, who cannot see the board and must corner the Fugitive using only hit/miss feedback and their own memory. Hunters win as a team; the Fugitive wins by surviving.

## Problem
Hidden-movement games (Scotland Yard, Mr. X) rely on a shared paper board and honor-system announcements. The itch: make the map genuinely invisible to the pursuers, make every sweep *simultaneous and blind*, and let each hunter build a private mental picture — so the fun is triangulating a ghost from partial, deniable information you can't compare in the open.

## How it works
**Fugitive's phone (PRIVATE):** the full grid (say 5x5), their own token, and the *history of every cell hunters have swept* — so they feel watched and dodge into the gaps.

**Each Hunter's phone (PRIVATE):** NO board — a blank 5x5 notepad grid they annotate themselves (mark misses, hunches). Each round they privately tap ONE cell to sweep. Hunters cannot see each other's picks or notes.

**Host screen (SHARED):** round number, hunters-remaining-sweeps, a pulse animation on resolve, and a tally of near-misses — no positions, ever.

Each round: all Hunters secretly pick a sweep cell; the Fugitive secretly moves to an adjacent cell. Reveal simultaneously — if any swept cell equals the Fugitive's new cell, **caught, hunters win**. Otherwise each Hunter privately learns only "your cell: empty," and the Fugitive sees the net tighten. Survive N rounds → Fugitive wins.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Model: `Room { size, fugitivePos, round, sweeps: {hunterId, cell}[], sweptHistory: cell[], phase }`. Phones send `submitSweep(cell)` / `submitMove(cell)`; server validates adjacency, holds all commits until the round deadline, resolves atomically, then sends *asymmetric* payloads: Fugitive gets full board + sweep history; each Hunter gets only their own cell's result. Hard part: keeping the board leak-proof — the Fugitive's position must never transit through any Hunter or host payload, so the server is the only holder of truth and diffs are per-recipient. Commit barrier + synced countdown keeps simultaneity fair under lag.

## v1 scope
- 5x5 grid, 1 Fugitive + 3 Hunters.
- One chase = max 6 rounds; Fugitive moves to an orthogonally adjacent cell each round.
- Each Hunter sweeps exactly 1 cell/round; simultaneous reveal.
- Win/lose screen naming who landed the catch.

## Out of scope
- Larger/procedural maps, walls/terrain, hunter movement or roles, multiple fugitives, scoring across chases, spectator replay.

## Risks & unknowns
- Balance: is 3 sweeps vs. a 5x5 board too easy or hopeless? Tune grid/rounds by playtest.
- Do Hunters need any shared out-loud coordination, or does secrecy make it better?
- On-phone notepad usability under a timer.

## Done means
Four phones join; the Fugitive sees a grid the Hunters provably cannot; three Hunters submit simultaneous blind sweeps while the Fugitive moves, one chase resolves to a correct caught/survived outcome, and no Hunter's payload ever contains the Fugitive's position.
