## Overview

A 3-player, 2-minute cooperative navigation game with one rot at the center. Two players are **Navigators**, each holding a map on their private phone. One player is the **Runner**, who sees no map at all and moves the token. Exactly one Navigator's map is live. The other froze at some point and has been *extrapolating* ever since — plausibly, smoothly, and wrongly. Neither Navigator is told which they are.

## Problem

Asymmetric-info party games almost always tell you that you might be wrong. Traitor, liar, glitched — the uncertainty is announced, so you perform doubt. The itch here is the real-world failure mode instead: confidently reading a document that quietly stopped being true. Nobody is lying. Someone is just out of date, including possibly you.

## How it works

A 7×7 dark house. One token. The Runner must reach the exit in 120 s.

- **Navigator phones (private, one each):** the full map, walls, exit, and the token's position. Both look identical in cadence and polish.
- **Runner's phone (private):** four arrow buttons and a single line of **local sense** that only they can read — "stone underfoot," "draft from the west," "wall on your right." One sentence, refreshed each move, always true.
- **Host TV (shared):** the clock, total moves used, and a wall-bump counter. No map, no positions, no names.

At a random moment ~35–50 s in, the server silently swaps which Navigator is live. The demoted phone does not blank or reconnect — it forks into a shadow simulation that keeps moving the token by dead reckoning from the last commanded direction, with small drift. It stays believable for roughly 20 seconds and then diverges hard.

The Runner's private local sense is the only arbiter. When Navigator A says "open corridor ahead" and the Runner's phone says "wall on your right," the room has to run a live consistency audit on two people who are both being honest. The Runner may not read their sense line aloud verbatim more than three times per round — after that they must paraphrase, which is where it gets funny.

## Technical approach

PartyKit / Durable Object, host tab + phone PWAs, authoritative server.

State: `{ maze, truePos, shadowPos, liveNavigatorId, forkTick, senseBudget, moves }`. The server runs one true simulation and, after the fork, one shadow simulation seeded from `truePos` at `forkTick` that applies the last movement vector with a per-tick ±1 drift and never reports a bump. Both Navigators receive byte-identical message *shapes* on the same 250 ms cadence; only the payload differs. Sense strings are derived server-side from `truePos` and sent to the Runner socket alone.

The hard part is **making the swap undetectable**: identical frame timing, no socket churn, no animation hitch, and a shadow that drifts slowly enough to stay credible but fast enough to be caught inside the round. Tune drift as a function of elapsed-since-fork.

## v1 scope

- Exactly 3 players, fixed roles assigned at join order.
- One hardcoded 7×7 maze, one exit, 120 s, one round.
- One swap, at a random tick in a fixed window.
- Six hand-written sense templates.
- TV shows clock, moves, bumps. Nothing else.

## Out of scope

Multiple swaps, multiple runners, role rotation, generated mazes, post-round reveal replay, scoring history.

## Risks & unknowns

- The shadow may be spotted in five seconds (too obvious) or never (too subtle) — drift rate is the whole game and will need three playtests minimum.
- Runners may just ignore both Navigators and wall-follow; the sense lines must be too partial to navigate on alone.
- Possible feel-bad: the stale Navigator spends 60 s being confidently useless. The post-round reveal must frame it as the joke, not the failure.

## Done means

Three phones join; both Navigators see a map the Runner cannot; the token moves within 400 ms of an arrow press; a server log shows the fork happened with zero client-visible discontinuity; and in a live playtest at least one Navigator says out loud "wait, are you looking at the same thing I am" before the clock expires.
