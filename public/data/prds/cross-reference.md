## Overview
A phone-native, fully-simultaneous riff on **Cross Clues**, for 3–4 players cooperating against the clock. The host TV shows a shared 5×5 grid of words with lettered columns and numbered rows. Each phone privately holds one secret coordinate. Everyone gives clues and guesses at the same time — no turns, no waiting.

## Problem
Most "give a one-word clue" games are strictly turn-based: one clue-giver, everyone else idle. That's dead time on a couch full of phones. And the physical Cross Clues asks you to hide a little coordinate card you keep flashing by accident. Per-phone privacy fixes both — every player can hold a *different* secret target and act on it *simultaneously*, so the whole room is busy at once and nothing leaks.

## How it works
The TV builds a grid: columns **A–E**, rows **1–5**, each cell filled with a random word (BANANA at C3, ANCHOR at A5…). Public to everyone.

Each phone privately receives one **secret coordinate** (say your phone whispers "C3"). It shows *only* your target — not the others'. You type a single **clue word** that links to whatever word sits at your cell (for C3=BANANA you might clue "peel"). All players do this simultaneously; clues pop onto the TV as anonymous floating tiles.

Then everyone flips to guessing: your phone lets you tap a cell on the grid for *each clue you didn't write*, trying to place other people's clues. When a clue is correctly matched to its coordinate by anyone, that cell lights green on the TV. The group wins by filling all targets before the timer runs out. The private-per-phone secret coordinate is load-bearing: if one phone were passed around, you'd see everyone's targets and the guessing evaporates — the fun requires each player to *simultaneously* hold a target only they know while decoding clues for targets they don't.

## Technical approach
Authoritative WebSocket server (PartyKit / Socket.IO over Tailscale Serve). Data model: `room{grid:[25 words], targets:{playerId→coord}, clues:[{authorId, text, coord}], solved:Set<coord>, timer}`. The server assigns distinct coordinates, pushes each only to its owner, and never reveals a coordinate until its cell is solved. Sync: clue submit → broadcast anonymized tile; guess → server checks `guess.coord === clue.coord`, marks solved, broadcasts. Hard part is *simultaneous authority* — many players guessing many clues at once means the server must atomically resolve first-correct-wins per clue and reconcile the TV without flicker; keep the grid state server-owned and diff-broadcast.

## v1 scope
- 3 players, one shared 5×5 grid, one round, 90-second timer.
- Each player gets exactly one secret coordinate → three clues total to solve.
- Curated 25-word deck.
- TV: grid + floating clue tiles + green fills + timer. Phone: your secret target, clue box, tap-to-guess.

## Out of scope
- Scoring/leaderboards, multi-round campaigns.
- Player-authored grids, difficulty tiers.
- Duplicate-clue arbitration, profanity filtering.

## Risks & unknowns
- With only 3 clues, a round may end in ~20s — timer and grid size need tuning for tension.
- Two players might clue overlapping words; guessers could get confused — acceptable at v1.
- Simultaneous guessing UX on a small phone grid could feel fiddly; needs big tap targets.

## Done means
Three phones each privately show a distinct secret coordinate on a shared TV grid; all three type a one-word clue at once; each player can then guess the other two clues' cells; the server correctly turns a cell green only on a right match, and the round ends in a shared win when all three cells are solved before the timer — with no phone ever seeing another player's target until it's solved.
