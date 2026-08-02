## Overview

A 3–4 player, 100-second real-time congestion game. Every phone holds private work orders it is physically forbidden to execute itself. You assign each one to another player by name; they must hold a button for 3 seconds to complete it. Scoring is individual — you're paid only for *your* tasks completing — so everyone races to route work to whoever seems free. They all pick the same person.

## Problem

Co-op party games ask you to coordinate and reward you when you do. This one weaponizes the most natural coordination instinct there is — "send it to the idle guy" — and makes it the losing move. It's the power-of-two-choices problem played with human voices instead of load balancers.

## How it works

Each phone privately shows a queue of 4 work orders ("CALIBRATE THE FLANGE", "VENT DECK 3"). Tap one, tap a player's name, send. You never see anyone else's queue.

The receiving phone shows one giant HOLD button labelled with the task — **and no sender name**. Holding 3 seconds completes it and credits the sender. While you hold, you are busy.

**The collision:** if a second task arrives at a phone while it is busy or within 4 seconds of a prior arrival, that phone flashes **OVERLOAD** and *both* tasks fail permanently. Both senders lose. The receiver loses nothing — the punishment lands entirely on the people who routed badly.

There is deliberately **no busy indicator anywhere**. The host TV shows only a global completion counter and a growing pile of failed-task names. The only congestion signal is ambient: hearing someone's phone buzz, watching their thumb go down, hearing them say "I'm busy, don't." Which is exactly the announcement that tells three other people who *is* free — and they all fire at once.

Host TV: mission timer, completed count, dead-task pile, final per-player score. Phones: your private queue, target picker, your HOLD button, your own fail log.

## Technical approach

Authoritative Socket.IO or PartyKit room. State per player: `{queue[], busyUntil, lastArrivalAt}`. Assignment is a single `SEND {taskId, targetId}` message; the server alone decides delivery vs overload using its own clock — client timestamps are never trusted, which removes latency-fairness disputes for sends (unlike hold timing).

The genuinely hard part is the **hold**: a 3-second press must survive a dropped socket, a phone rotating, or a browser scroll-cancelling `pointerdown`. Solution: phone sends `HOLD_START` / heartbeats every 250ms / `HOLD_END`; server completes the task if it has an unbroken heartbeat chain covering 3s, tolerating one missed beat. Two missed beats = release. Overload adjudication is a strict serialization inside the Durable Object, so a genuine tie is impossible.

## v1 scope

- 3 players, one 100-second round
- 4 tasks per player, hand-written flavor strings
- Send → HOLD 3s → credit sender
- Overload rule with both-fail and a red OVERLOAD flash
- TV counter, dead-task pile, final individual scores

## Out of scope

Task difficulty tiers, cancel/recall, queue visibility of any kind, chaining (task that must be re-delegated), rounds beyond one, remote play.

## Risks & unknowns

A room may solve it in 20 seconds by shouting "send only to Maya, then Tom, then me" — the 4-second lockout window and staggered queue arrival times are the tuning knobs against that. Also: overload with no sender name may feel unattributable rather than tense.

## Done means

Three phones join by code, a task sent to a busy player produces OVERLOAD on that phone and marks both senders' tasks dead on the TV within 200ms, a clean 3-second hold survives a simulated 400ms network stall, and the round ends with three different individual scores.
