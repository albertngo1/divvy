## Overview

A fully cooperative 3–5 player game. The table builds one twelve-word sentence, one word per player in rotation, aiming to land its mean per-token surprisal inside a narrow target band. The catch: each phone's offered word choices are sampled from the model at that phone's **private temperature**, so players have wildly different amounts of chaos available and nobody knows who holds what.

## Problem

Co-op party games usually manufacture asymmetry with arbitrary role cards. Here the asymmetry is real and mechanical — the same model, the same context, genuinely different distributions — and it produces a specific, funny table dynamic: the room screaming "we need something WEIRD" at a player whose six options are *the, and, was, to, in, a*.

## How it works

1. Host screen shows a stem (*"By the third night, the lighthouse…"*) and a target band, e.g. **3.2–3.8 bits/token**, drawn as a needle gauge with a green zone.
2. Each phone is privately assigned a temperature from {0.2, 0.5, 0.9, 1.4, 1.8}, shuffled each game. **You are never told your own number** — only shown your options, so you must infer your own heat from how strange your words look relative to what others play.
3. On your turn, **your phone privately shows six candidate next-words** sampled from the model's distribution given the sentence so far, at your temperature. You may only play one of the six. You cannot type. You cannot pass.
4. **Host screen (public):** the sentence so far, the needle moving after each word, and the word count. It never shows anyone's rejected candidates or anyone's temperature.
5. After twelve words, the room wins if the mean surprisal (computed under the model at temperature 1.0) sits inside the band. Miss high = the sentence is gibberish; miss low = the sentence is a cliché.
6. Talking is unlimited and essential. "Can anyone give me a verb that isn't *said*?" is the entire game.

## Technical approach

Host browser tab owns the model (transformers.js, distilgpt2 or Qwen2.5-0.5B) and is the single source of truth for logprobs. Socket.IO server behind Tailscale Serve holds authoritative room state.

Data model: `Room{stem, band:[lo,hi], words[], turnIdx, surprisals[]}`, `Player{id, temp, candidates[]}`.

Sync: on turn start the server asks the host to sample candidates for the *active player only* at that player's temperature, then unicasts them to that phone. The played word goes back to the server, which asks the host for that token's logprob at T=1.0, appends it, and broadcasts the new public state. Candidate lists are never broadcast — that's the entire secret.

The hard part is latency, not secrecy: each turn requires a round-trip to a browser-hosted model (sample → unicast → play → score → broadcast). Keeping that under ~1.5s means a KV cache pinned per room on the host tab and a prefetch of the *next* player's candidates during the current player's deliberation, discarded if the sentence diverges.

## v1 scope

- One stem, one band, one twelve-word sentence, one round
- 4 players, fixed rotation, temperatures shuffled from a hardcoded set
- Six candidates, tap to play, no timer
- Needle gauge + win/lose screen

## Out of scope

Multiple rounds, difficulty tiers, a saboteur variant, temperature-guessing bonus, undo, sentence sharing/export.

## Risks & unknowns

The band may be trivially easy to hit by accident with twelve words — needs playtesting to find a width that's tense but winnable. Low-temperature players may be so constrained the turn is boring rather than funny. Distilgpt2's surprisal on short sentences is high-variance, so the band might need to be computed relative to the stem rather than absolute.

## Done means

Four phones each see a different six-word menu for the same sentence position; the table builds twelve words out loud; the TV needle lands in or out of the green zone; and at least one player says "I literally could not have done that" — with no phone ever having seen another phone's options.
