## Overview
Setpoint is a 3-6 player concurrent-room party game (shared TV + phones as private controllers) where a tiny in-browser LLM's perplexity is a *target dial*, not a floor or ceiling. Each player is secretly told to make a sentence land near a specific perplexity value. It's for people who've grown numb to "write the weirdest/most-normal thing" games and want to actually *feel* the model's sense of normal as a tunable knob.

## Problem
Every perplexity party game is min-it or max-it, so the number collapses into a one-dimensional grind — you just push in one direction until the timer ends. The itch: a game where the interesting skill is *calibration* — knowing exactly how much strangeness a sentence needs to sit at a chosen band, and being able to steer up **or** down on demand.

## How it works
The host TV shows a shared topic word (e.g. "kettle") and a blank perplexity thermometer. Each phone PRIVATELY shows only that player's secret target band — Low (~40), Mid (~90), or High (~200) — with a small worked example ("a sentence near 40 reads perfectly ordinary; near 200 reads strained but still English"). Every player privately writes one sentence containing the topic word, with a 60s timer. On submit, the host runs each sentence through distilgpt2 (transformers.js), computes actual perplexity, and scores by |actual − target|: closest to *your own* target wins most points. The reveal animates all sentences onto the thermometer with their targets exposed, so the room sees who nailed their dial and who overshot.

Private per phone: your secret target band. Shared: topic word, timer, final thermometer.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). distilgpt2 runs only in the host tab via transformers.js (WASM) to guarantee a single deterministic model instance. Data model: `room{players, topic, targets{pid:band}}`, `submissions{pid:{text, ppl}}`. Sync: phone → server → host scoring queue (sentences scored sequentially against the one model to avoid WASM re-entrancy). Length-normalize (per-token mean NLL) so short sentences aren't artificially low. Hard part: making targets *hittable* — players need real intuition, so a calibration demo sentence is scored live before the round starts.

## v1 scope
- One round, 3-6 players, one topic word
- Three fixed target bands (Low/Mid/High) dealt secretly
- 60s timer, host-side scoring, closest-to-target wins
- Thermometer reveal with targets exposed

## Out of scope
- Meta round (guessing rivals' bands)
- Multiple rounds / custom bands / cumulative scoring
- Phone-side model, tie-break subtleties beyond raw distance

## Risks & unknowns
Bands may feel unhittable without strong calibration cues — the demo sentence is load-bearing. distilgpt2 perplexity is noisy on short text. Griefing the High band with gibberish is easy; mitigate by requiring the topic word, a minimum length, and rewarding the *nearest* not *highest*.

## Done means
Four phones each receive a distinct secret band, all submit within 60s, the host plots four perplexities on the thermometer against their targets, scores by distance, and declares a winner — start to finish under three minutes.
