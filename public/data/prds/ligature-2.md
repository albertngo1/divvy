## Overview
A cooperative word-association game for 3-5, a phone-native riff on So Clover!. Each player simultaneously and privately authors a tiny puzzle: a ring of secret words joined by clue words they invent, one clue bridging each adjacent pair. The room then rebuilds each author's ring from the clues alone. It's warm, clever, and quietly competitive against the puzzle rather than each other.

## Problem
So Clover! is a lovely 'write the perfect linking word' game, but authoring is slow, exposed (you hide your card while scribbling), and only one clover is solved at a time. The magic — everyone writing their own private clover at once — is exactly what a single passed phone destroys. Per-phone privacy isn't a convenience here; it's the game.

## How it works
Setup: each phone is privately dealt a ring of 3 secret words (v1: a triangle, three edges) plus one decoy word. During a 90-second WRITE phase every phone shows *only that author's* three words arranged in a ring; the author types one bridge word per edge that links its two neighbors (e.g. between MOON and MILK: 'white'). No phone can see any other author's words — authorship is simultaneous and blind. SOLVE phase: the host TV shows one author's puzzle at a time — the three bridge words sitting on the edges, and a shuffled bank of four words (the three reals + the decoy) below. The rest of the room collaboratively drags words onto the ring's three corners to satisfy all bridges; the author watches silently, forbidden to help. Submit → the host reveals the true ring and scores corners correct (3/3 is a clean solve). Rotate through every author. Privately, each phone shows its own secret ring during WRITE and its own clue-authoring; the TV only ever shows finished bridges and the anonymized word bank.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `puzzles: {authorId: {corners: [w,w,w], decoy, bridges: [b,b,b], placement}}`. WRITE is embarrassingly parallel — each phone edits only its own `puzzles[self]`, so there's little contention; the server just collects submissions and flips to SOLVE when all are in (or the timer fires). SOLVE is a shared drag surface: one solving device (or synced multi-touch across phones) mutates `placement`, broadcast to all. The genuinely hard part is the honest-authorship boundary — corners and decoy must never leak before reveal, and the author must be locked out of the solve input for their own puzzle; the server enforces both by role-gating messages.

## v1 scope
- 3 players, triangle rings (3 words + 1 decoy), 90s write
- Fixed curated word pool; server deals rings
- Solve on the host screen via one shared drag surface
- Score = corners correct per puzzle, summed for a room total

## Out of scope
- Full 4-word clover + double-clover expert mode
- Multi-word or phrase clues; profanity filtering
- Per-phone synced multi-touch solving, saved puzzles

## Risks & unknowns
- Association clues can be too easy or unsolvable; the decoy must actually tempt
- 3 words may under-constrain — one bridge might fit two arrangements
- Solve phase risks the author blurting hints; needs a firm lockout + etiquette prompt

## Done means
Three phones each privately author a triangle in parallel with no cross-leak; the host then presents each triangle as three bridges plus a four-word shuffled bank; the room places words, the true ring reveals, corners score correctly, and every author's puzzle is solved once with the author locked out of their own.
