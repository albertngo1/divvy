## Overview
Off Script is a Wordle-shaped daily browser game for word nerds and ML-curious tinkerers. You complete a sentence one word at a time, and your score is how *unpredictable* — yet still coherent — you can be. It's the mischievous inverse of autocomplete: instead of typing what the model expects, you fight to surprise it without falling into gibberish.

## Problem
The HN brain-to-text and steganography stories both circle the same nerve: machines are getting eerily good at predicting the next thing you'll say. Autocomplete flattens everyone toward the median phrase. There's no playful way to feel — and beat — your own predictability. Off Script turns predictability into an opponent.

## How it works
Each day everyone gets the same seed stem, e.g. "The old lighthouse keeper refused to ___". You add words one at a time. For each word the game computes its *surprise* = −log2 p(word | context) from a small language model — rarer continuations score more. But there's a coherence gate: your word must still fall inside the model's broad plausible tail (top-K under high-temperature sampling), so "refused to xylophone" is rejected as gibberish, while "refused to apologize to the fog" scores big. You get ~8 words; total surprise is your score. Share a spark-line of your per-word surprises like a Wordle grid.

## Technical approach
Static site. GPT-2 small runs client-side via transformers.js (WebGPU/WASM), giving both next-token probabilities and a high-temperature top-K plausible set from one model — no server, no second judge needed. Data model: {date, stem, submitted_words[], surprises[]}. Key trick: use the SAME model for both scoring (greedy prob → surprise) and the coherence gate (must be in top-K of a temp≈1.3 sample), which elegantly defines "surprising to the confident model but not insane." Daily stem drawn from a seeded curated list. The genuinely hard part is tuning K and temperature so the game can't be won by exotic-but-empty words, and keeping in-browser inference under ~1s per word.

## v1 scope
- One shared stem per day
- Client-side GPT-2 small scoring + top-K coherence gate
- Per-word surprise bars and a total score
- Copyable share string

## Out of scope
- Accounts, global leaderboard
- Multiplayer / head-to-head
- Multiple languages or larger models

## Risks & unknowns
- In-browser model load/latency on weak devices
- Coherence gate too strict (frustrating) or too loose (gibberish wins)
- Degenerate strategies (rare proper nouns) — may need a stoplist

## Done means
A hosted page where, on load, I get today's stem, submit 8 words, watch each word's surprise score in under a second, see a total, and copy a shareable grid — with obvious gibberish rejected by the coherence gate.
