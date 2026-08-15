## Overview

A cooperative reflex game for 4 players. A tiny in-browser LLM writes a short story onto the TV one word at a time. Each player must buzz exactly once — but only during a token whose surprisal falls inside a band only their phone knows. Nobody ever sees a number. You infer the model's uncertainty from the prose itself.

## Problem

Entropy games so far *show* you the entropy: a gauge, a bar chart, a skyline. That turns a beautiful hidden variable into a number-watching exercise. The itch is the opposite — make the uncertainty invisible and make reading it a human skill. Everyone at the table already knows that "peanut butter and ___" is a sure thing and "she opened the box and found ___" is wide open. That intuition has never been the controller.

## How it works

Host streams 30 tokens at 400ms each. The room's shared job: land four buzzes, one per player, no two on the same token.

Private per phone: your band, e.g. "BUZZ ONLY WHEN THE MODEL IS SURE" (<1.0 bits), or "…WHEN IT'S LOST" (>4.0 bits), or a middle sliver (1.8–3.2 bits). Bands are disjoint and dealt secretly. Your phone shows one enormous button and your band in plain English. That's it.

Shared TV: the story, growing. Buzz flashes appear instantly as an unlabeled colored pip under the word — so the room learns *that* someone acted, never who or whether it landed.

You may talk. You may not state your band. So the table ends up shouting "don't, that one's obvious!" at someone whose whole job is obvious ones. Reveal: the entropy trace redraws under the finished sentence as a mountain range with every buzz plotted, right or wrong. Cooperative score: 4/4 bands hit, no collisions.

## Technical approach

Host tab runs transformers.js (distilgpt2 or SmolLM2-135M, int8), sampling at temperature 0.8 and recording per-step Shannon entropy of the full next-token distribution before sampling. Phones are PWA buzzers over PartyKit; the Durable Object holds room state (`lobby → deal → stream → reveal`), band assignments, and the buzz log.

The hard part is **attributing a buzz to the token the player actually saw**. At 400ms/token with 40–120ms of jitter, a naive server-timestamp attribution misfires on roughly one buzz in six — and misfires are indistinguishable from bad play, which poisons the reveal. Fix: Cristian's-algorithm clock offset per phone from WS ping/pong (median of 12 samples, ±15ms); host stamps each token frame with `(index, hostDisplayTime)`; the phone sends `{tokenIndexOnScreen, localBuzzTime}`; the host resolves in its own timeline and accepts a buzz for token *n* within a 250ms grace after *n*'s display. Buzzes landing in the grace overlap of two tokens resolve to the earlier. Every raw pair is logged so the reveal can show the true timeline.

Secondary: entropy of a 135M model is noisy and often bimodal — bands must be picked per-model from an offline histogram over 200 generations, not from round numbers.

## v1 scope

- 4 players, one story, 30 tokens, one round
- 4 hardcoded disjoint bands calibrated offline against the chosen checkpoint
- One buzz per phone, first buzz locks
- Reveal screen: entropy trace + buzz pips + pass/fail

## Out of scope

Scoring across rounds, multiple buzzes, band bidding, per-phone inference, more than 4 players, prompt customization.

## Risks & unknowns

The middle bands may be unreadable — humans probably distinguish "sure" from "lost" but not 1.8 bits from 3.2. If playtests confirm, v1 collapses to three bands and one deliberately near-impossible sliver. Also: a 30-token stream may not contain a token in every band; the generator must reject and resample stories until all four bands appear.

## Done means

Four phones join by code and receive disjoint bands; a 30-token story streams to the TV; buzz-to-token attribution matches the phone's on-screen token in 20/20 manual trials; and the reveal draws the true entropy trace with every buzz placed on the word the player was actually looking at.
