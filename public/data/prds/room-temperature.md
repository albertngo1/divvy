## Overview
Room Temperature is a 3–5 player cooperative word game for a TV plus phones. Every phone quietly runs its own copy of a ~135M-parameter language model, and every phone's model has been primed with a *different private paragraph*. Together the room builds a single sentence, one word at a time, trying to make it **boring** — low surprisal — under all of those private contexts simultaneously. It's for groups who like Wavelength-shaped negotiation but want a scorer that can't be sweet-talked.

## Problem
Word party games all reward the loudest, weirdest answer, judged by whoever laughs hardest. Nobody has built the inverse: a game where *obvious* is the win condition, and where "obvious" is genuinely contested because each player is living inside a different context. Perplexity is the perfect judge for this — it is an actual number, it is merciless, and it disagrees with your intuition constantly.

## How it works
**Setup.** The server deals each phone a private CONTEXT CARD — a short paragraph: *"…the last two minutes of a hockey broadcast"*, *"a nurse's shift-change handoff"*, *"a Craigslist listing for a canoe."* Nobody sees anyone else's. Each phone prefills its local model with that paragraph (KV cache) and thereafter scores the shared sentence as a continuation of it.

**Loop (8 turns).** TV shows the sentence so far: *"The whole thing"*. Every phone privately types ONE next word. The server broadcasts the anonymized candidate list to all phones; each phone locally scores every candidate — surprisal in bits under *its* private context — and returns only numbers, never its context. The server appends the candidate with the lowest **max-across-phones** surprisal.

**Private on your phone:** your context card, your bits for each candidate, and a quiet "you were the one who objected" nudge. **Public on the TV:** the sentence, and one anonymized bar per turn = the unhappiest phone's surprisal. You learn that someone winced. Never who.

The room wins if the finished sentence's max-across-phones perplexity lands under a threshold. Reveal: cards go up, and everyone re-reads the sentence in each other's world.

## Technical approach
PartyKit / Cloudflare Durable Object room, authoritative and strictly turn-phased (COLLECT → SCORE → RESOLVE, 20s timer, default "pass"). Model: `Room {code, players[{id, contextCardId, modelReady}], sentence: string[], turn, log[{candidates, perPhoneBits, chosen}]}`. Phones are PWAs running transformers.js (SmolLM2-135M, q4, WASM backend pinned — iOS WebGPU is too variable). Per-token surprisal is one forward pass over the sequence, reading cross-entropy at each position; the prefix KV cache makes each candidate ~1 token of work.

**The hard part** is not latency, it's *numeric agreement*: two phones on different WASM SIMD paths will disagree on the same number, which corrupts an arithmetic-comparison game. Fix: phone-side scores are the *feel* (rounded to 0.1 bit, drives the dial); the server keeps a shadow model instance per context card and re-scores authoritatively for points. Second hard part: a ~90MB cold-start download per phone, gated behind a lobby progress bar. Third: tokenizer leading-space/casing edge cases making "the" ≠ " the".

## v1 scope
- Exactly 3 players, one round, 8 words
- 6 hand-written context cards
- One model, WASM only, no fallback path
- No accounts, no persistence, room code only
- Win/lose against a hard-coded perplexity threshold

## Out of scope
Multiple rounds, scoring history, player-authored context cards, model choice, spectators, mobile Safari WebGPU, any animation beyond the thermometer.

## Risks & unknowns
Cold start may kill the lobby. The optimal strategy may collapse to "everyone types 'the'" — mitigate with a per-player one-use-per-word rule and a minimum-content-words bonus. Threshold calibration is guesswork until playtested.

## Done means
Three phones on a real home Wi-Fi network each load a distinct context, build an 8-word sentence in under four minutes with no desync, and the server's authoritative max-perplexity number matches each phone's displayed number within 0.2 bits.
