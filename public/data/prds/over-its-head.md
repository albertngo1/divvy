## Overview
A 4-player round where the shared goal is to be understood by humans and misunderstood by a machine. Each phone holds a secret word; the group writes one 8-word sentence together on the TV; then people guess who had what, and a small in-browser LLM guesses too. You're paid for human hits and taxed for the model's confidence. For rooms with in-jokes, shared history, and at least one person who will gesture at the lamp.

## Problem
Every clue-giving game rewards the most *typical* association — the one a bag-of-words statistical model would also find. That's exactly the boring answer. Make the typical association the thing that costs you points and clue-giving becomes a completely different craft: puns, phonetics, references to the room, things that happened last Tuesday.

## How it works
All four phones privately show: your assigned secret word, plus the full pool of all four words (you know the candidates, not the owners). One shared 8-word sentence is built round-robin on the TV — each player adds one word, twice, 15 seconds per turn. You cannot own a clean clue; your two words are interleaved with three other people's agendas, and someone else's word may accidentally point at yours.

When the sentence is done:
1. **Human pass** — every phone privately assigns each pool word to a player. Simultaneous, blind.
2. **Machine pass** — the host LLM scores `"<sentence>" The secret word was ___` and reads off a probability over the four pool words.

Score per player = (people who correctly matched you) − 2 × (model's probability mass on your word, bucketed 0–3). The TV reveals the sentence, then the human guess grid, then the model's bar chart last, so the room finds out who got clever and who got caught being obvious. Highest total wins; ties break toward whoever the model rated lowest.

## Technical approach
Host tab runs transformers.js (distilgpt2-class, ~120M) on WebGPU with WASM fallback. Only one scoring call matters: a teacher-forced pass over four candidate completions of a fixed template — 4 short forward passes, well under a second. Word-level turn state lives in a PartyKit / Durable Object room: `{pool[4], assignment: {playerId → word}, sentence: string[], turnIndex, guesses: {playerId → {word → playerId}}}`.

Sync is easy (one word per turn, server-ordered, 15s server-authoritative timer). The hard parts are social-technical: preventing a player from spending both turns writing a naked synonym (enforce a server-side blocklist of the pool words, their lemmas, and any token whose unigram co-occurrence with the pool word is top-5), and making the model's probability bar legible enough that players feel the tax was fair rather than random.

## v1 scope
- Exactly 4 players, one round, one hardcoded 4-word pool
- 8 turns total, 15s each, one word per turn, host-enforced blocklist
- One blind human guess grid, one model bar chart, final scores
- No lobby polish, no avatars, no sound

## Out of scope
Multiple rounds, variable player counts, difficulty tiers, custom word pools, teams, rematch flow, any persistence.

## Risks & unknowns
A tiny model may be near-uniform over four words, making the tax noise instead of pressure — needs a pool of words with genuinely different collocation strength, tuned by hand. Eight words may be too few to carry four secrets; 12 may be needed. The blocklist can feel arbitrary and kill turns; it must show *why* a word was rejected, instantly.

## Done means
Four phones each see a different secret word and the same pool, an 8-word sentence is built round-robin without a stall, blind guesses lock simultaneously, and the host displays human matches plus the model's four-way probability bars with final scores within 2 seconds of the last guess.
