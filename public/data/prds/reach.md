## Overview
Reach is a 3–5 player drafting-and-deduction party game. The TV shows a shared row of tiles that players snake-draft into public tableaus, but each phone secretly holds a *different* scoring objective. The fun is drafting greedily enough to score while staying cagey enough that nobody deduces your goal.

## Problem
Drafting is a beloved board-game engine (booster drafts, Sushi Go, 7 Wonders) but in person it's slow: pass the pack, wait, re-hide your hand. And hidden-objective games (like Red7 or secret-mission games) need peek-proof cards and honest scoring. Both frictions vanish when a phone holds your objective and computes your score—freeing room for a deduction layer that paper couldn't sustain.

## How it works
**Host screen (shared):** a draft row of 12 attribute tiles (each has color/shape/number), a snake-order turn indicator, and every player's growing tableau face-up. Picks are public—everyone sees *what* you take.
**Phone (private):** your one secret Objective card (e.g. "most tiles of a single color," "a numeric run 3-4-5," "fewest tiles but all-unique shapes"), a live private score preview, and—at endgame—a form to guess each opponent's objective.
**Flow:** Snake draft ~3 tiles each. On your turn (server turn-gated) tap a tile from the row; it moves to your public tableau. Because tableaus are visible but objectives aren't, opponents infer your goal from your picks—so you may grab an off-objective tile as a feint. After the draft, each phone privately assigns a guessed objective (multiple-choice from the deck) to every opponent. Final score = your objective points + 2 per correct motive guess. Host reveals all objectives and scores.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room{ players[], draftRow[tileId], snakeOrder[], turnIdx, tableaus{playerId:[tileId]}, objectives{playerId:objId} (server-secret), guesses{playerId:{targetId:objId}} }`. Sync: server is the turn authority—only the current player's tap is accepted, then it broadcasts row/tableau deltas to all. Objectives are never sent to non-owners. Being turn-based, real-time load is light; the genuinely hard part is *objective-deck balance* (no dominant goal, and goals must be inferable-but-not-obvious from 3 picks) plus rejecting out-of-turn taps cleanly.

## v1 scope
- 3 players, one snake draft of 9 tiles (3 each)
- Fixed deck of 8 objectives, one dealt secretly per player
- One motive-guess round, host shows scored reveal

## Out of scope
- Multiple rounds, tile abilities, reconnection, animations, deeper tableaus

## Risks & unknowns
- 3 tiles may be too shallow to both score and disguise intent
- Objective balance is delicate; deduction could be trivial or hopeless
- Deception incentive must actually bite, not just add noise

## Done means
Three phones join, each receives a distinct secret objective, the snake draft completes turn-gated on the host, each phone submits motive guesses, and the host shows final scores with all objectives revealed.
