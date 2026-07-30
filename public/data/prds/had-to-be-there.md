## Overview

A 3–6 player living-room game about inside knowledge. The TV shows one fill-in-the-blank sentence. Everyone privately completes it on their phone, and everyone privately tries to predict one specific other player's completion. Your score is how many people nailed your answer, multiplied by how surprised a small in-browser language model was by it. The model is not a gimmick layer on top — it is the entire scoring engine, and it exists to punish you for being generic.

## Problem

Every prompt-and-guess party game collapses to the same optimum: write the obvious thing so people can guess it. Rooms converge on "beer," "my mom," "taxes." The itch is a game that pays only for the answer that is obvious *to this specific room* and opaque to everyone outside it — the in-joke, the local road, the thing that happened in 2019. Perplexity is the only cheap instrument that can tell those apart.

## How it works

1. Host screen shows a shared stem: "___ is always the first to leave."
2. **Private, per phone:** a text box (1–4 words) *and* a secretly assigned target — "Predict what **Dana** writes." Nobody knows who is predicting them. Both are typed on the same screen, simultaneously, under one 60-second clock.
3. Host screen shows only a submitted/not-submitted grid — never text.
4. Reveal: for each player the TV prints their completion, the model's own top-1 continuation as a greyed **ghost**, and a surprisal bar in bits.
5. Score = (matched predictions) × (normalized surprisal in bits, capped). "Beer" gets guessed by three people and scores ~nothing. "The blue cooler" gets guessed by the one person who was at that barbecue and scores big. Pure gibberish scores zero because nobody guessed it.

## Technical approach

Host browser tab + phone PWAs + one authoritative WebSocket room (PartyKit / Durable Object, or Socket.IO over Tailscale Serve for the homelab build). Room state: `{phase, stem, submissions: {pid: {text, bitsPerToken}}, assignments: {guesserId: targetId}, guesses: {pid: {targetId, text}}, scores}`. Phones send only `submit`/`guess`; the server timestamps, locks, and fans out phase transitions.

Exactly one model instance runs, in the host tab: SmolLM-135M or Qwen2.5-0.5B via transformers.js/WebGPU. Scoring is a single teacher-forced forward pass per submission over `stem + completion`, summing token log-probs and dividing by token count. Running it once on the host sidesteps cross-device float drift entirely.

The genuinely hard part is not sync — it's **match adjudication**. "his phone" vs "phone" vs "the phone" must count. v1: casefold, strip punctuation/articles, exact compare; else embedding cosine from the same model ≥ 0.85; else a one-tap accept/reject on the host screen. Second hazard: surprisal must be length-normalized or every long answer wins.

## v1 scope

- 1 stem, 1 round, 4 players
- Each player predicts exactly one assigned target
- Host-side scoring, ghost completion, bit bars
- Match by normalized string equality + host override tap

## Out of scope

Multiple rounds, model-in-phone, stem authoring, embeddings, spectators, reconnect grace.

## Risks & unknowns

A 135M model may find *everything* surprising, flattening the multiplier — needs calibration against a baseline corpus. Assigned-target secrecy may feel invisible to players; may need a reveal beat. Cold rooms with no shared history have nothing to reference.

## Done means

Four phones, one TV. A cliché completion guessed by everyone scores under 5 points; an in-joke guessed by exactly one scores over 30; nonsense scores 0. Full round, cold start to leaderboard, under four minutes.
