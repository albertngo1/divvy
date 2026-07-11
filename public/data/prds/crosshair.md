## Overview
Crosshair is a cooperative party game for 3-5 players, a phone-native riff on *Cross Clues*. The host TV shows a grid whose rows and columns are each labeled with a word. Every player is secretly assigned one intersection cell and must clue it — and the room must silently reconstruct which clue belongs to which cell.

## Problem
*Cross Clues* is a lovely quiet coop game, but at the table it's sequential and chatty: one clue at a time, everyone discusses, the tension leaks out. Its real magic — you know YOUR secret coordinate but nobody else's, and a clue for row-COLD × col-KITCHEN ("fridge") is only legible if placed correctly — is a per-player hidden-state problem that begs for simultaneous private phones, not a passed card.

## How it works
The host TV shows a 4×4 grid: columns labeled (KITCHEN, OCEAN, SPACE, DESK), rows labeled (COLD, LOUD, ROUND, OLD). Cells are blank.
- **Each phone PRIVATELY shows** exactly one assigned cell — e.g. "Your target: **COLD × KITCHEN**" — plus a one-word clue box. No player sees any other player's target.
- On a shared countdown, everyone submits one clue simultaneously (e.g. "fridge"). Clues appear on the TV as anonymized, unplaced tokens in a tray.
- **The placement phase, silent and simultaneous:** each phone shows the full grid + the shared clue tray and lets that player *drag other people's clue tokens* onto cells. You cannot place your own; you never learn others' targets — you deduce them from the clue word alone. Two tokens can't share a cell, so a wrong drag physically blocks a cell someone else's clue needed.
- On timer end, the server scores each token: correct cell = point. The TV reveals every true coordinate.

Because each phone holds a *different* secret cell and must place *others'* clues blind, one shared passed phone would expose every target and collapse the game.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object per room, or Socket.IO over Tailscale Serve). Data model: `Grid{rows[], cols[]}`, `Assignment{playerId, cellId}` (secret), `Clue{authorId, text}` (author hidden), `Placement{clueId, cellId, byPlayerId}`. Server owns assignments and never leaks a cell→player mapping until reveal. The genuinely hard part is **real-time contested placement**: multiple phones drag tokens onto a shared board at once, and "one token per cell" must resolve without flicker. Use server-authoritative optimistic locking — a drag sends `claim(clueId, cellId)`, the server accepts or rejects (cell taken / token grabbed by another phone), and broadcasts board deltas at ~15Hz. Last-writer-wins with rejection toasts keeps it consistent.

## v1 scope
- 3 players, one 3×3 grid, one round.
- Each player gets exactly one secret cell; 3 clues to place.
- Text clues only; silent placement; single 90-second timer.
- Hand-authored row/column word bank.

## Out of scope
- Multi-round scoring, larger grids, difficulty levels.
- Any chat/voice channel.
- Reconnect/rejoin robustness.

## Risks & unknowns
- Contested simultaneous drags may feel janky; needs the lock protocol to feel instant.
- With only 3 clues, deduction may be too easy — tune grid size vs player count.
- Anti-coordination could tip into frustration if a clue is ambiguous; validate the word bank.

## Done means
Three phones join; each privately sees a distinct secret cell and submits a clue; the TV shows three anonymous clue tokens; each phone drags the other two players' tokens onto the grid with cell-collision rejected server-side; on timeout the TV reveals true coordinates and a per-token correct/incorrect score.
