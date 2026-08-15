## Overview

A 3-5 player party game where the phones are draft models and the TV is the verifier. A small LLM runs in the host tab; every player privately types a three-token continuation of a shared story, and the model decides — token by token, with the actual speculative-decoding acceptance rule — how much of each draft it will swallow. For groups who like word games with a cruel, legible engine underneath.

## Problem

Word party games score by vote, which means they score by charisma. Here the judge is a 135M-parameter model with no taste and no mercy, and it publishes exactly where each player lost it. Speculative decoding is also a beautiful unused game shape: N speculators, one authority, a race measured in accepted tokens.

## How it works

The TV shows the story so far: *"The night before the wedding, Dad quietly"*. Each phone privately shows (a) a text box with a live token counter capped at 3, and (b) a **planted word** dealt only to you — a rare word ("escrow", "mule") that scores double if it ever lands in committed text. 45-second timer, everyone types simultaneously, nobody sees anyone else's draft.

On lock, the host walks each draft token-by-token against the model and accepts token *t* with probability `p_target(t) / p_max`. First rejection ends that draft; the model then resamples one token from the residual distribution. The TV reveals all drafts at once as strips of tiles filling green, then one red — that simultaneous reveal is the whole show. The longest accepted prefix wins the commit: its accepted tokens plus the resampled token are appended to the shared story. Score = accepted tokens, doubled if your planted word survived.

Phone private: your draft, your planted word, and a hot/warm/cold read on your first token only. TV public: the story and the reveal. Nothing else.

## Technical approach

PartyKit Durable Object is the authoritative room. The host tab owns the model (transformers.js, SmolLM-135M, WebGPU with wasm fallback) — phones must not download 100MB nor be trusted with the RNG. Data model: `Room {prefixTokens[], round, seed, players{id, name, plantedWord, draftText, lockedAt, score}}`. Phones send throttled draft deltas (200ms) which the server stores and never rebroadcasts; live token counts round-trip to the host tab, the only tokenizer, under a 150ms budget.

Hard part one: provable fairness. The acceptance seed is committed by the server *before* drafts lock and derived per (round, playerId), so the reveal is replayable and nobody can call it rigged. Hard part two: one batched forward pass over all drafts sharing the prefix KV cache, so reveal is under 2s instead of five sequential generates.

## v1 scope

- One round, 3 players, one hardcoded seed prefix
- Planted words drawn from a 40-word list
- 45s draft timer, lock, batched verify, reveal, commit
- Scores as plain text on the TV
- Host tab must stay open; no reconnect

## Out of scope

Multi-round stories, avatars, audience play, on-phone inference, temperature controls, anything past a wordlist profanity filter.

## Risks & unknowns

A 135M model may accept almost nothing — needs a tuned acceptance floor, measured before UI work. Tokenizer surprises (leading spaces, subwords) will confuse players. Typing is slower than talking; the 3-token cap is the mitigation. wasm fallback costs ~1s per pass.

## Done means

Three phones on a LAN draft simultaneously; within 2s of lock the TV reveals three tile strips, the longest accepted prefix is appended and visible in the story, and replaying the same seed plus the same drafts reproduces the reveal exactly.
