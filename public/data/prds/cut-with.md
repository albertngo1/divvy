## Overview

A four-player table game about trusting your own instrument. One sentence prefix, four secret builds of the same tiny language model — fp32, int8, int4, and a deliberately butchered 3-bit — one per seat. You never learn which one you got. You argue, then you bet on which seat holds the honest copy, and your bet size is not your choice.

## Problem

Quantized models don't get humbler as they degrade — they get *sharper*. Logits collapse, entropy drops, and the broken copy states its wrong answer with more certainty than the good one. That inversion is a ready-made social-deduction engine and no party game has used it. The itch: a betting game where confidence is the trap, mechanically, not just rhetorically.

## How it works

TV shows one prefix: *"After the fire, the insurance adjuster refused to"*. Each phone privately shows its build's top-3 next words and a single confidence bar (your entropy, drawn as a bar, never a number). No numbers cross the room — the only channel is your mouth.

TALK (120s): read your words aloud, or lie about them, and try to work out whose copy is adulterated. BET (20s): each phone bets on which *seat* holds fp32. The bet slider is clamped by your own entropy — a low-entropy bar forces a near-maximum wager. The 3-bit player, bar nearly full, is compelled to shove on a read built from garbage. Simultaneous lock.

REVEAL: TV overlays all four distributions, highlights the true fp32 top-1, and flips each seat's bit depth face-up. Correct big bet pays big; wrong big bet loses big; a side bonus if you correctly named your *own* build.

## Technical approach

PartyKit room, host-driven phase machine: DEAL → TALK → BET → REVEAL. `Room {prefixId, phase, seats{playerId, build, entropy, top3, bet, betCap}}`. The server assigns builds, computes `betCap = f(entropy)`, rejects bets under cap, and never ships a seat's build to any client until reveal.

v1 does **zero live inference**. An offline node script runs the four builds (fake-quantize: round weights to a grid, dequantize) over candidate prefixes and emits a JSON blob of top-8 tokens, probabilities, and entropy per build per prefix. The host tab just reads JSON — no 500MB of sessions in a browser tab.

The genuinely hard part is therefore not sync but *prefix curation*: most prefixes are quantization-robust, all four builds agree, and the round is dead. The script must rank prefixes by JS divergence between fp32 and 3-bit **and** by entropy inversion (3-bit entropy below fp32 entropy while top-1 differs). Expect roughly one qualifying prefix in thirty.

## v1 scope

- Exactly 4 players, one round, one prefix chosen by the host from 5 shipped ones
- Precomputed JSON distributions, no in-browser model
- Integer chips, no bankroll across rounds
- Text-table reveal, no animation

## Out of scope

Live in-browser quantization, more than four builds, multi-round bankroll, reconnect, spectators, variable player counts.

## Risks & unknowns

At 135M the entropy inversion may be too weak to feel — validate with the offline script before any UI exists; if it's flat, escalate to 2-bit or per-channel damage. "Your bar sets your bet" needs to land in one sentence of on-screen copy or the whole trap is invisible. Hard four-player requirement is rigid for a party.

## Done means

Four phones show four visibly different word triples for the same sentence; the 3-bit seat's confidence bar is measurably fuller than fp32's; all four bets lock inside 20s; and the reveal shows at least one player who was forced into a maximum bet on a read that was wrong.
