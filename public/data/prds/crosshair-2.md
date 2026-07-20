## Overview
Crosshair is a cooperative concurrent-room party game for 3–5 players, riffing on the tabletop card game *Cross Clues*. A shared host screen (TV) shows a grid of unrelated words; each player's phone privately assigns them one secret intersection cell and asks them to bridge its two words with a single clue. The room then collectively figures out where every anonymous clue belongs. It's for groups who like the shared-brain feeling of *Just One* or *Codenames* but want everyone contributing an equal, hidden slice.

## Problem
Most convergence games give the whole room the same public information, so a passed-around phone is fine. Crosshair's itch is asymmetry-without-teams: everyone is a clue-giver AND a guesser at once, and the fun only exists because nobody can see anyone else's target coordinate. The tension is watching a clue you can't fully parse and reverse-engineering the two words it was meant to yoke together.

## How it works
The TV shows a 3×3 grid: columns numbered 1–3, rows A–C, and each of the 9 border headers is a random word (e.g. row A = "volcano", column 2 = "wedding"). Each **phone privately** shows exactly one secret coordinate (say B2) and the two words that cell intersects. The player types ONE clue word that links those two words. All players write **simultaneously and blind** — no phone can see another's coordinate or clue.

When all are in, the TV reveals the clue tokens anonymized in a shuffled tray. The room now collaboratively drags each token onto the grid cell they think it points to (one shared, negotiated placement, discussed aloud). On lock-in, the TV flips: each cell lights green if the clue there matches its true owner's coordinate. Score = correctly placed clues (cooperative, beat-your-own-record). The reveal also shows who authored each clue.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room{grid: word[9], headers: word[9], phase}`, `Player{id, coord, clue}`, `Placements{clueId → cellId}`. Sync: server generates the grid, deals disjoint coordinates, gates clue submission behind a barrier (reveal only when all in), then broadcasts the shared placement state which any phone can nudge (last-write-wins with a soft lock while dragging). Genuinely hard part: nothing real-time-twitchy — it's the fair, transparent placement UI where 3–5 people co-drag one board without stepping on each other, plus generating grids whose word pairs are bridgeable but not trivially obvious.

## v1 scope
- 3 players, one 3×3 grid, one coordinate each, one round.
- Simultaneous blind clue entry with a barrier reveal.
- Shared drag-to-place with a single lock-in button.
- Green/red reveal + author attribution + a raw correct-count.

## Out of scope
- Larger grids, multiple coordinates per player, timers.
- Fuzzy synonym scoring, streak/high-score persistence.
- Spectators, reconnection polish, animations.

## Risks & unknowns
- Word-pair generation quality: too-easy grids kill the deduction, impossible pairs feel unfair.
- Co-drag griefing / thrash when everyone grabs at once.
- Does 3-player one-coord-each give enough deduction meat?

## Done means
Three phones join, each privately sees a distinct coordinate, all submit clues blind, the room places 3 anonymized clues on a shared board, locks in, and the TV correctly scores placements against true coordinates and reveals authors.
