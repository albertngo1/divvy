## Overview

A 90-second wordgame for three players around a TV. Everyone is secretly trying to make one oracle say their own secret word out loud, on the shared screen. The oracle takes one question at a time. Two questions released together get interleaved into a single nonsense chimera — which is then answered, publicly, with both authors' phrasing on display.

## Problem

"Don't talk over each other" is a real social skill and no party game models it honestly. Games that punish collisions usually just void the turn. Here the punishment is *exposure*: the collision doesn't only waste your window, it prints your private agenda on the biggest screen in the room in mangled form, for your rivals to read.

## How it works

**Each phone (private).** Your secret target word (e.g. `pelican`). A text field where you compose a question you think will make an oracle say it without you saying it. One big HOLD pad.

**The pad is the game.** Hold to charge; release to submit. The server watches a rolling 400ms window:
- Exactly one release → your query goes to the oracle verbatim. Answer streams onto the TV.
- Two or more releases → the server interleaves the queries word-by-word into one chimera, answers *that*, and publishes both the chimera text and the answer. No credit for anyone involved.

While you hold, your phone pulses if *someone else is also holding* — not who, not how long. That is your only radar. Out-wait them and you take the window; flinch together and you both bleed.

**Host screen (shared).** The oracle's transcript and an 8-second cooldown bar after every answer, so only ~7 windows exist in the round. Scarcity is what forces the collisions.

**Scoring.** You succeed if your target word appears anywhere in an oracle answer. Then the TV lists all three target words and every phone privately assigns each word to a player. Each correct identification costs the person identified a point — so a chimera that leaked your phrasing hurts twice.

No talking during the round.

## Technical approach

PartyKit Durable Object per room. Phones send `HOLD_START` / `HOLD_END`; the server orders releases by arrival time corrected by per-connection RTT/2 (EWMA over pings, correction capped at 250ms). Oracle calls go to `claude-haiku-4-5-20251001` for latency, streamed server-side and fanned out to the host tab only.

The genuinely hard part is release-ordering fairness. A player on a weak connection is systematically "late" and would eat every collision, which is unplayable and invisible as a cause. Clock-offset correction plus a visible per-phone latency badge (so a bad connection is legible, not mysterious) is the mitigation, and the 400ms window is wide enough to absorb residual jitter.

## v1 scope

- Exactly 3 players, one 90-second round
- Target words drawn from a fixed 40-noun list
- 20-second compose phase before the clock starts, so typing speed doesn't decide the game
- Chimera = strict word alternation, no cleverness
- One end screen: word attribution + winner

## Out of scope

More than 3 players, multiple rounds, voice input, custom word banks, spectator mode, rematch flow, anything beyond a profanity blocklist.

## Risks & unknowns

- The model may refuse or over-apologize at garbled input. System prompt pins it: answer literally, confidently, 25 words max, never mention that the question is malformed.
- iOS Safari has no `navigator.vibrate` — the hold-radar needs an audio tick and screen-pulse fallback, and it's unproven whether that reads as clearly.
- Blind chicken with 3 players may feel luck-driven; the fix lever is window width, not more rules.
- A player can brute-force by holding constantly, poisoning every window. Cap total hold time per round at 25 seconds.

## Done means

Three phones and a TV. In one 90-second round the TV shows at least one clean answer and at least one chimera. No target word ever appears on the host screen before its owner's query lands. A colliding pair sees their interleaved text on the TV within 2.5 seconds of release, and the end screen names a winner.
