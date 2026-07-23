## Overview
Garland is a cooperative word-linking puzzle for 3-5 players — a phone-native riff on *So Clover*. Each player privately arranges a small ring of words and writes bridging clues; the rest of the group reassembles each ring from the clues alone. It's for word-game groups who like collaborative aha-moments over head-to-head scoring.

## Problem
*So Clover* is a wonderful co-op, but it needs paper clovers, hand-written clues, sprawling table space, and an honor system (don't peek at your own solution while others solve it). Phones make each author's arrangement genuinely private and turn the reassembly into a clean shared draggable board — no peeking possible, no paper.

## How it works
v1: each phone is privately dealt **3 nouns** shown arranged around a triangle (three corners, three edges). On each edge between two neighboring words, the author privately types **one clue word** linking those two (e.g. corners "beach" & "guitar" → edge clue "STRING"). Author submits. The **TV** then puts that clover into solve mode: it shows the 3 edge clues in fixed positions and the 3 answer words **scrambled** off to the side. The group collaboratively drags words into the three corners so each clue plausibly bridges its two neighbors. Lock in; the TV reveals the author's true arrangement and scores **corners-correct (0-3)**, summed into a cooperative total. Privacy is load-bearing: only the author knows the true ring and wrote the clues blind — a passed phone would simply show solvers the answer. **Private (author's phone):** the 3 words in their real positions + clue-entry fields, and during solving a "don't help!" lock screen. **Shared (TV):** fixed clues + scrambled words + the draggable board.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room {phase, players[], puzzles{playerId → {words[3], positions, edgeClues[3], placement, score}}}`. Sync: authoring phase — each phone edits its own puzzle locally and submits atomically. Solve phase — for v1 the TV holds the draggable board and is drag-authoritative (touch/mouse on the host); phones are spectators. Real-time sync here is light; the genuinely hard part is **content curation**: a ~200-word concrete-noun bank that yields satisfying-but-not-trivial bridges, plus banning clue words that are substrings/derivatives of the answer words.

## v1 scope
- 3 players, one round; each authors ONE 3-word triangle
- 3 edge clues each; no decoy words
- Solve on the shared TV (drag corners), reveal, score 0-3 per clover, sum a group total
- Curated 200-word concrete-noun bank + substring clue-legality check

## Out of scope
- 4-word clovers, decoy words, per-phone collaborative solving, clue timers, multi-round, cross-player word-repeat avoidance

## Risks & unknowns
- 3 words may be too easy — test whether decoys are needed even in v1
- Clue legality edge cases (plurals, compounds)
- One clever clue can trivialize a clover; one obscure clue can make it unsolvable and frustrating

## Done means
Three phones each privately show a distinct 3-word triangle; each author types 3 edge clues unseen by others; the TV shows each clover as scrambled words + fixed clues; the group drags three words into corners; on reveal the TV scores corners-correct (0-3) and sums a cooperative total, with authors unable to see or influence the solve.
