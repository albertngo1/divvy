## Overview
An online two-player game about communicating through an absurdly narrow channel, inspired by Meta's non-invasive brain-to-text work (tens of characters per minute). For friends who want a weird, funny co-op challenge and a visceral appreciation for how fat our normal communication pipes are.

## Problem
We take high-bandwidth language for granted. Brain2qwerty shows real thought-to-text runs at maybe 5–30 bits/second — brutal. Nobody has ever *played* that constraint, so the number stays abstract.

## How it works
The Sender sees a target phrase. They can't type freely: they navigate a predictive-text tree using only ↑ / ↓ / SELECT, spending a capped number of keystrokes ("bits") to emit a telegraphic message. The Receiver reconstructs the target from that garbled output. Score = reconstruction accuracy, normalized by bits spent. Roles swap each round; the leaderboard ranks "bits per correct concept."

## How it works (mechanic detail)
Each keystroke deterministically walks a precomputed word trie ranked by frequency, so ↓ demotes to less-likely completions and SELECT commits — the Sender is literally steering a low-bandwidth autocomplete, exactly the felt experience of BCI typing.

## Technical approach
Web front-end + WebSocket rooms (PartyKit or plain `ws` on Node). The predictor is a bigram/word-frequency model over a fixed lexicon, baked into a JSON trie — no live LLM required, keeping it deterministic and offline-friendly. Targets are a curated phrase set. Scoring in v1 is keyword-overlap (later: a small local sentence-embedding for semantic similarity). The genuinely hard part is tuning the keystroke budget against the predictor so a round is frustrating-but-winnable — all the fun lives on that knife-edge.

## v1 scope
- 2 players, hotseat first (netcode after)
- Phrase targets only (no images), fixed 12-keystroke budget
- Keyword-overlap scoring, 20 curated phrases

## Out of scope
- Any real EEG/BCI hardware
- Image targets, matchmaking, large lexicon, embeddings

## Risks & unknowns
Predictor too generous = trivial; too stingy = miserable and scoring feels unfair. Cold-start needs seeded phrases and a snappy tutorial.

## Done means
Two strangers complete a full swap-roles round, and in playtests over 60% of *started* rounds reach a scored guess — with both players able to say afterward, unprompted, that "typing at thirty baud is exhausting."
