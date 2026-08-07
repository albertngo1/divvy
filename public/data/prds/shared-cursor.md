## Overview

A 90-second real-time tug-of-war over a single sentence. The TV shows one shared text buffer; all four phones can edit it simultaneously. Each player has been dealt a secret four-word target phrase, and their phone shows a live private gauge of how *cheap* that phrase has become as a continuation of whatever the buffer currently says. For groups who like chaotic co-op that turns knife-fight in the last ten seconds.

## Problem

Collaborative writing games are turn-based and polite — you wait, you type, you wait. Nothing in a party game currently lets four people fight over the same cursor with a live, objective readout of who's winning. And "steer the language model" games all measure the model's output; none measure the *shape of the prompt* as it's being mangled in real time.

## How it works

Host tab seeds the buffer with a stem ("The landlord finally admitted that"). Every phone is dealt a distinct target from a deck of hand-written four-word phrases ("the raccoon has tenure").

Every 300ms the host runs one teacher-forced pass per player: the surprisal of target T_i conditioned on the current buffer. Player i's phone — and only theirs — shows that as a warmth dial plus a delta arrow ("someone just made you 8% colder"). The TV shows the live buffer, the four *anonymous* unlabelled needles on a shared scale, and the clock. So the room can see somebody is one word from winning; nobody knows who or what.

Each phone has a 400ms keystroke budget — one insert or delete op per tick — so edits are legible rather than a mash. Deletes are capped at three characters per op. The buffer hard-caps at 140 chars, which means late game is pure deletion warfare.

Win: first target to sit below its threshold (55% of its surprisal under the bare stem) for two continuous seconds. On lock, the TV reveals all four targets — the payoff is the three sentences that never happened.

## Technical approach

transformers.js + WebGPU on the host (Qwen2.5-0.5B, wasm fallback); phones are dumb PWA views. Cloudflare Durable Object per room holds the authoritative buffer.

Data model: `{version, text, players:[{id,target,threshold,lastOpTick}], deadline}`. Phones send `{op, pos, text, baseVersion}`; the DO applies operational transform against ops committed since `baseVersion` (single-line string OT is tractable) and broadcasts `{version, patch}`. Host is a subscriber that additionally pushes `{playerId, surprisal}` messages routed privately.

Hard part: OT plus the scoring loop racing each other. Scores must be stamped with the buffer version they were computed against, and a phone must discard a gauge update older than its rendered version, or the dial lies during heavy editing.

## v1 scope

- 4 players, one host, one 90s round
- One hard-coded stem, deck of 24 targets
- Insert/delete at cursor only; no selection, no undo
- Warmth dial + delta arrow; no numbers shown
- Reveal screen, then stop — no cross-round scoring

## Out of scope

Multiple rounds, custom stems, spectators, mobile host, phone-side inference, rematch lobby, any persistence.

## Risks & unknowns

Four forward passes per 300ms may not hold on an integrated GPU — fall back to 600ms and batch the four targets into one padded pass. Griefing (one player nukes the buffer every tick) is bounded by the op budget but untested socially. Threshold calibration may make some targets unwinnable.

## Done means

Four phones + one host: any keystroke visibly moves all four private dials within 600ms; all clients render byte-identical buffer text at round end; a target locks, the TV reveals all four, and the round stops cleanly.
