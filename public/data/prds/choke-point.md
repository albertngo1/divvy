## Overview

A cooperative rendezvous game for 3–5 players, ~8 minutes. Everyone walks a different path through the same 0.5B model's token-continuation tree, blind to each other's words, and must all arrive at the same node. The terrain is entropy: where the model is uncertain the corridor is wide, where it has one legal continuation it is a choke point.

## Problem

Every LLM party game so far treats the model as a judge — write something, get scored. The model is never a *place*. Meanwhile co-op games run out of shared reference and degenerate into shouting the answer. This gives a room a map that nobody can read literally and everybody can read structurally.

## How it works

Seed sentence on the TV for five seconds ("The night shift supervisor opened the"), then the text vanishes from the shared screen forever.

**Each phone shows, privately:** its own accumulated path text, four candidate next tokens with probability bars, and its node's branching entropy rendered as *doors* (H bucketed 1–7).

**The host screen shows:** an anonymized overhead corridor map. One unlabeled dot per player, depth = step count, corridor width = that player's current entropy. No word ever appears on the TV.

Eight steps. Each step every phone picks one of its four candidates simultaneously on a 12-second timer; paths diverge immediately. Table talk is mandatory, under the **Gag Rule**: you may not say aloud any word currently visible on your own screen. So you negotiate in paraphrase and terrain — "I'm at a choke point, two doors, one of them is a person."

Win if all paths are identical after step 8. Partial credit = size of the largest cluster × bits crossed. The discovery that makes it a game: choke points (H < 0.4 bits) are the only reliable Schelling points, so the room learns to steer *into* the model's clichés on purpose.

## Technical approach

The host tab is the single inference authority — Qwen2.5-0.5B-Instruct q4 via transformers.js on WebGPU. Phones run no model; they are dumb views over broadcast state.

Data model: `Room { seed, step, nodes: Map<pathHash, {tokens, top4, H}>, players: {id, pathHash, submitted} }`, held in a PartyKit Durable Object. Phones send `{playerId, step, choiceIndex}`; the server buffers until all arrive or the timer fires (default = highest-probability token), asks the host tab over the same socket to expand any unseen path, then unicasts each player only its own node payload and broadcasts the anonymized map.

Hard part: expansion latency — up to 5 distinct paths × 4 children per step. Batch them as one padded forward pass and speculatively expand the next ply during the 12-second talk window so reveals feel instant. Second hard part: the Gag Rule is unenforceable in software; v1 makes it purely social.

## v1 scope

- 4 players, one round, 8 steps, one hand-picked seed sentence
- Top-4 candidates sampled from top-20, no re-rolls, no undo
- Host tab runs the model; phones join by QR to a plain web page, no PWA install
- Map = four unlabeled dots in a width-varying corridor
- One win/lose card at the end, no scoring history

## Out of scope

Persistent lobbies, multiple rounds, model selection, on-phone inference, speech recognition to police the Gag Rule, spectators, mobile host.

## Risks & unknowns

- A 0.5B model's top-4 may be too samey, collapsing all paths to identical and trivializing the win. Mitigate with temperature-scaled sampling from top-20.
- Entropy may not vary enough to make legible terrain; bucket H by empirical quantiles measured offline on a corpus, not by absolute bits.
- The Gag Rule could make people go silent rather than inventive.

## Done means

Four phones and a TV, one 8-step round: each phone shows only its own path, the TV never renders a word, all four submissions resolve in under 1.5 s per step, and a playtest room reaches at least a 3-player cluster while a stranger watching only the TV cannot state a single word of the text.
