## Overview
Dog Whistle is a 3–6 player concurrent-room party game where every phone is secretly assigned a *different* target word and must craft a sentence that primes a small in-browser language model to predict that word next. It's for word-game people who like reverse-engineering how a machine thinks — a Taboo where the audience you're steering is a neural net, not a friend.

## Problem
Most 'AI word games' score you on hitting a min or max perplexity. That gets samey. The fresh itch here: aim the model at ONE specific hidden token. You're not minimizing surprise in general — you're building a runway so the model *wants* to say your word, without you ever typing it.

## How it works
Each phone PRIVATELY shows one target word (e.g. "anchor", "regret", "lemon") — every player gets a different one, never revealed to others until scoring. Under a 75-second timer, each player privately types a lead-in sentence of ≤12 words that must NOT contain the target word or an obvious inflection of it. At submit, the host prepends nothing and appends nothing — it feeds each player's sentence to distilgpt2 and reads the probability distribution over the *next* token. Your score = the probability mass the model assigns to your secret target word as the continuation (log-prob, normalized 0–100). The shared host screen shows only a live leaderboard of code-names during play, then a dramatic reveal: each sentence, its hidden target, and the model's actual top-3 guesses beside your target's rank. Watching the room realize someone steered the model to "lemon" with a sentence about a broken-down car is the payoff.

## Technical approach
Host browser tab loads transformers.js with distilgpt2 (~350MB, cached). Phones are PWA clients over a WebSocket server (PartyKit / Durable Object, or Socket.IO behind Tailscale Serve). Data model: `{roomId, players:[{id, name, targetWord, sentence, submitted, score}], phase}`. Server is authoritative for target assignment (shuffle a curated 40-word noun/verb bank, deal disjoint), timer, and phase transitions. Scoring is host-side only: for each sentence, run one forward pass, take softmax over the vocab at the final position, look up the target token's probability (handle multi-token targets by taking the first sub-token's prob, or product of sub-token probs — pick one and document). The genuinely hard part: tokenization mismatch — a target word may not be a single GPT-2 token, and leading-space tokens matter (" lemon" ≠ "lemon"). v1 curates the word bank to single clean ` word` tokens to sidestep this entirely.

## v1 scope
- 3–6 players, ONE round, one target word each
- Curated 40-word bank of clean single-token nouns/verbs
- Fixed 75s timer, host-side distilgpt2 scoring
- Reveal screen with per-sentence top-3 model guesses

## Out of scope
- Multi-token targets, multiple rounds, cumulative scoring
- Anti-cheat on typing the target as a synonym
- Model choice / difficulty tiers

## Risks & unknowns
- distilgpt2 may be too dumb to steer reliably — needs a playtest to confirm targets are hittable
- Degenerate strategy: end the sentence with a near-collocation of the target (mitigate via banned-word check)
- First-model-load latency on host

## Done means
Five phones each get a distinct hidden word, all submit a sentence, and the host renders a reveal where each sentence's score equals distilgpt2's next-token probability for that phone's secret word, ranked correctly, in under 5 seconds of scoring.
