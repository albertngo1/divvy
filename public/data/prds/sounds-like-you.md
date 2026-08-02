## Overview

A voice-forgery game for 4 people, a TV, and four phones. Every player seeds a tiny private corpus of their own writing; the host's small language model then uses each corpus as a conditioning prefix and judges anonymous sentences by which player's voice makes them least surprising. Your job is to write one sentence that the model files under someone *else's* name.

## Problem

Impersonation games normally end in a vote, which means they're really popularity games. Here the judge is a perplexity number, and — the actual design idea — the feedback you get while writing is deliberately one-sided: the phone tells you when you're leaking yourself, never whether you're landing your target. Legible self, opaque other. That asymmetry is the whole game, and it only exists because each phone is running a different private meter at the same time.

## How it works

1. **Seeding (60s).** The TV shows three innocuous prompts ("what you say when the wifi drops"). All four phones answer all three simultaneously and privately. Those nine-ish short lines are your Voice Corpus. Nobody else ever reads it.
2. **Assignment.** Each phone privately receives one Target — a derangement, so nobody targets themselves. The TV shows nothing.
3. **Writing (90s).** One shared prompt appears on the TV. Everyone writes one sentence trying to sound like their Target.
4. **Privately on your phone while you type:** a five-segment **You-ness meter** — mean per-token surprisal of your draft under *your own* corpus prefix, minus its surprisal under a neutral prefix. Green means the model no longer recognises you. It never shows your Target's score, and it never names anyone.
5. **On the TV:** four anonymous sentences, then for each one a bar chart of Δbits under all four voice contexts. Lowest bar = the model's verdict on whose voice this is.
6. **Scoring.** +3 if the model's pick is your Target. −2 if the model picks you. A parallel human show-of-hands vote pays +1 per person you fooled, so a noisy model can't ruin the round.

## Technical approach

PartyKit Durable Object holds room state; phones are PWA clients. `Round { corpora{pid→string[]}, targets{pid→pid}, drafts{pid→string}, submissions[], scores{pid×pid→deltaBits} }`. Corpora and targets are never broadcast — the DO fans out per-socket payloads, which is the security boundary of the whole game.

The host tab owns one `transformers.js` causal LM (Qwen2.5-0.5B-class, WebGPU). Scoring a sentence *s* under player *p*: build prefix `"Things Dana says:\n- …\nDana says: "`, take mean token NLL of *s*, subtract NLL under a length-matched neutral prefix. Reveal needs 4×4 = 16 passes, batchable, ~2s.

The hard part is the live meters: four players type concurrently against one GPU-bound model. Drafts stream to the host over the DO, debounced 400ms; the host runs a **single-flight queue per player, dropping stale drafts**, caps total throughput around 2 scorings/sec, and quantises the result to five segments so jitter is invisible. Note the honest privacy wrinkle: your in-progress typing leaves your phone to be scored.

## v1 scope

- Exactly 4 players, one round, one seeding prompt (not three), one writing prompt
- Meter is 5 discrete segments, self-context only
- Reveal heatmap row-normalised so there is always a winner
- Model score only; human vote is a spoken show of hands, untracked

## Out of scope

Multiple rounds, corpus persistence between games, player-authored prompts, phone-side inference, 5+ players, any anti-cheat beyond "don't show your screen."

## Risks & unknowns

Biggest one: with a handful of seed lines, a 0.5B model may attribute near-randomly and topic will dominate style. Mitigations — everyone answers the same prompt, scores are z-scored per sentence, and the live meter lets players *learn* what the model reacts to, which converts a weak classifier into a learnable target. If it still reads as a coin flip, the human vote carries the round and the model becomes flavour, which is a downgrade worth knowing early. WebGPU availability on the host machine is a hard dependency.

## Done means

Four phones seed privately, each receives a different Target nobody else can see, all four meters move live and independently while everyone types, and the TV reveal produces a per-sentence attribution chart plus scores — with at least one playtest where a player visibly changes a word because the meter turned red.
