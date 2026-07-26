## Overview

Trade Dress is a 3–5 player party word game for a TV/laptop host screen plus phones. Every player is privately assigned a **register** — a genre framing prompt — then everyone writes one short sentence about the same public topic. A small in-browser LLM (distilgpt2 via transformers.js) scores every sentence under *every* register. You score not on how cheap your sentence is, but on the **gap** between how cheap it is under your own register and how expensive it is under everyone else's.

## Problem

Almost every perplexity game collapses into "write blandly." The model rewards cliché, so five players independently converge on the same beige sentence and the room stops laughing by round two. Trade Dress makes the ruler a *difference* of two conditional perplexities, so blandness is strictly losing: a bland sentence is cheap under everyone's register, which is a margin of zero. The only winning move is to be conspicuously, unmistakably *from somewhere*.

## How it works

**Host screen (public, all round):** the topic card ("a dog that will not come inside"), player avatars, a 90-second countdown, and lock-in ticks. It never shows any register or any text until reveal.

**Each phone (private, unique per player):** your register card — one of *a court transcript*, *a recipe blog*, *a patch note*, *a eulogy*, *a Craigslist listing* — the topic, a 20-word-max text box, and a live meter showing your sentence's bits/token **under your own register only**. You never learn how you score under anyone else's, so you're guessing at a hidden field of rivals.

**Scoring:** at lock-in the host computes `bpt(sᵢ | rⱼ)` for all i,j. `marginᵢ = mean_{j≠i} bpt(sᵢ|rⱼ) − bpt(sᵢ|rᵢ)`. Highest margin wins.

**Reveal:** the N×N heatmap paints onto the TV one row at a time, diagonal glowing. Sentences and register names appear last, so the room spends thirty seconds arguing about *why* row 3 is so dark before learning it was a eulogy.

## Technical approach

Host browser tab loads quantized distilgpt2 (WebGPU, WASM fallback) and is the only authoritative scorer. Phones are PWA clients; a PartyKit/Durable Object room relays. Data model: `Room{topic, phase, deadline}`, `Player{id, name, registerId (server-private), draft, locked}`, `Scores{matrix[i][j], margins}`. Registers are dealt server-side and pushed only to the owning socket.

The genuinely hard part is **the private live meter**: N phones each want near-realtime scoring, but there is exactly one model on one host tab. Solution: phones debounce ~400 ms and send `score_request{playerId, text, seq}`; the host runs a single-flight queue with per-player preemption (a newer seq cancels the pending older one), scores only against that player's own register, and returns the result to that socket alone. Backpressure shows as a "…" on the meter, never a stall. Final scoring is a clean synchronous N×N sweep — 25 short forward passes, well under two seconds.

## v1 scope

- 3 players. One topic. One round. No rematch, no lobby persistence.
- 5 hardcoded registers, dealt without replacement.
- 20-word cap, 90-second timer, auto-lock on expiry.
- One 3×3 heatmap and a ranked margin list. Winner named. Game over.

## Out of scope

Multiple rounds, a "guess whose register" deduction phase, voting bonuses, custom registers, audience mode, reconnect-on-refresh, mobile keyboard polish, model choice.

## Risks & unknowns

Register prompts may not separate enough for an 82M-param model — margins could all be noise. Mitigation: pre-test the 5 registers offline and pick maximally separable ones; show a calibration example on the host screen so players see what a big margin looks like. Long sentences may game the mean; the 20-word cap plus per-token normalization should hold. Cold model load on the host is 5–20 s and must happen during the lobby.

## Done means

Three phones join a room code, each privately sees a different register, all three submit within the timer, the host renders a 3×3 heatmap with a correct diagonal, margins are computed identically to an offline reference script (±0.01 bits), and the room can tell you who won without the facilitator explaining anything.
