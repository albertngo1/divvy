## Overview

A 3–5 player living-room word game where a tiny in-browser language model scores by **ablation**. Every player privately owns one blank in a shared sentence skeleton on the TV. When the round ends, the server doesn't ask "whose word was cleverest" — it pulls each word back out, one at a time, and measures how many bits of surprisal the sentence gains without it. You are worth exactly what the sentence loses when you're gone.

For groups who already like word games but are tired of "funniest submission wins" popularity contests. The judge here is arithmetic, and it is very hard to argue with.

## Problem

Every LLM party game so far scores a submission *in isolation* — weirdest, boringest, closest to a target band. That makes the game a solitaire scoring problem played next to other people. Nobody's word interacts with anybody else's. The itch: make players' contributions genuinely entangled, so the strategic question is not "is my word good" but "is my word **necessary**."

## How it works

**Host screen (shared):** a bare, deliberately underspecified skeleton with numbered carets — `The ___₁ courier ___₂ handed over the ___₃ envelope ___₄ anyway.` Plus one big gauge: total surprisal of the sentence, in bits. During writing, the TV shows **no words** — only a countdown and a row of "submitted" lights.

**Each phone (private):** which caret is yours (and only yours), highlighted in the skeleton. You get 45 seconds to type one word (two max). You cannot see anyone else's caret, anyone else's word, or the live gauge.

**Scoring:** the server assembles the full sentence, teacher-forces it through the model for total bits, then runs one ablated pass per player. Your credit = `bits(sentence − your word) − bits(full sentence)`. A word that is itself surprising earns nothing. A word that makes *everything downstream* cheap earns a fortune.

The emergent trap, which is the whole game: **credit is not additive.** If two players independently insert the same explanation — one writes "drunk," another writes "stumbling" — removing either one barely hurts, because the other still carries the sentence. Both score near zero while feeling brilliant. Uniqueness is the resource, and you're bidding for it blind.

**Reveal:** ablation theatre. The TV shows the finished sentence, then yanks each word out in turn — the word lifts off, the sentence visibly sags, the gauge jumps by that player's score. Biggest jump wins.

## Technical approach

Host browser tab + phone PWAs + one authoritative room server (PartyKit / Durable Object; Socket.IO over Tailscale Serve works locally).

**Data model:** `Room { code, phase: LOBBY|WRITE|SCORE|REVEAL, skeleton, carets: [{index, playerId}], entries: {playerId → text}, scores: {playerId → bits} }`. Phones only ever emit `{caret, text}`; they never receive another player's entry until `REVEAL`, enforced server-side by filtering state on broadcast rather than hiding in the client.

**Model:** Qwen2.5-0.5B-Instruct q4 (or distilgpt2 for a 5× faster, dumber judge) via transformers.js on the **host tab only** — phones are dumb controllers. Scoring is N+1 teacher-forced passes over ~35 tokens, batched into one forward pass per variant; under 400 ms on WebGPU.

**Genuinely hard part:** not the socket sync — it's making the host a trusted compute node without stalling the room. Model weights are ~350 MB, so the lobby doubles as a preload bar and the room refuses to start until the host reports `MODEL_READY`. Tokenization must be pinned (same model, same BPE, same leading-space handling) or ablation deltas drift between runs. And positional bias is real: an early caret conditions more downstream tokens and structurally scores higher, so skeletons must place carets late and interleaved, with per-caret normalization calibrated by pre-scoring each skeleton against 200 filler words offline.

## v1 scope

- One hardcoded skeleton, four carets, exactly four players
- One round. No lobby chat, no avatars, no persistent scores
- 45-second write timer, single-word entries, no editing after submit
- Host tab runs the model; phones are text inputs and a submit button
- Ablation theatre reveal with the gauge animating between pulls

## Out of scope

Multiple rounds, skeleton generation by the model, phrase-length entries, spectators, reconnect-mid-round, mobile host, any leaderboard across games.

## Risks & unknowns

- Small models are noisy on short strings; deltas may be within noise for bland words. Mitigation: skeletons chosen so filler scores near zero by construction.
- Players may not intuit "load-bearing." The ablation theatre is the teaching tool — if one playthrough doesn't teach it, the game is dead.
- Redundancy collision might be too rare with four players and a good skeleton, which removes the strategic core.

## Done means

Four phones join a room code, each sees a different private caret, all four write blind in 45 seconds, the TV plays the ablation reveal pulling each word out with the bits gauge jumping, and a winner is named. Success condition for the playtest: at least once, two players submit semantically redundant words, both score near zero, and the table works out why without being told.
