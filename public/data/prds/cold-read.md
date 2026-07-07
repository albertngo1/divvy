## Overview
Cold Read is a 4–6 player concurrent-room party game where the shared host screen (TV/laptop) shows a sentence with one blank and every player's phone is a private buzzer. It's for people who enjoy the specific comedy of trying to think like a machine that is dumber than they are. You don't win by being clever or correct — you win by predicting the single most *predictable* word, the one a small in-browser LLM finds least surprising.

## Problem
Most 'fill in the blank' party games reward the funniest or truest answer, which collapses into Quiplash. The untapped itch: a scoring engine that has *opinions no human shares*. A tiny GPT-2-class model has bizarre, confident, boring instincts. The fun is developing a theory of a stupid mind — and doing it blind, before anyone can copy you.

## How it works
The host screen shows a stem, e.g. `"After the storm, the whole town smelled like ____."` The model has already computed its true next-token distribution and HIDES it. Each phone PRIVATELY types one guess of the word the model considers most probable (not the correct or funny word — the most *model-likely* one). Phones show only your own input box, a countdown, and a private confidence toggle (single or double stake). Nobody sees others' guesses. On reveal, each guess is scored by the model's probability of that word; the exact top-1 token earns a bonus. The killer twist: if two or more players submitted the same word, they SPLIT that word's points. So privately you want a word that is both high-probability AND unlikely to be chosen by the rest of the table — level-2 reasoning against the model and the humans at once, executed with zero information leakage. The host then dramatically reveals the model's actual absurd top-5 and everyone's scores.

## Technical approach
Host tab runs the model (distilgpt2 via transformers.js, WebGPU/WASM) and is authoritative for scoring. Phone PWAs connect over an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{stem, phase, players[]}`, `Player{id, guess, stake, locked}`. Sync: host broadcasts phase + stem; phones send `{guess, stake}`; server locks on countdown. One forward pass per stem gives the full logits; scoring is a dictionary lookup of each submitted token's log-prob plus collision-splitting done host-side. Hard part: tokenization mismatch — players type whole words, the model thinks in sub-word tokens. v1 scores the probability of the *first* token of each guess and normalizes casing/whitespace, accepting some unfairness for simplicity.

## v1 scope
- One stem, one round, 4–6 players
- Single hidden guess + binary stake per phone
- Collision-split + top-1 bonus scoring
- Host reveal of model's top-5

## Out of scope
- Multi-round matches, streaks, categories
- Full-word (multi-token) exact scoring
- Custom/user-submitted stems

## Risks & unknowns
- Model's top word may be too obvious ('rain'), flattening strategy — needs stem curation
- Tokenization fairness could feel arbitrary
- On-device model load time on the host

## Done means
4 phones join, everyone submits a hidden guess, the host reveals the model's top-5, collisions split correctly, and a winner is shown — all in under 60 seconds per round with no phone seeing another's guess before reveal.
