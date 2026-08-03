## Overview
A 3-player, 3-minute wordgame for a living room with a TV. The host screen shows a single 7x7 crossword grid. Each phone holds a private set of clues — but the clues come from three *different* puzzles that were independently filled over the same grid geometry. Every crossing square is therefore a place where two people's answers might disagree, and disagreement is fatal.

## Problem
Crossword races are solitaire performed near other people: the grid is consistent, so more solvers is strictly better. There is no reason to look up from your own clues. We want the grid itself to become contested territory, where the interesting question is not "what is 4-Down" but "is anyone else about to write in my square, and can I get them to write my letter."

## How it works
The grid has 12 slots. Each player is privately dealt 4 clues, one per slot, with slots overlapping heavily between players. Solving is easy; placement is the game.

A player types a full entry on their phone and hits INK. The server writes that word's letters into the grid cells. For each cell:
- empty → becomes inked with your letter, owned by you
- already inked with the **same** letter → merge; both owners keep it, both entries stay alive
- already inked with a **different** letter → the cell becomes a permanent BLACK SQUARE, and every entry passing through it is voided for everyone, permanently

**Host TV (public):** the grid rendered as state only — empty / inked / black — with no letters, plus a live score bar. When a square blackens, it slams with a sound and the room learns *where* but not *what*.

**Each phone (private):** your 4 clues, your keyboard, your own inked letters visible in your own grid copy, and the public state of every other cell. You can see someone inked 4-Down. You cannot see with what.

So the room talks: "Is your 6-Across ending in an S?" Answering honestly invites someone to aim at agreement — which *rewards both of you*. Lying gets them blackened. Scoring: +1 per surviving letter you own, shared credit on merged cells, 0 for a voided entry.

## Technical approach
PartyKit / Cloudflare Durable Object per room; host tab and phone PWAs over WebSocket. Data model: `Cell {id, row, col, state, letters: Map<playerId, char>}`, `Slot {id, dir, cellIds, perPlayerClue, perPlayerAnswer}`, `Ink {playerId, slotId, word, seq}`.

Sync is easy in an unusual way: collision resolution is **order-independent** — two players disagreeing on a cell blackens it regardless of who arrived first — so there is no latency-fairness problem and no need for clock normalization. The server applies inks serially, recomputes affected slots, and broadcasts a *redacted* grid (state only) to the host plus a per-player letter overlay on a private channel. Redaction must happen server-side; the host tab never receives letters until reveal.

The genuinely hard part is **content generation**: producing three independent fills of one grid whose crossings agree at a tuned rate (~35%). Too much agreement and nothing blackens; too little and the grid dies in 40 seconds. Approach: fix grid geometry, then simulated annealing over a scored word list with an explicit objective on crossing-agreement count, run offline into a pack of 20 pre-baked grids.

## v1 scope
- 3 players, one 7x7 grid, 12 slots, 4 clues each
- One 3-minute round, no rematch flow
- 5 hand-authored pre-baked grids, no live generator
- No un-ink, no undo, no partial entries
- Reveal screen: full letters, ownership colors, blackened cells

## Out of scope
Rematch, more than 3 players, live grid generation, timed hints, spectator mode, mobile keyboard polish beyond a plain input, dictionary validation of arbitrary words.

## Risks & unknowns
The pre-baked packs may be unfun in a way only playtesting reveals — if the agreement rate feels random rather than negotiable, the talk phase dies. Players may not realize agreement is *rewarded*; the tutorial must show a merge before a blackening. Typing a full word on a phone is slow enough that a 3-minute round might only fit 4 inks per player.

## Done means
Three phones join a room code, each sees a distinct 4-clue set, and a full round runs: at least one merge (two players independently writing the same letter into a shared cell, both scoring it) and at least one blackening (different letters, cell permanently dead, both entries zeroed) are visible on the host TV, with the reveal screen correctly attributing every letter.
