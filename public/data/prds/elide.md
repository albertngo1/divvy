## Overview

Elide is a 3-6 player concurrent-room party game where a small in-browser language model acts as a **decompressor**, and Shannon information is literally the currency. Host TV shows one sentence; every phone privately guts it. For groups who like Codenames-adjacent "what will they infer?" tension but want the guesser to be a machine with a measurable opinion.

## Problem

Every perplexity game so far asks players to *write* something the model likes. Nobody has made players reason about the model as a **channel** — what can be thrown away and still recovered. That question is the actual heart of information theory, and it's a great party read: everyone at the table has an intuition about which word is guessable, and they're all wrong in interesting ways.

## How it works

The host screen displays one 18-22 word sentence, e.g. *"The night before the wedding my brother reversed the rental van into the fountain outside the hotel."*

Every phone shows the same sentence as tappable word chips. Simultaneously and privately (60s), each player taps words to **redact** them into blanks. Your redaction mask is yours alone; the host shows only a per-player *count* of blanks, so the room can see who's being greedy without seeing what they cut.

Each phone gets **3 PEEKs** per round. A peek sends your current mask to the host model and returns, privately to you, the model's restoration of *your* blanks only. Peeks are the scarce resource — you must mostly guess what the machine can guess.

At lock-in the host restores every mask greedily (distilgpt2 argmax, left-to-right, one word per blank) and scores:

- **+ the surprisal (bits) of each word restored correctly**
- **− the surprisal (bits) of each word restored wrong**

This is the whole design in one line: deleting "the" earns you ~0.4 bits, deleting "fountain" earns ~11 — if the model can still get there. You are hunting rare words that context makes inevitable.

Reveal: host animates each player's swiss-cheese sentence, types the model's restoration in, green/red per blank, bits ticking up.

## Technical approach

Cloudflare Durable Object (or PartyKit) room; host browser tab runs transformers.js/distilgpt2 (WASM, WebGPU when available) and is the only inference node. State: `{sentence, tokens[], baselineSurprisal[], players: {id, name, mask:Set<idx>, peeksLeft, score}}`. Masks stay server-side-private; only blank counts broadcast.

The genuinely hard part: one single-threaded model multiplexing N private peek jobs plus N final restorations, with cancellation, fairness, and **determinism** — a peek and the final score must produce byte-identical fills, so both go through the same greedy path with the same tokenizer normalization. Peek rationing is what keeps the queue bounded; it's a game rule doing double duty as backpressure.

## v1 scope

- 3-5 players, ONE round, one sentence drawn from 10 hardcoded ones
- 60s redaction timer, 3 peeks, single-word blanks only
- Greedy argmax fill, exact lowercase match
- Host tab does all inference; no reconnect, no avatars, no persistence

## Out of scope

Multi-word blanks, synonym/lemma credit, sampling, phone-local models, custom sentence submission, multi-round scoring, spectator mode.

## Risks & unknowns

Restoration may be too weak on a 82M model, flattening scores near zero — mitigate by curating sentences with high mutual information. Exact match is harsh and may feel unfair; watch whether one "obvious" strategy dominates. Inference latency on older host laptops.

## Done means

Three phones plus a host on one LAN: all players redact privately, peeks return only their own blanks and run out, host restores and scores in bits, the reveal animates green/red, a winner is named — whole round under three minutes.
