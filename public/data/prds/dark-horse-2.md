## Overview
Dark Horse is a 3–6 player concurrent-room game where the host TV shows one sentence stem and every phone privately guesses the single word it thinks a tiny language model will predict next. You're playing Schelling-with-the-model — but with an anti-collision twist: if two players submit the same word, both get nothing. You want a completion the model rates highly that your rivals overlooked.

## Problem
Most 'predict the AI' bits collapse to everyone typing the one obvious word. That's boring and ties. Dark Horse adds a second axis — uniqueness — so the fun lives in the gap between 'what the model likes' and 'what my friends will also think of.'

## How it works
The host displays a stem, e.g. *'The old lighthouse keeper poured himself a glass of ___.'* PRIVATELY, each phone shows a text box and a countdown; you type ONE word you believe the model ranks high as the next token, blind to everyone else. The shared screen shows only the stem, a submission tally (3/5 locked), and a timer.

At reveal the host computes each submission's probability under distilgpt2 by teacher-forcing the word's tokens after the stem (∏ P(tokenᵢ | prefix)). Base points scale with that probability. Then the collision rule fires: any word submitted by 2+ players (case-insensitive) is struck to ZERO for all of them. The TV animates the model's own top-10 next words, pins each player's pick to where it landed, and X's out the collisions — so 'whiskey' (picked by three people) detonates while your lonely 'brandy' at rank 4 quietly wins.

Per-phone privacy is the whole game: simultaneous, hidden guesses are what create the collision tension. A single passed phone would leak every pick and destroy it.

## Technical approach
Host browser tab loads distilgpt2 via transformers.js (WebGPU/WASM) and is the authoritative scorer. Phones are PWA clients over a WebSocket server (PartyKit Durable Object or Socket.IO on Tailscale Serve). Data model: `Room{stem, phase, players[{id,name,word,locked,score}]}`. Sync: phones emit `submit(word)`; server marks locked and broadcasts only the count. On `all-locked` the host runs one forward pass on the stem, caches the KV prefix once, then teacher-forces each submitted word against that cached prefix (cheap — one stem encode, N short continuations). The genuinely hard part is fair multi-token scoring: BPE splits words unevenly, so raw joint probability favors short words. v1 normalizes by per-token geometric mean and shows relative ranking rather than absolute; documented as a known bias.

## v1 scope
- One stem, one round, 3–6 players.
- Single-word submissions only.
- Host-side distilgpt2; collision = zero; geometric-mean scoring.
- Reveal screen with top-10 + pinned picks.

## Out of scope
- Multiple rounds / cumulative scoreboard.
- Phrase submissions, synonym clustering.
- On-phone model inference.

## Risks & unknowns
- Multi-token normalization may feel arbitrary; needs playtest tuning.
- Model load time on first round (~2–5s) — show a calibration demo stem while it warms.
- Near-synonyms ('booze'/'liquor') don't collide but feel like they should; accept for v1.

## Done means
5 phones join, submit blind words to one stem, the host scores via distilgpt2, collisions zero out, and the TV shows a ranked reveal with a clear winner — no phone ever saw another's word before lock.
