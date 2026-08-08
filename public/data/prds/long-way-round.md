## Overview
A cooperative silent-convergence puzzle for exactly 3 players, about 6 minutes. The host screen shows a 5×5 grid; each phone shows the same grid with a private, partial set of walls. All three must independently trace the *identical* route from start to exit, and that route must be legal in the union of everyone's walls.

## Problem
Co-op maze games hand the whole room one map, so they collapse into one loud person pointing. The interesting state — a path that each of you can walk in your own head, but that none of you can prove is real — has no game around it. Convergence games also tend to be about taste ("pick the word everyone picks"); this one has an objectively correct answer that no single player can see.

## How it works
The server generates a 5×5 grid with 14 interior wall segments and assigns each wall to exactly one player. Every phone renders the same grid, same start (bottom-left), same exit (top-right) — but draws only its own ~5 walls. Two thirds of the maze is invisible to you, and you don't know which third you're missing.

Privately on your phone: drag a finger from start to exit through orthogonally adjacent cells. The phone hard-blocks any move through a wall *you* can see, so your submission is always legal-for-you. Tap LOCK.

Publicly on the TV: nothing but a heat grid — per cell, how many players (0/1/2/3) currently have that cell in their in-progress path, plus three lock lamps. No lines, no arrows, no walls, no names. That heat is the entire communication channel.

When all three lock, the server checks two things: (a) are the three cell sequences byte-identical, and (b) is that sequence legal in the union of all 14 walls. Win requires both. Three attempts; walls persist, locks clear, and the TV keeps a faded ghost of the previous attempt's heat.

The emergent strategy is the title: clever diagonal-ish shortcuts are exactly where unseen walls live, so the room silently learns to take the wide, boring, obviously-open route — the path most likely to be wall-free for everyone and most likely to be the one everyone else guesses.

## Technical approach
Host tab + phone PWAs + PartyKit Durable Object. Model: `Room{seed, walls[{cellA, cellB, ownerId}], players[{id, path[], locked}]}`. Phones stream their in-progress path throttled to 60 ms; the server unions into per-cell counts and broadcasts at 10 Hz **to the host only** — phones receive nothing but their own grid, which keeps eyes up and prevents any phone-side inference of topology.

The hard part is generation, not sync. A solver must guarantee: at least one union-legal path exists; at least four distinct union-legal paths exist (so convergence is a real choice, not a needle); each player's individually-legal path space is at least an order of magnitude larger than the union-legal one (so naive play fails); and no player can deduce a hidden wall from their own set alone. Rejection-sample seeds until all four hold.

## v1 scope
- Exactly 3 players, one 5×5 grid, one wall layout, three attempts
- Disjoint wall ownership (each wall seen by exactly one player)
- Heat grid + lock lamps on TV; nothing else public
- Win/lose screen that reveals the full union maze and overlays all three paths

## Out of scope
- Larger grids, 4+ players, overlapping wall ownership, timers, scoring
- Any hint system, any chat, any spectator view

## Risks & unknowns
- Byte-identical paths may be brutally hard with only heat as feedback; a fallback "same cell set, any order" win condition may be needed
- Heat may leak enough to trivially converge on attempt 1, making it flat
- Finger-drag path entry on small screens needs snapping and an undo

## Done means
A laptop and three phones, three players, no talking. The generator produces a valid seed in under 200 ms, phones block illegal moves correctly, and across five test rooms at least two win by attempt 3 while at least one loses by submitting a path blocked by an unseen wall — and players describe going the long way as a deliberate choice.
