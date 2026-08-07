## Overview

A one-round writing game where the thing you're impersonating isn't a person or a style — it's a number. Each phone is privately dealt a target surprisal band (ICE / TEPID / SCALDING). Everyone writes one sentence continuing a shared story opening. A tiny local LLM measures each sentence's mean nats-per-token, and you score for landing in your band. For word-game groups who enjoy a rule nobody has an existing instinct for.

## Problem

Everyone thinks they know what "surprising writing" means, and everyone is wrong. Rare words score lower than you'd think when they're grammatically inevitable; a plain word in a wrong slot detonates the meter. There's no party game that puts that gap on a TV and makes people bet on it.

## How it works

**Deal.** TV shows the opening: "By the third day, the museum guard had started to". Each phone privately shows one band with explicit edges ("TEPID — 2.6 to 3.6 nats/token"). Bands are distinct per player.

**Write (75s).** Each phone has a text box and **two taste tests**: submit a draft, get its measured heat back privately in under two seconds, keep editing. The TV publicly shows how many taste tests each player has burned — spending both is a visible tell that you were flailing, which becomes evidence in the guess phase. This is the whole reason the phones must be private and simultaneous: the private meter is the training wheel, and the public counter is the tax on using it.

**Reveal.** TV shows all four sentences, anonymised, in random order — no heat bars yet.

**Guess (45s).** Each phone privately drags the four sentences coldest-to-hottest and names who wrote the one they ranked hottest.

**Score.** Heat bars fill in on the TV. +3 for landing inside your own band. +1 for every opponent who misplaced your sentence in their ordering. The reliable laugh is the sentence everyone ranked hottest measuring cold.

## Technical approach

Host browser tab runs transformers.js (gpt2-medium or Qwen2.5-0.5B) on WebGPU. Scoring = teacher-forced pass over `opening + sentence`, mean surprisal over the sentence's tokens only, first token dropped, trailing punctuation stripped. Band edges are hard-coded quantiles from pre-scoring a 200-sentence corpus offline.

Socket.IO server (or a PartyKit room) holds `{phase, opening, players:[{id,name,band,tasteTestsUsed,draft,locked}], guesses:{}}`. Phases DEAL → WRITE → REVEAL → GUESS → SCORE, host-driven, server-authoritative clock.

Sync is easy here; the hard part is the inference queue. Up to eight taste-test requests plus four final scorings hit one GPU inside 75 seconds. Serialize them in a FIFO on the host with a per-call 2s budget, show "measuring…" on the requesting phone, and never let a taste test block the phase timer.

## v1 scope

- 4 players, one round, one hard-coded opening
- Three bands (one duplicated for the fourth player)
- Two taste tests each, public counter
- Ordering guess only — the who-wrote-it guess is a single tap on the hottest
- Final scoreboard, then stop

## Out of scope

Multiple rounds, opening deck, per-group band recalibration, model choice, rejoin-after-refresh, any persistence.

## Risks & unknowns

Bands may feel arbitrary if quantisation shifts surprisal — needs a real calibration pass before playtest. Steering perplexity on purpose may be too hard without more than two taste tests. Seventy-five seconds of four people typing silently is a dead room; may need the TV to show live keystroke counts as ambient motion.

## Done means

Four phones each show a distinct band; a taste test returns nats-per-token in under two seconds and increments a counter visible on the TV; after the guess phase the TV renders four heat bars against band edges and a scoreboard that awards both band hits and misreads.
