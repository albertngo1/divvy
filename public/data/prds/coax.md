## Overview
Coax is a concurrent-room party game where every player secretly tries to steer a small in-browser language model into saying their assigned word. Played on a shared host screen (TV/laptop) with 3–6 phones as private controllers.

## Problem
LLM party games treat the model as an oracle you interrogate. Nobody plays directly against its next-token distribution. Coax makes that distribution the trophy: the itch is "can I write a sentence so loaded that even a dumb 100MB model can't help but say my word next?"

## How it works
Each phone PRIVATELY receives a secret target word (e.g. "banana," "guillotine," "Tuesday") — different per player, never shown on the host screen. Everyone gets 90 seconds to type ONE short lead-in (≤10 words) that must not contain the target, engineered so the model's most likely continuation IS that word. On submit, the host feeds each lead-in to the model, reads the next-token distribution, and scores you by the rank/probability it assigns your secret word. The host screen then theatrically reveals, one player at a time: your lead-in, the model's actual top-5 predicted next words, and where your secret landed. "The zoo gates swung open and out ran a ___" → model says BANANA at rank 40? Groans. The private per-phone target is the entire game — if the room saw your word, coaxing is trivial, and copying ruins it. Simultaneous hidden writing is load-bearing.

## Technical approach
The host browser tab loads one small causal LM via transformers.js / WebLLM (distilGPT2 or a small WebGPU model) as the single authoritative scorer. Phones are PWA controllers over an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, phase, players[]}, Player{id, secretWord, leadIn, score}. Flow: server assigns secretWord from a curated single-token wordlist → collects leadIns → signals host to score. Host tokenizes each lead-in, runs one forward pass, takes the final-position logits → softmax → looks up P(secretWord) and its rank, emits {playerId, prob, rank, top5} back through the server for the reveal. The genuinely hard part: getting real, deterministic next-token probabilities out of the browser model, and the multi-token-word problem — targets must be single-token, or you score first-token prob / product of conditionals.

## v1 scope
- One round, 3–6 players.
- Curated ~50-word single-token target pool.
- One model (distilGPT2), scoring on host only.
- Score = rank of secret word; ties broken by probability.
- Static reveal list, top-5 flip animation only.

## Out of scope
- Multiple rounds / cross-round scoreboard.
- A guess-my-word bluff bonus layer.
- Multi-token targets, model choice, difficulty tiers.

## Risks & unknowns
- Model too weak → every score is rank 200, no signal. Wordlist must be tuned so plausible coaxing lands in the top-20.
- WebGPU unsupported on some hosts; WASM fallback is slow.
- Single-token constraint limits fun words.
- Are raw ranks fun, or do we need a friendlier 0–100 mapping?

## Done means
Five phones join by code, each gets a distinct hidden word, all submit lead-ins, and the host screen shows every player's sentence with the model's top-5 and their secret word's rank — computed live in-browser — naming a clear winner, in one round, no reload.
