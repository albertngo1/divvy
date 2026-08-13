## Overview

A three-round silent co-op for exactly three players. Each round, every phone privately distributes 6 chips across the same 5 icon boxes and locks. The TV reveals only the **elementwise minimum** of the three allocations — the portion everyone independently agreed on — plus the residual. Chips that reach the minimum are cemented for all players. The room is scored on how high the water gets.

## Problem

Convergence games usually publish a similarity score, which is a single blurry number you can only grope toward. The elementwise min is a much better public signal: it is *specific* (it says which boxes you agree on and by how much), it is *anonymous* (it never implicates anyone), and it is *conservative* (it can only understate agreement). Nobody has built a party game around it, and it turns out to produce exactly the right silent-negotiation shape — early rounds establish the obvious commons, the last round is a pure Schelling fight over two leftover chips.

## How it works

**Phone (private):** five boxes with + / − taps, your remaining chip pile, a LOCK button. Cemented chips appear dimmed and immovable. Nobody ever sees anyone else's board, at any point, ever.

**TV (shared):** the five boxes as columns; the min-vector drawn as a settled water line of solid chips; a big RESIDUAL number (6 − sum of min) meaning "chips still in dispute"; and three lock lamps. It never shows an individual allocation, not even after the game.

Round flow: all three lock (irrevocable) → server computes the min → the water line rises on the TV with an audible settle → those chips cement on every phone → next round, each player redistributes only their free chips. Three rounds, then a final score of sum(min) out of 6.

The cement rule is what makes it feel like something crystallizing: agreement is monotone, so the game visibly narrows from five contested boxes to one, and the last decision is the tense one.

## Technical approach

PartyKit Durable Object per room; host tab plus three phone PWAs.

Data model: `Room { code, round, boxes[5], cemented[5], players[{ id, alloc[5], locked }] }`. Server-side invariants: `sum(alloc) == 6`, `alloc[j] >= cemented[j]`. On the third lock, compute `min_j = min over players of alloc_j`, set `cemented = min`, broadcast `cemented` and residual only.

Sync is easy here — commitments are discrete and turn-based, no tick loop. The genuinely hard part is **information hygiene around locking**: allocations must live only in the DO and only be compared after the last lock, so an early crash or a reconnect payload can't leak a vector. The reconnect path is where this kind of game actually leaks, so v1 simply has no reconnect. Second subtlety: the lock lamps tell a late locker *that* others are done, which is harmless (they learn nothing about content) but must be verified as harmless rather than assumed.

## v1 scope

- Exactly 3 players, 5 boxes, 6 chips, 3 rounds, one room.
- Host: boxes, water line, residual, lock lamps, final score.
- Phone: +/− allocation and LOCK.
- Fixed neutral icon set (bell, key, moon, fish, gate) — evocative but not ranked.

## Out of scope

Variable player counts, chip weights, private per-player payoffs, timers, multiple games, chat, emotes, any reveal of individual boards.

## Risks & unknowns

- Round one may land near-zero for a room with no shared instinct, which feels like a failure rather than a start; a warm-up round with 2 chips might be needed.
- The min can stall at 4/6 forever with a stubborn split, and three rounds may be too few or too many.
- Whether wordless play holds, or whether people just point at the TV — pointing may be fine, or may be the thing to ban out loud.

## Done means

Three phones join by code; each locks a valid 6-chip allocation; the TV reveals the correct elementwise min and residual and nothing else; cemented chips are immovable on all three phones next round; and a full three-round game plays end to end producing both a 6/6 outcome and a stalled 4/6 outcome in testing.
