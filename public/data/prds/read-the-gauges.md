## Overview

A 4-player, 15-minute talking game for the kind of group that enjoys arguing from incomplete evidence. The TV runs a tiny language model on one sentence prefix; the resulting next-token distribution is never shown to anyone. Instead each phone gets a single summary statistic of it, and the room has to talk its way to one answer.

## Problem

"The model is confident" is four different claims — low entropy, high top-1, a narrow nucleus, a big rank-1-to-rank-2 margin — and they routinely disagree with each other. Every existing entropy game shows the room one number and asks who can move it. This is the first one where the room has to *reconstruct* the number, and where being loud about your instrument is the whole social layer.

## How it works

The TV shows a sentence prefix and three candidate next words, sampled from rank 1, rank ~5, and rank ~40 so they're all plausible in print.

Each phone privately holds:
- **One gauge**, with a plain-English legend and today's value: *"How many different words share the model's top 90% of belief right now: 41."* The four gauges are entropy in bits, top-1 probability, nucleus size at p=0.9, and the rank-1-vs-rank-2 margin.
- **One side-bet card** naming one of the three candidates. It pays if the room LOCKS that candidate — right or wrong.
- Your vote.

The TV shows the prefix, the three candidates, the *names* of the four gauges in play (never their values), and a 90-second clock. Players talk out loud. At lock, votes are simultaneous and the majority is the room's answer.

Scoring: +2 to everyone if the room's majority is correct. +3 to a player whose side-bet candidate was locked, correct or not. So roughly half the time your side bet fights your gauge, and the only move is to describe your own instrument creatively while the other three try to hear the strain. Then the TV reveals the real distribution as a bar chart and every gauge value at once, and it is usually obvious in hindsight who was shading.

## Technical approach

Host tab runs Qwen2.5-0.5B-Instruct or distilgpt2 via transformers.js; one forward pass per round, logits → the four derived scalars. A PartyKit Durable Object holds `Room{code, phase, prefix, candidates[3], truth (server-only), assignments:{playerId:{gauge, value}}, sideBets, votes}` and is authoritative — the raw distribution never leaves the server, or one phone just computes every gauge itself.

Sync is trivially easy (turn-based, seconds of slack). The hard part is **round construction**: a badly chosen candidate triple lets one gauge separate all three cleanly, and that player simply knows the answer and the conversation dies. Fix with rejection sampling at round-build time — generate a triple, simulate each gauge's discriminative power, and reject any triple where any single gauge is decisive. That loop has to run on the host before the round is dealt, which means it may need several forward passes and a visible "dealing" beat.

## v1 scope

- 1 round, exactly 4 players, 3 candidates, 4 fixed gauges
- One hand-picked prefix with a pre-verified candidate triple (no live rejection sampling in v1 — bake it)
- 90-second timer, simultaneous vote, majority wins, ties resolve to rank-1 candidate
- Reveal screen: true bar chart + all four gauge values + who held which side bet

## Out of scope

Multiple rounds, running scores, prefix packs, live rejection sampling, model selection, mobile host, spectators, animation.

## Risks & unknowns

The gauges may be too abstract to argue about — mitigated by writing each legend as a sentence, not a symbol, and never using the word "entropy" on a phone. Nucleus size and entropy may correlate so tightly that two players are effectively duplicates. A 4-player majority can tie; the tiebreak is arbitrary and may feel cheap. Biggest unknown: whether the side bet produces bluffing or just makes one player go quiet.

## Done means

Four phones each show a different number and legend off one hidden distribution; the room argues for 90 seconds; the reveal screen puts the true bar chart next to all four gauges; and in playtest, at least one player is caught having talked down their own gauge to protect a side bet, by another player, out loud, before the reveal.
