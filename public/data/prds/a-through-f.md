## Overview

A 4-player, 10-minute tug-of-war over a single sentence, for groups who like word games but are bored of "be funny." One laptop drives the TV and runs a tiny language model; four phones are private stakeholders in that model's next-token distribution. Every phone sees a different number for the same shared sentence, continuously.

## Problem

Every LLM party game collapses the model to one public number that means the same thing to everyone — perplexity, good or bad. But the model's actual output is a distribution over 50,000 words, and that distribution has *regions*. Nobody has made those regions into property. Also: most "secret goal" games have goals you could print on a card. Here your goal is a live meter you have to learn to read.

## How it works

Before the round, the tokenizer's vocabulary is sorted by unigram frequency and cut into four contiguous bands. Each phone is secretly dealt one band and shown twelve sample words from it — Shelf 1 sees `the, of, and, to, in`; Shelf 4 sees `marzipan, tungsten, kerosene, notwithstanding`.

The TV shows a fixed opening ("The last thing anyone expected was"). Players take turns typing one word on their phone; it appears on the TV the instant it is submitted. After each word, the host recomputes the next-token distribution and credits the player who just typed with the probability mass sitting in their own band — **you are paid for the hole you leave, not the word you played.** Handing the room a slot that only exotic words fit is how Shelf 4 farms; Shelf 1 farms mid-clause grammar.

PRIVATE on each phone: your band, its sample words, your live percentage, your running score, and your own sparkline. PUBLIC on the TV: the growing sentence, a 15-second shot clock, and four unlabeled bars showing all four masses — so the room can see somebody is farming hard and has to guess who, and starve them.

## Technical approach

Host tab runs distilgpt2 (82M) via transformers.js — one forward pass per submitted word, ~200-300ms on a laptop with WASM, WebGPU if available. Band boundaries come from a static frequency table shipped as JSON, stored as index ranges into a rank-ordered permutation of token IDs; mass-per-band is one masked sum over the softmax.

PartyKit Durable Object is authoritative: `Room{code, phase, sentence: string[], turnIdx, players:[{id, bandIdx, score}], history:[{word, masses[4]}]}`. The host posts computed `masses[4]` to the DO; the DO — not the host — fans out, sending each phone only its own band's value and broadcasting the unlabeled four to the TV. Doing it the other way lets any phone sniff the host broadcast and reconstruct the whole board.

The genuinely hard part isn't sync (turn-based, one message per word) — it's **balance**. distilgpt2's mass is dominated by common tokens in almost every position, so Shelf 4 would lose every game. Fix: calibrate offline over 200 sample sentences, compute each band's expected share, and score as a ratio to expectation rather than raw mass.

## v1 scope

- Exactly 4 players, one room, one 12-word sentence
- One hardcoded opening prompt
- Four bands from a static frequency file, dealt randomly
- Type-a-word turns with a 15s shot clock; no validation beyond "one word, a-z"
- Score credited on the post-word distribution; reveal shelves at the end

## Out of scope

Variable player counts, multiple rounds, rematch, band re-draw, chat, model selection, phones running inference, persistence, accounts, spectators.

## Risks & unknowns

Calibration may still leave one shelf dominant. Multi-token typed words make "which mass" ambiguous — sidestepped by scoring the position, not the word. Host cold-start is 30-60s on first model load. Untested: whether players can actually *feel* what feeds their shelf within 12 words, or whether it reads as noise.

## Done means

Four phones show four different live percentages off one sentence on one TV; a player deliberately types a word that leaves a slot nobody else can profit from; and at the reveal, at least one player correctly names who held the rare shelf, from the bars alone.
