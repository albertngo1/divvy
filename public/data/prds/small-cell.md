## Overview

A 4-player, ~10-minute cooperative privacy game for a shared TV plus private phones. The room answers a few personal questions truthfully, then collectively *coarsens* those answers until no answer stands alone. The output isn't a score: it's a printed card — the most specific true description of this room in which no individual is identifiable. Statisticians call the failure case a "small cell," and suppressing it is the whole game.

## Problem

Icebreaker games reward exposure: the funniest, most specific answer wins and the shy player loses twice. And keepsake games usually just collect answers and print them. Small Cell inverts both — specificity is valuable but dangerous, and hiding is a shared engineering problem, not a refusal to play.

## How it works

The TV shows three prompts (e.g. "a place you slept badly", "a job you've had", "something in your fridge right now"). Each phone **privately**: type your true answer. The server maps it onto a 4-rung generalization ladder built for *your* answer — "a friend's futon" → "someone's couch" → "not a bed" → "somewhere". Your phone shows only your own ladder as a 4-position slider.

The **TV** shows, per prompt, the current buckets as anonymous chips with counts ("not a bed ×2", "a hotel ×1"), singletons pulsing red, plus one shared SPECIFICITY number = Σ(3 − rung) across players. Your phone additionally shows one private lamp: ALONE or WITH SOMEONE.

The room talks out loud but may not speak an exact rung-0 answer. To merge you must find a rung where you and someone else produce the *same label* — which means describing your answer without saying it, while the other person climbs to meet you. Climbing is cheap for hiding and expensive for the keepsake, so the room wants the smallest total climb that kills every singleton.

Win: zero singletons in all three prompts. The TV then renders a printable card — bucket labels and counts only, no names — and pushes a PNG to every phone.

## Technical approach

PartyKit Durable Object per room; phone PWA clients over WebSocket. State: `{players[], prompts[], answers: {playerId: {promptId: {raw, ladder[4], rung}}}}`. **`raw` and `ladder` are never broadcast** — the server computes buckets from `ladder[rung]` and broadcasts only `{label, count}[]`, plus a unicast `alone: bool` per player. Slider release sends `{promptId, rung}`; the server recomputes and fans out at ≤10 Hz.

The genuinely hard part isn't sync — it's *label collision*. "Tokyo" and "Osaka" must produce the identical string at rung 2 or merging is impossible. v1 dodges this entirely: hand-authored per-prompt taxonomies (a fixed enum per rung), with rung 0 the only free text. v2 uses one LLM call per answer constrained to that enum, with embedding-nearest-enum as fallback.

## v1 scope

- 4 players, exactly 3 prompts, one round, no accounts
- Hand-authored enum ladders — no LLM in the loop
- TV: buckets + counts + specificity number; phone: one slider + ALONE lamp
- Keepsake PNG rendered on the host and shown as a QR to download

## Out of scope

Multiple rounds, custom prompts, >6 players, real k>2, printing, persistence between parties.

## Risks & unknowns

- Degenerate strategy: everyone slams to rung 3 and wins instantly. Mitigation: cap one rung-3 use per player, and the keepsake visibly reads as bland.
- With 4 players, k=2 may be too easy; test at k=2/n=4 vs k=3.
- Hand-authored ladders may feel arbitrary; write them from real playtest answers.

## Done means

Four phones join by QR, answer three prompts, and drive the room to zero singletons; the TV renders the keepsake PNG within 60 s of the last slider move, and a server log audit shows no player's raw answer was ever sent to any device but their own.
