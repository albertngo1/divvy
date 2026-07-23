## Overview
Longshot is a 3-6 player betting party game where a tiny in-browser language model is the roulette wheel. The host shows a seed sentence; every phone privately wagers one word on what the model will say next; the model generates live on the TV and pays out by surprisal. It's for groups who want the LLM-perplexity theme without a writing burden — the fun is the gamble and the reveal.

## Problem
Every perplexity party game so far is "write the cleverest sentence." That rewards the same wordsmiths every round and asks a lot of shy players. Longshot flips surprisal from a *score* into *odds*: a rare word that hits pays huge, an obvious word pays pennies. Now the model's probability distribution is a betting market, and the skill is expected-value hunting, not prose.

## How it works
The host screen shows a seed prompt, e.g. `The scientist unlocked the door and found a`. Each phone PRIVATELY submits exactly one word (its bet) and stakes its single chip. Bets are blind and simultaneous. When all are locked, the host runs distilgpt2 (transformers.js) with temperature sampling to generate ~20 tokens, streaming them onto the TV token by token for suspense. For each player, the host checks whether their word appears; the payout is the surprisal (−log2 p) of that token at the step it appeared — longer odds, bigger payout. Parimutuel twist: players who bet the *same* word split its pool, punishing the obvious pick. Words that never appear = bust.

PRIVATE (phone): your secret bet, your chip, and — while you type a candidate — a debounced "model probability" preview so you learn EV. Best per-hit payout sits around p≈0.37 (mid-probability words), a real learnable sweet spot.
SHARED (host): the seed, the streaming generation, and the final lit-up matches with payouts.

## Technical approach
Host tab loads distilgpt2 via transformers.js; phones are PWA clients; an authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve) holds bets and, critically, a fixed RNG seed so the sampled generation is reproducible and non-re-rollable. Data model: `Room{seed, rngSeed, phase}`, `Player{id, betWord, chips}`. Sync: collect bets → lock → host generates with the seeded PRNG, emitting per-token `{token, logprob}` → compute surprisal payouts → broadcast. The phone probability-preview asks the host for a single forward pass of `p(word | seed)`, debounced. Hard part: reproducible temperature sampling (seeded PRNG so the reveal is provably fair) and BPE detokenization so whole-word matching survives leading-space tokens.

## v1 scope
- 1 seed prompt, 1 chip per player, 20-token generation, one round, 3-6 players
- Whole-word, case-insensitive match; payout = surprisal at first occurrence
- Parimutuel split on ties; bust if the word never appears
- Optional probability-preview hint on the phone

## Out of scope
Multi-round bankrolls, raising/folding, multiple bets, player-controlled temperature, ASR input.

## Risks & unknowns
Seeded-sampling reproducibility across transformers.js builds; BPE whitespace edge cases in matching; one-round variance can feel swingy (acceptable — it's a gamble); preview-forward-pass latency on the host.

## Done means
Four phones submit secret words blind, the host streams one seeded continuation, and the reveal correctly lights matched words and pays a surprisal-weighted parimutuel with busts — one round, no phone seeing another's bet before lock.
