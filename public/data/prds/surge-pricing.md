## Overview

A live, no-turns word game for 3–5 players in one room. The host screen shows a single sentence being built in public and a big draining **BIT BUDGET**. Each phone privately holds one word the player *must* get into that sentence, and a private price ticker that says what that word costs *right now*. The price is literally `-log2 P(word | sentence-so-far)` from a small in-browser LM. You are waiting for your dip.

## Problem

LLM party games are almost all turn-based: write, wait, get judged, laugh, repeat. The model shows up at the end as a scorekeeper. Nothing about it feels *live*, and nothing makes two players in the same room read the same screen differently. Perplexity is a real-time quantity; nobody has used it as a market.

## How it works

The host seeds a sentence: *"The night before the wedding,"* and a budget of 60 bits. Each phone is privately dealt one word (single-token, e.g. *lobster*, *paperwork*, *dad*, *fire*). Nobody knows anyone else's word.

**Host screen (public):** the sentence so far, the remaining budget, the last price paid and by whom, and a row of player lamps showing only *placed / still holding*.

**Each phone (private):** your word, its current price in bits, a sparkline of how that price has moved as the sentence grew, and one giant PLACE button.

It's a free-for-all in continuous time. Any player may tap PLACE at any moment; the server serializes, appends the word, deducts its price, and immediately re-quotes everyone. Your tap is a **market order, not a limit order** — if someone lands a word 80ms before you, you pay the *new* price, which may have doubled. Steering matters: placing *"lobster"* makes someone's *"dinner"* cheap and someone's *"paperwork"* ruinous, and you can't see whose.

Round ends when the budget hits zero or everyone has placed. Placed players score `100 − bits paid`; anyone still holding scores zero. The host then reads the finished sentence aloud, which is usually a disaster.

## Technical approach

One authoritative WS server (PartyKit / Durable Object). The **host browser tab is the sole pricing oracle** — it runs distilgpt2 via transformers.js/WebGPU. Phones run no model at all; that avoids cross-device quantization drift and arguments about scores.

Data model: `Room { sentence: tokenId[], budgetBits, players: {id, wordTokenId, placed, bitsPaid} }`. Because every dealt word is a **single GPT-2 token with a leading space**, one forward pass over the shared sentence produces one next-token distribution that prices *all* players simultaneously — read each player's logit out of the same softmax. With a KV cache over the sentence prefix, each append is one incremental pass (~15ms) and one fan-out of private `price` messages.

Hard part: fairness under simultaneity. Appends must be totally ordered by the server, prices must be stamped with a sequence number, and a phone's PLACE carries the seq it saw so the server can tell the player "you paid 11, not the 4 you were looking at." Perceived unfairness here kills the game, so the burn must be *legible*.

## v1 scope

- One round, one hard-coded seed sentence, one 60-bit budget
- 3–5 players, one deck of ~60 single-token words
- Host tab = model + display; phones = word, price, one button
- Score screen: final sentence, bits paid, who choked

## Out of scope

- Limit orders ("place only if ≤ 6 bits"), multi-token words, multiple rounds, undo, custom decks, reconnects.

## Risks & unknowns

- Prices may be too flat to create dips — needs a temperature/exponent tuning pass on real sentences.
- WebGPU model load time on the host (~5s cold) must be hidden behind the join screen.
- Single-token vocabulary is genuinely restrictive and may read as random noise rather than comedy.

## Done means

Five phones on a LAN, one TV. Every player sees their own price move within 200ms of any append, no two players ever see contradictory sentence state, and a full round completes with at least one player visibly waiting for a dip that never comes.
