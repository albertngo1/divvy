## Overview

Nose Blind is a 3–6 player living-room game where a small in-browser LLM measures the per-token surprisal of everything each player types, in real time, and every phone is denied exactly one number: its own. You can smell everyone else's house, never yours. Built for the group that already likes writing games but is tired of "funniest answer wins" voting.

## Problem

Writing-prompt party games collapse into popularity contests, and the scoring is a black box revealed at the end. Meanwhile everyone privately believes their own answer is the clever, surprising one — that self-blindness is real, funny, and completely unexploited as a mechanic. Nose Blind makes the model's uncertainty a live, visible instrument, then withholds it from precisely the person who wants it most.

## How it works

The host screen shows one prompt ("Describe a childhood kitchen in one sentence") and a **target band**: 4.2–5.4 bits/token. All players type simultaneously for 75 seconds.

**Private, per phone:** your own text box, and live vertical meters for *every other player* — named, animated, updating as they type — plus their current in-band/out-of-band state. Your own meter is a hatched grey bar reading `——`. You steer entirely by comparison: Dana is running hot, Sam is barely above the floor, I feel weirder than Sam, so I'm probably fine.

**Shared host screen:** the prompt, the band, a countdown, and anonymous grey blobs drifting on a single axis — the room can see *that* four values are spread out, not whose is whose.

With 15 seconds left each phone locks its text and answers one private question: **"Rank yourself. Where did you land, 1st weirdest to Nth?"** Reveal: full texts, true bits/token, true rank. Score = 3 for landing in the band + 2 for calling your own rank correctly. Being weird is easy; knowing you were is the game.

## Technical approach

Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). **The model runs only in the host tab** — distilgpt2 or Qwen2.5-0.5B-Instruct (q4) via transformers.js with WebGPU. This is non-negotiable: if phones scored locally, a player could read their own number.

Data model: `Room{promptId, band:[lo,hi], phase, players}`; `Player{id,name,text,bits,rankGuess,locked}`. Phones send debounced text deltas (150 ms) → server → host tab scoring worker → server broadcasts a **redacted per-socket view**: player *i* receives `bits` for all *j≠i*, and `null` for itself.

The hard part is throughput. Six players typing at ~7 updates/sec is ~40 scoring jobs/sec against one model instance. Mitigations: a single-slot-per-player job queue that *drops stale jobs* rather than queueing them, batched forward passes across players (pad to max length, one pass per tick at ~4 Hz), and EMA smoothing so meters glide instead of jittering. Scoring is a single forward pass over ≤40 tokens — cheap; the batching and staleness discipline are the engineering.

## v1 scope

- One hard-coded prompt, one round, one band, 4 players
- distilgpt2 q8 on WASM (skip WebGPU detection entirely)
- Meters at 4 Hz, no animation polish
- Rank-guess = tap-to-order list, scored exact-match only
- Room code typed manually; no reconnect

## Out of scope

Multiple rounds, prompt packs, QR join, spectators, persistent scores, model choice, mobile-side inference, anti-cheat beyond redaction.

## Risks & unknowns

Does distilgpt2's surprisal correlate with *felt* weirdness, or just with rare tokens and typos? (Mitigation: length-normalize, strip trailing partial words.) Do live meters make players freeze instead of write? Six-way batched inference may not hold 4 Hz on a mid-range laptop.

## Done means

Four phones join, type simultaneously, and each sees three live meters and one hatched blank. At lock, the host reveals four texts with true bits/token, and at least one player's rank self-guess is wrong — proving the blindness is real, not cosmetic.
