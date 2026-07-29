## Overview

A simultaneous-writing game for 3–5 players. Everyone answers one public prompt with one short line. What they don't share is *how they're being measured*: each phone privately holds a hidden **register** (toddler, legal boilerplate, sports commentary, recipe, police incident report), and every submitted line is scored under *all* of them. The winner is the line with the highest **minimum** fit — the sentence that nobody's secret voice rejects.

## Problem

Every perplexity party game scores one sentence against one context and reports one number, so the metric is flat and uncontested. The interesting move is making the *same text* have five different, simultaneously-hidden scores, so writers have to aim at a target they can only see one-fifth of.

## How it works

Host screen shows the scenario: *"A note left on the fridge."* That's all it ever shows during writing.

**Each phone (private):** your secret register, a text box, and two live meters. **FIT** is bits/token under *your* register's prefix — normalized, so it reads as a percentile, not a raw number. **FLOOR** is a pass/fail fluency check under a neutral prefix; gibberish that games one register is illegal and can't be submitted. You have 75 seconds and no idea what the other four registers are.

The experience is: you type *"do not touch the lasagna,"* your own FIT bar surges, and you have absolutely no way to know whether you just alienated someone whose secret voice is *sports commentary*. So you hedge. Everyone hedges, differently.

On submit, the host reveals all lines at once, each with a single anonymized bar: its **worst** fit across the five hidden registers. Highest bar wins. Then — the payoff — the registers are revealed one at a time with each line re-scored against them, so the room finally learns that one of the judges it was writing for was a toddler.

## Technical approach

Authoritative WS server (PartyKit / Socket.IO over Tailscale Serve). The **host tab is the only place the model runs** (distilgpt2 via transformers.js + WebGPU) and the only place the register→player map lives; phones are private I/O surfaces and never receive another player's register.

Data model: `Room { scenario, players: {id, registerId, draft, submitted}, registers: RegisterId[] }`. Each register is a ~40-token prefix with a precomputed KV cache built once at room start, so scoring a 12-token candidate is one short incremental pass. Live typing meters are debounced at 400ms and each player's draft is scored against **only their own** register — 5 concurrent short passes, not 25.

Hard part is **comparability**, not sync. Raw bits/token differs wildly by register: legal boilerplate is intrinsically low-perplexity, toddler speech high. A naive `min()` across registers would just always elect the legalese judge as the bottleneck. So each register ships with an offline-computed baseline (mean/σ over ~200 neutral sentences), and all fits are z-scored before the min is taken. Getting those baselines to actually equalize the registers is the whole calibration risk.

## v1 scope

- One round, one hard-coded scenario, one fixed set of 5 registers
- 3–5 players, 75-second timer, one 8–14 word line each
- Private FIT meter + FLOOR gate on phone; anonymized min-bar on host
- Reveal sequence: winner, then registers, then per-register rescore

## Out of scope

- Guessing which register was the bottleneck, multiple rounds, player-authored registers, register drafting, persistent scoring.

## Risks & unknowns

- Optimal play may collapse to "write the blandest possible sentence" — the FLOOR gate does not prevent this; may need a specificity bonus.
- Z-score calibration may not fully equalize registers; one voice may dominate every bottleneck.
- 12 tokens may be too short for register signal to separate from noise.

## Done means

Five phones typing at once, each seeing only its own live meter with under 500ms lag, host reveals five lines with min-bars that a room of humans agrees are *not obviously wrong*, and at least one player says "who the hell had the toddler."
