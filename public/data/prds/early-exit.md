## Overview

A 4-player concurrent-room game where the asymmetric information isn't dealt from a deck — it's read off the internals of a transformer. A small LM runs in the host tab; each phone is privately attached to a *different layer's* logit lens of the same prediction. For groups who like arguing from incomplete evidence, and for anyone who's ever wanted to feel what a neural net believes halfway up the stack.

## Problem

Every LLM party game treats the model as a single oracle: one number, shown to everyone, and the private state has to be bolted on with cards or secret words. But a language model is not one opinion — it's twelve progressively-less-wrong opinions stacked on top of each other. That's free, structural, per-player asymmetry that nobody has used as a game board.

## How it works

The host screen shows a sentence stem with a blank at the end, plus **8 candidate words in a shuffled row, with no probabilities**. That's all the public information there is.

Each phone privately shows one thing: a bar chart of those same 8 candidates, ranked and weighted by **that player's assigned layer** (layers 2, 4, 6, 8 of a 12-layer model). Layer 2's phone is a syntax savant and a semantic idiot — it loves any plausible part of speech. Layer 8's phone is nearly right but hedges. Crucially **nobody is given layer 12**, which is the ground truth for scoring. Every player is wrong in a characteristic, learnable way, and knowing *your own* failure mode is the skill.

30 seconds of open table talk — you may describe your bars, exaggerate them, or lie. Then all four phones privately lock one vote. Majority becomes the room's commit (ties go to the earliest-layer voter, which is deliciously bad). Reveal animates belief travelling up the stack: layer 2 → 4 → 6 → 8 → 12, bars sliding into place on the TV.

Scoring: **+3 to everyone** if the commit matches layer 12's top-1. **+2 to you** if the commit was your own lens's top-1 — so you're paid to advocate for your view. **−1 to you** if you voted for a token your own lens ranked below 4th — so bandwagoning onto a louder player is punished. Those two clauses together are the whole game: talk honestly enough to be believed, loudly enough to be followed.

## Technical approach

transformers.js with distilgpt2 in the host tab, `output_hidden_states: true`. For each intermediate residual stream h_l, apply the model's own `ln_f` then `lm_head` to get layer-l logits, gather only the 8 candidate ids, softmax with a per-layer temperature calibrated offline so early layers aren't flat mush.

Inference happens **only** on the host. A PartyKit Durable Object holds `{roomId, stemId, candidates[8], layerAssignment: {playerId → layer}, votes, phase}` and pushes each phone *only* its own 8 probabilities — the server never sends a phone another player's array, so a screenshot leaks one lens, not the game.

The genuinely hard part is not sync (four phones, one barrier, trivial). It's **stem curation**: most stems produce four near-identical lenses and the game evaporates. Offline, score a bank of 40 stems by Jensen-Shannon divergence between layer views and keep only ones where at least two layers disagree on top-1.

## v1 scope

- One round, one curated stem, exactly 4 phones
- Fixed layer assignment (2/4/6/8), shown to the player as "you are Lens B"
- 8 candidates, 30s talk timer, one private vote each
- Host runs the model; no persistence, no lobby, no reconnect

## Out of scope

Multiple rounds, larger models, phone-side inference, teams, attention-head views, spectators, score history.

## Risks & unknowns

distilgpt2's early layers may be near-uniform over the 8 candidates — mitigated by curation plus per-layer temperature. ~120MB model download on the host. Biggest unknown is legibility: players must grasp "your view is a dumber version of the truth" in 15 seconds, which needs a wordless onboarding animation, not a paragraph.

## Done means

Four phones display four visibly different bar charts for the same blank; the room talks, votes privately, and commits; the TV animates the layer-by-layer climb to the true distribution and awards the three scoring clauses correctly; and across the curated stem bank, ≥70% of stems have at least two layers disagreeing on top-1.
