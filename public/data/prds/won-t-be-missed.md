## Overview
A 4-player, 90-second parlour game about which words in a paragraph are actually load-bearing. Everyone stares at the same short paragraph on the TV; each phone secretly deletes exactly one word; all four deletions land simultaneously and a small in-browser LLM re-reads the wreckage. You win by being the player whose deletion the model barely noticed. For groups who like Jenga, editing, and being smug about grammar.

## Problem
"Entropy games" usually ask players to guess what a model will say next — a guessing game with a slot-machine payout. Nobody has made the inverse: a game about *removal*, where the score is how little damage you did. It's tactile, instantly legible (the paragraph visibly rots on screen), and the tension is entirely between four people who cannot see each other's cursor.

## How it works
Host screen: a 60-word paragraph, plain, no annotations. A 45-second timer. Nothing else.

Each phone privately shows the same paragraph — but with a per-player **surprisal heatmap** baked in, and here is the trick: each player's heatmap was computed under a *different hidden prefix* (four one-sentence lead-ins the model was conditioned on, one per player, never shown to anyone). So a word that glows "free to cut" on your phone reads "structural" on the phone next to you. You tap one word. You may re-tap until the timer ends; your final tap locks.

At lock, the host applies all four deletions at once and scores by **leave-one-out attribution**: perplexity of the fully-mutilated paragraph minus perplexity of the paragraph mutilated by everyone *except* you. Low attributable damage wins. Because the deletions interact, cutting a word adjacent to someone else's cut can blow both your scores up — collisions are the comedy. The TV then replays the paragraph collapsing word by word, showing each player's damage bar filling, then reveals the four hidden prefixes so everyone learns why their map lied.

## Technical approach
Host tab runs transformers.js with a ~120M-param causal LM (distilgpt2-class), WebGPU with WASM fallback. All scoring is host-side and authoritative; phones never run the model. Precompute at round start: 5 teacher-forced passes (one per hidden prefix + the neutral paragraph) to get per-token surprisal, ~1s total. Per-phone heatmaps are pushed once as a 60-float array — no streaming needed.

A PartyKit / Durable Object room holds `{paragraph, tokenSpans[], players: {id, prefixId, lockedIndex}}`. Sync is trivial: taps are single ints, and only the host resolves them. The genuinely hard part is **token↔word alignment** — deleting a word must map cleanly onto BPE spans, and the leave-one-out scoring needs 5 more forward passes (2^0, not 2^4 — only the omit-me variants) inside ~2s so the reveal doesn't stall. Batch them in one call.

## v1 scope
- Exactly 4 players, exactly 1 round, 1 hardcoded paragraph, 4 hardcoded hidden prefixes
- Tap-a-word phone UI with a 3-color heat tint; no undo animation, no avatars
- Host: paragraph, timer, collapse replay, four damage bars, winner
- No lobby — join by 4-letter code, names optional

## Out of scope
Multiple rounds, paragraph packs, difficulty tiers, spectators, 5+ players, mobile-model inference, persistent scores.

## Risks & unknowns
A tiny model may rate "the" cheapest for everyone, collapsing strategy — mitigate by banning function words under 4 letters in v1. Divergent heatmaps may feel arbitrary rather than devious; needs playtesting to see if the reveal lands as an "aha" or a shrug. WebGPU availability on the host laptop.

## Done means
Four phones join, each sees a visibly different heatmap over an identical paragraph, all four lock a word within 45s, the host renders the collapse and four leave-one-out damage bars within 3 seconds of lock, and the same four deletions always produce the same scores on replay.
