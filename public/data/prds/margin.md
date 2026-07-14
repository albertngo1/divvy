## Overview
Margin is a two-player cooperative logic puzzle that steals the picross/nonogram genre and splits its clue margins across two phones. The shared TV holds the grid; the deduction is smeared between two heads who each see only half the constraints. It's for puzzle couples and anyone who's ever solved a nonogram and thought "this is lonely."

## Problem
Nonograms are great solo brain-food but socially inert — a solved-in-silence app. The itch is to make the *information* the shareable part: turn a private logic grind into a conversation where you're constantly narrating what you can infer and begging for a number the other person is staring at.

## How it works
The host TV shows a 5×5 grid, currently filled/marked, plus a running mistake counter (3 strikes = fail). It shows NO clues. Player A's phone privately shows the five **row** clue-strings; Player B's phone privately shows the five **column** clue-strings. Either player can tap any cell to cycle it fill → mark-empty → blank; edits sync live to the TV. Because no single device holds both axes, you literally cannot solve it without talking: "Row 3 is a solid 4 — where does that leave column 1?" A shared pool of 2 erase-tokens punishes reckless filling and forces you to actually agree before committing. Solving the grid reveals a tiny pixel-art image (a cat, a key) as a small keepsake on the TV.

The per-phone split is load-bearing precisely because a single passed-around phone would display *both* clue sets and collapse the whole puzzle into a trivial solo solve — the fun IS the asymmetry.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `grid[25]` cell states, `rowClues[5]` (dealt to A only), `colClues[5]` (dealt to B only), `mistakes`, `eraseTokens`, `solved`. Phones send `{cellIdx, nextState}`; server validates against the true solution, increments `mistakes` on a wrong *fill*, and broadcasts the diff. Clue arrays are sent only to their owning socket at join. Sync strategy: optimistic cell paint on the acting phone, server reconciliation on the broadcast. The genuinely hard part is concurrent-edit conflict: both players tapping the same cell within ~100ms — resolve last-write-wins at the server with a short per-cell lock echoed to both phones so the TV never flickers between two truths.

## v1 scope
- Exactly 2 players, 1 hardcoded 5×5 puzzle
- Split clues (A=rows, B=cols), shared board, 3-strike fail
- 2 erase tokens, live sync, win reveals the pixel image
- Room via 4-letter code

## Out of scope
- Bigger grids / 3–4 players (split rows AND cols among more phones)
- Puzzle library, difficulty tiers, timer mode
- Saving/sharing the keepsake image, accounts, colored (multi-key) picross

## Risks & unknowns
- 5×5 may be too easy to need real cooperation — may need 7×7 to force genuine info-trading
- Concurrent-cell contention could feel janky if latency is high
- One player may dominate and just dictate; erase-tokens are the mitigation but untested

## Done means
Two phones join a room, each sees only its own clue axis, together they fill the correct 5×5 in under 3 minutes with the TV showing live edits and the mistake counter, and the win reveals the pixel image — with neither phone ever having displayed the other's clues.
