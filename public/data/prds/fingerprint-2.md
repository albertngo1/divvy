## Overview
Fingerprint is a social guessing game for 4–6 players sharing a host screen with a phone each. Everyone secretly writes one sentence; a small language model turns each into a jagged "fever chart" of where it got surprised, token by token. The room then matches anonymized curves back to their authors — reading an alien model's surprise as if it were handwriting. For friends who like deduction with a genuinely weird clue.

## Problem
Perplexity is usually collapsed to a single number. Its real texture is the per-token curve — the spikes where a model didn't see a word coming. No party game makes that trajectory the thing you reason about.

## How it works
The host shows a topic ("describe your commute"). Each phone PRIVATELY shows a text box; each player writes one sentence, visible only to them. On lock-in, the host runs each sentence through the model and computes per-token surprisal (−log p of each actual token), producing a sparkline downsampled and padded to a common fixed width so length can't leak the author. The host displays all curves in a shuffled, anonymized grid labeled A/B/C… with NO words shown — just jagged lines. Then each phone privately shows the same grid plus the name roster, and each player secretly assigns every curve to a player (including a forced self-guess buried among decoys). The catch: to find your own curve you must predict where the model would spike on YOUR sentence (that one weird word); to place others you reason about how plainly or strangely each person writes. Guesses submit simultaneously and privately, then the host reveals authors and scores: +2 per correct other, +1 for correctly finding your own.

Privacy is load-bearing: your sentence and your assignment grid are yours alone. If guesses weren't simultaneous and private, players would copy and the deduction evaporates; passing one phone makes hidden authorship impossible.

## Technical approach
The host tab runs distilgpt2 via transformers.js; one forward pass per sentence yields per-token logprobs → surprisal array → downsample/pad to a fixed 16-point sparkline. An authoritative WS server (PartyKit / Durable Object or Socket.IO over Tailscale Serve) holds `{ players, sentences: Map<playerId,string>, curves: Map<curveId,number[]>, guesses: Map<playerId,Map<curveId,playerId>> }`. Phones submit their sentence, then their guess-map; the server withholds the author↔curve mapping until all guesses are in, then broadcasts the reveal. Sync is turn-gated (write phase → score phase), so the genuinely hard part isn't latency but curve legibility and anti-cheese: normalization must hide sentence length and token count, or people match by shape-length instead of reasoning about surprise. Model runs once per sentence, host-side only.

## v1 scope
- One topic, one round.
- 4–6 players, one sentence each.
- Anonymized fixed-width sparkline grid, private guess-assignment, single reveal + scoreboard.

## Out of scope
- Multiple rounds, topic decks.
- Ever showing the words — curves only.
- Reconnects, spectators, phone-side inference.

## Risks & unknowns
- Length/normalization leakage making self-ID trivial.
- Whether curves are distinguishable enough across only 4–6 short sentences.
- Model possibly too small to produce interesting spikes on plain sentences.

## Done means
6 phones each submit a private sentence, the host shows 6 anonymized length-normalized curves with no words, every phone submits a private full assignment, and the reveal scores self- and other-guesses correctly on a shared board.
