## Overview

Toss-Up is a 4-player, two-phase, one-round writing duel scored by next-token **entropy**. You win by authoring a fragment where a small language model is genuinely at a coin flip about what comes next — and where the humans in the room are *not*. Model uncertainty pays; human agreement bills you. For word-game groups who are bored of "be funny" prompts.

## Problem

Every perplexity party game so far is a race to one extreme: lowest score wins, or highest score wins. That's a single scalar and it goes stale in two rounds. The interesting territory is the *gap* between what the model doesn't know and what a room of people obviously does — a place where you're optimizing against two different predictors at once, in opposite directions.

## How it works

**Phase 1 — Author (60s, all phones at once).** The TV shows one theme card ("a stranger walks in"). Each phone privately writes an 8–14 word fragment that stops right before a content word. Two live private meters, updated on every keystroke from the host model:

- **FLUENCY** — the fragment's own perplexity, which must stay under ~120 or the submit button stays dead. Gibberish traps are illegal.
- **SPREAD** — the entropy, in bits, of the next-token distribution after your fragment, restricted to content-word tokens.

This meter-tuning is the whole first act, and it only works if everyone has their own private meter running simultaneously.

**Phase 2 — Fill (45s).** All fragments appear on the TV, anonymized and numbered. Each phone privately writes **one** next word for every fragment except its own. Blind, simultaneous, no take-backs.

**Reveal.** For each fragment: author scores **+SPREAD bits**, then **−2 bits per colliding pair** of fillers who submitted the same stemmed word. A fragment the model found wide open but three humans all completed with "door" is a disaster. Fillers score +1 for a word nobody else picked that still lands in the model's top-10 — the sneaky-but-natural find.

**Private per phone:** your fragment while drafting, your meters, your fills. **Public on TV:** theme card, submission dots, then the anonymized fragments, entropy bars, and collision explosions.

## Technical approach

Socket.IO over Tailscale Serve, or a PartyKit room. `Room {phase, theme, fragments: Map<pid,{text, spread, fluency}>, fills: Map<pid, Map<fragId, word>>}`. The host tab owns the only model instance (distilgpt2, transformers.js).

The hard part is the **live scoring channel**: four phones typing means bursty forward-pass requests against one host model. Needs a per-player debounce (~250ms), a single-flight queue keyed by player, last-write-wins cancellation of stale requests, and a server that treats the host's returned score as authoritative — phones never compute or trust a local number. Second hard part: fills must be sealed server-side until every phone submits or the timer expires, since one leaked fill destroys the collision mechanic.

## v1 scope

- 4 players exactly, one theme card, one round
- distilgpt2 on host; ~30 content-token top-k for the entropy figure
- Function-word stoplist blocking fragments ending in "the/and/a/of"
- Naive stemming (lowercase + strip trailing s/ed/ing) for collisions
- One results screen, no persistence, no rematch

## Out of scope

Multiple rounds, 5+ players, custom themes, WebGPU, audio, spectators, any cross-session score history.

## Risks & unknowns

A weak model may report high entropy nearly everywhere, flattening the author score — SPREAD likely needs normalizing against a per-theme baseline. Degenerate fragments that end on a comma or clause boundary could farm entropy; the stoplist may not be enough. And with only 3 fillers per fragment, collision counts are noisy — 4 players may be the true floor, not 3.

## Done means

Four phones join, each drafts with a live private FLUENCY/SPREAD readout, the submit gate actually blocks a sub-fluency fragment, all fills stay hidden until reveal, and the results screen shows at least one real human collision penalty knocking a high-entropy fragment out of first place.
