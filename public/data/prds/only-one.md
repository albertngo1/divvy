## Overview
A cooperative party game for 3-6 players riffing on *Just One*, where the whole table pools one-word clues to help a single guesser — but duplicate clues are struck out before the guesser ever sees them. The twist: cancellation isn't exact-string, it's *semantic*. Two clues that mean nearly the same thing partially or fully annihilate each other, shown as a transparency meter at reveal. The private, simultaneous, blind clue-writing is the entire engine.

## Problem
The genius of *Just One* is the agony of blind coordination: you want to help, but if you reach for the obvious clue, someone else did too and you've both wasted a slot. Exact-string matching is forgiving — 'sea' and 'ocean' both survive. That lets clever players brute-force safety. We want the sting sharper and the strategy about *avoiding the whole neighborhood* of a word, not just its spelling.

## How it works
One player is the Guesser. The host TV shows the Guesser a placeholder card back; everyone else's phone PRIVATELY shows the same secret target word (e.g. 'PIRATE'). Each clue-giver types one word on their phone, blind, under a 30s timer — nobody sees anyone else's clue. On lock-in, the server embeds every clue, computes pairwise cosine similarity, and clusters near-synonyms. Within a cluster the clues cancel proportionally: a tight pair (>0.8) both vanish; a loose pair dims to a faint, struck-through ghost. The host TV then reveals ONLY the surviving/partial clues, each with a little 'survival %' bar so the room can groan at how much they wasted. The Guesser (who never saw the target) makes one spoken guess. Cooperative score = did they get it, weighted by how much clue-signal survived.

Per-phone privacy is load-bearing three ways: the target is hidden from exactly one person; clues are written simultaneously and blind; and the cancellation only has teeth because nobody could see to dodge each other.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object) holds room state: `{targetWord, guesserId, clues: {playerId: {text, embedding, survival}}, phase}`. Phases: LOBBY → SHOW_TARGET (guesser gets a masked view) → WRITE (timer) → RESOLVE → GUESS → SCORE. Embeddings run on the host tab via a small in-browser model (e.g. `all-MiniLM-L6-v2` through transformers.js, ~25MB, cached) so clues never need a paid API; phones only send raw text. Sync is trivial — clue submission is one message per phone; the only real-time-sensitive moment is the WRITE timer, driven by server timestamps with client interpolation. The genuinely hard part is TUNING the cancellation thresholds so it feels *fair and legible*: too aggressive and every clue dies; too loose and it's regular Just One. Ship a visible similarity number so the rule is transparent, not a black box.

## v1 scope
- 3 players, one round, one target word from a hardcoded list of 40.
- One fixed Guesser (no rotation).
- Exact + semantic cancellation with an on-screen survival bar.
- Spoken guess, host taps 'correct/incorrect'. Single cooperative pass/fail.

## Out of scope
- Score persistence, multiple rounds, guesser rotation.
- Player-typed guessing (spoken + host tap is fine for v1).
- Custom word packs, profanity filtering beyond a tiny blocklist.

## Risks & unknowns
- Embedding model download/latency on the host tab (mitigate: preload during LOBBY).
- Threshold feel — needs playtesting; may need per-word calibration.
- Semantic cancellation could feel unfair/opaque; the survival % is the antidote.

## Done means
Three phones join, all clue-givers see 'PIRATE' privately, the guesser doesn't; two players submit 'arrr' and 'sea-dog' and watch them visibly cancel on the TV; the surviving clue lets the guesser say 'pirate'; host taps correct and a cooperative result screen shows.
