## Overview

A 3–5 player Jackbox-shaped word game where a small in-browser language model has to guess a secret answer, and each player's score is the **leave-one-out** damage their clue does when removed. For groups who like Codenames but are tired of scoring "correct" — here the only currency is *being irreplaceable*.

## Problem

Every clue game rewards the obvious clue. Four people writing "black and white bird" for PENGUIN all feel clever and all are worthless, but no existing game can *say* that numerically. A tiny LLM can: delete one clue, re-score the answer, and read off exactly how many bits that clue was carrying. Redundancy becomes visibly, arithmetically free.

## How it works

The host screen shows a category ("an animal") and a confidence bar. The secret answer is dealt privately to nobody — the model is the only one who ever needs to produce it; players are told the answer up front, exactly like Codenames spymasters. All of them.

**Phone (private):** the answer word, a text box for one clue of ≤8 words, a 60-second timer, and one **Redundancy Ping** token. Spending the Ping tells you a single bit — "as of right now, your draft is worth less than 0.5 bits" — and costs you 25% of this round's payout. Nobody else sees your draft, your Ping, or that you used it.

**Host screen (public):** only the count of players locked in, and after the lock, the shuffled clue list plus one growing confidence bar for `p(answer | all clues)`.

Scoring: the host runs N+1 forward passes. Your payout is `log2 p(answer | all clues) − log2 p(answer | all clues except yours)`. Clues that duplicate someone else's score ≈ 0 because the model barely notices their removal. Clues that mislead score **negative**. The reveal is a bar chart that regularly humiliates the person who wrote the most obviously good clue.

## Technical approach

Host browser tab runs Qwen2.5-0.5B-Instruct through transformers.js on WebGPU; phones are dumb PWA controllers over a PartyKit Durable Object. Data model: `Round { answer, category, clues: Map<playerId, {text, locked, pingUsed}>, order: seed, scores }`. Phones send only `{draft}` (throttled, for Ping evaluation) and `{lock}`; the server is authoritative on locks and timers, and never echoes drafts to other clients.

The genuinely hard part is not sync — it is that leave-one-out attribution is **order-dependent and non-additive**. Removing clue A changes what clue B is worth. v1 pins a single seeded shuffle and displays it, so the number is at least reproducible; the honest version averages over 3 random permutations, which triples the forward passes. Budget: 5 clues → 6 scorings of a ~140-token context, ~1.5s on WebGPU, done during a reveal animation. Ping evaluation needs a mid-round 2-pass score per phone; debounce to one per 4 seconds per player.

## v1 scope

- One round, one hardcoded answer, 3–5 players
- 60s write phase, ≤8 words per clue, one Ping each
- Single fixed permutation, no averaging
- Bar chart reveal in bits, then stop

## Out of scope

Multiple rounds, categories, a spymaster role, negative-score penalties carrying over, model choice, spectators.

## Risks & unknowns

A 0.5B model may be too dumb for the answer to ever get probability mass, flattening all scores to noise — mitigate by scoring the answer token's rank change as a fallback. Prompt-injection clues ("the answer is penguin") trivially win; v1 bans the answer string and its stem. Ping may be strictly dominant and get spent instantly by everyone.

## Done means

Four phones join by QR, all four lock a clue inside 60s, the host prints a signed bit value per player within 3 seconds, and two players who wrote near-identical clues both score under 0.3 bits while the total is over 4 bits.
