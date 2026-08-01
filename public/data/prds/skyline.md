## Overview

A 3–6 player game where the artifact you make is not a sentence but a **waveform**. Each phone is privately dealt a five-bar silhouette card — a skyline shape — and you must write a five-word sentence whose per-word surprisal under a tiny in-browser LM matches that shape. The text is never revealed. Only the curve is.

## Problem

Every LLM-scored party game reduces a whole sentence to one number, which means the only strategy is "be weird" or "be bland." But a model's surprise has *structure over time* — it lurches at word 3 and relaxes at word 5 — and nobody plays with that. The itch: make the shape of a machine's confusion into a medium you can compose in, and hide the words entirely so the shape is all anyone can read.

## How it works

Each phone privately draws a **silhouette card**: five bars in a shape like `flat flat TOWER flat flat`, `ramp up`, `valley`, `staircase down`, `twin peaks`. Only you see yours.

You get 90 seconds and a five-word box. As you type, your phone shows **your own skyline drawing itself live** — five bars rising and falling with each keystroke, ghosted against your target silhouette. Nobody else sees your text, your bars, or your card. The TV during this phase shows only a countdown and who has locked in.

On reveal, the TV shows every skyline as an anonymized bar chart, plus every silhouette card, both shuffled independently. Everyone privately matches curves to cards on their phone. Scoring: **fidelity** = Pearson correlation between your z-scored curve and your card (0–10 points), plus 3 per correct match you guess, minus nothing — the room laughs at whoever built a beautiful staircase nobody could recognize.

Z-scoring per sentence is the whole design: it makes *shape*, not raw weirdness, the thing being judged, so "just type gibberish" produces a flat-topped mess that matches almost no card.

## Technical approach

Host browser tab holds distilgpt2 via transformers.js (WebGPU, WASM fallback). Phones run no inference; they stream debounced text (250ms) over WebSocket to a PartyKit Durable Object, which forwards to the host scorer and returns a five-float curve to that phone only.

Data model: `{round, players: {id, cardId, text, curve[5], locked}}`, cards as constant integer arrays. Words spanning multiple BPE tokens sum their surprisals into one bar — so "antimacassar" is one tall building, not three.

The hard part is the live loop: four phones typing at once means ~16 forward passes per second on one host tab. Mitigations: cap at 5 words, single batched pass per tick across all pending phones, drop stale requests by sequence number. Determinism matters — same text must always give the same curve, so greedy logits, fixed dtype, no sampling.

## v1 scope

- One round, 4 players, 5 words, 90 seconds
- Six hand-authored silhouette cards
- Live private curve, shuffled public reveal, one matching pass
- Correlation + match scoring, one final leaderboard

## Out of scope

Variable sentence length, player-drawn cards, multiple rounds, cooperative interlocking skylines, revealing the text at all, model selection.

## Risks & unknowns

The first word's surprisal is dominated by the (fixed) prompt prefix and may barely move, effectively killing bar one. Distilgpt2 may not give players enough intuitive control to aim a peak at position 3 — playtest may show it feels like darts in the dark rather than composition. Matching may be trivially easy if curves separate cleanly, or impossible if they all look alike; the correlation-vs-match point split is the tuning knob.

## Done means

Four phones, one TV. A player deliberately places a spike on word 3 by choosing one strange noun, watches their private bars snap into their target silhouette, and at reveal at least two players correctly match a stranger's curve to its card — without ever seeing a single word anyone wrote.
