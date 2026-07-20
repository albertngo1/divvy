## Overview
Dark Horse is a 3-6 player concurrent-room party game about the gap between what a human expects and what a language model expects. On a shared TV sits a sentence with one blank. Every phone secretly fills it. You win by picking the word the model rates a long shot but that your friends independently thought of too.

## Problem
The earlier games in this theme mostly ask "beat the model at min or max perplexity" — a solo optimization against a scorer. The social itch left untouched: the funniest, most human answers are exactly the ones a small model rates unlikely — but only if the room agrees they're obvious. Dark Horse turns the model's blind spots into a convergence game, rewarding shared human intuition the model lacks.

## How it works
Host shows a prefix: "He reached into his coat and pulled out a ___." Each phone PRIVATELY types one word, simultaneously and blind — nobody sees others' entries, words, or counts. 30s timer. On lock, the host runs distilgpt2 to get each distinct word's surprisal at the blank. Score per player = surprisal(word) x matches, where matches = the number of OTHER players who submitted the same normalized word. A word nobody else picked scores 0 — being uniquely clever is a bust. A word the model finds obvious ("gun", low surprisal) scores near 0 even with a full-room match. The bullseye is the word humans find natural but the model rates a long shot: "harmonica", "kitten", "note". Host reveal: a bar chart plotting each distinct word as (model surprisal) x (human votes), the winning dark horse glowing.

What's private vs shared: phones show only your own input box; the host shows the prefix, timer, and — only at reveal — everyone's words. Blind simultaneous entry is the ENTIRE mechanic: a collision only means something if nobody could copy. Pass one phone around and the game collapses.

## Technical approach
Host tab loads transformers.js distilgpt2. Server (PartyKit/Durable Object or Socket.IO over Tailscale Serve) holds {roomId, prefix, phase, submissions:{playerId:{word}}}. Phones are PWA clients: QR join, one text input, submit -> server stores, never broadcasts others' words until reveal. Host computes surprisal per unique word as summed token surprisal = -sum log p(token | prefix, prior tokens) over the word's BPE tokens (batch the uniques, one forward pass each). Normalize words (lowercase, trim, light lemmatize); matches on normalized form. The genuinely hard part isn't sync (submissions are one-shot) — it's multi-token words and normalization: "harmonica" is several BPE tokens, so define surprisal as the summed conditional token surprisal and cap word length. Near-synonyms ("cat"/"kitten") do NOT merge in v1 — exact normalized collisions only.

## v1 scope
- 3-6 players, ONE hardcoded prefix, one round.
- Single blank, single-word entry, 30s timer.
- Host-side scoring, one bar-chart reveal, one named winner.
- QR join, no accounts.

## Out of scope
- Embedding/synonym-based match merging.
- Multiple rounds or running score.
- Player-chosen prefixes; ship 5 hand-tuned ones.

## Risks & unknowns
- 3-player rooms rarely collide — reward 2-way matches; accept that 3p is thin rather than seeding fake votes.
- distilgpt2 surprisal may not track human intuition of "long shot" — hand-validate the 5 prefixes so a known dark-horse word exists.
- Word normalization edge cases (plurals, typos).

## Done means
Five players on five phones each submit a word to one shared prefix; within 3s of lock the host renders a surprisal-x-matches bar chart and names the highest-scoring word's author as winner.
