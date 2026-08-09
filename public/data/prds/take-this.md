## Overview

A cooperative 90-second tabletop game for four people and four phones. The phones are not controllers — they are the *pieces*. Each one lies face-down on a table holding a private order about its own fate, and the players are the squares it can move between. All four orders must be true at the buzzer. Reading an order is a physical act (lift, tilt toward your face) that the TV publicly announces and that spends from a shared budget of six looks for the whole room.

## Problem

In every phone party game, private information is free and infinite — you glance at your screen as often as you like, and nobody knows. That kills the tension of secrets. Here, *looking* is the scarce, visible, socially costly move, and the sensor is what makes it visible rather than an honour system.

## How it works

1. **Calibrate (6s).** Each phone: 3s flat on the table, 3s held in a hand. This trains a per-device held-vs-resting classifier off hand tremor.
2. **Deal.** All four phones go face-down on one table. Each holds an order about its own end state, e.g. *"END: held by someone who has never read me"*, *"END: resting and completely undisturbed for the last 15 seconds"*, *"END: held by a person who is also holding another phone"*, *"END: passed hand-to-hand at least three times."* Nobody has read anything yet.
3. **PRIVATE on a phone:** nothing at all, until it is lifted and tilted past ~50° toward a face for 600ms. Then, and only then, its order appears — to exactly one pair of eyes.
4. **PUBLIC on the host TV:** four lanes, one per phone, each showing live `RESTING / HELD / READING`, the pass count, and `LOOKS LEFT: 6`. So the room sees *that* you read phone 3 and how long you looked — never *what* it said.
5. **Play.** Ninety seconds of arguing, handing things over, and hoarding. Conflicts are structural: only four hands exist, and one phone wants to be untouched while another wants to be held by someone already holding two.
6. **Resolve.** At the buzzer the server evaluates each phone from its own sensor log. Host prompts "hold up what you've got" for the one thing sensors can't see — which human.

## Technical approach

Phone PWA + host tab + authoritative Socket.IO server over Tailscale Serve.

- **Sensing:** `devicemotion` at 60Hz. Band-pass 4-12Hz RMS of `accelerationIncludingGravity` → hand tremor → `held` vs `resting`, with 500ms hysteresis. A pass = a jerk transient bracketed by two `held` segments with a sub-300ms gap. Reading = `deviceorientation` beta in [40°,90°] while `held`.
- **Data model:** `Phone {id, orderId, state, passCount, readerIds[], log[]}`, `Room {looksRemaining, deadline, orders[]}`.
- **Sync:** phones publish *state transitions*, not sample streams — a handful of messages per second. The server is the only thing that decides whether an order is satisfied; phones never self-report success.
- **The hard part:** "held still in a lap" versus "resting on a sofa cushion." A soft surface transmits body motion and looks like tremor. Per-device calibration plus a hard table-only rule in v1 is the mitigation. iOS also requires `DeviceMotionEvent.requestPermission()` behind a user gesture, so the join flow needs an explicit tap-to-arm step.

## v1 scope

- 4 players, 4 phones, one hard table, one 90-second round
- Three hand-authored orders plus one drawn at random
- Cooperative pass/fail only, no points
- Host screen: four lanes, looks counter, timer, verdict
- One honest verbal "who's holding it" check at the end

## Out of scope

Scoring, rematch, phone count ≠ player count, an order-authoring editor, soft surfaces, resolving holder identity from sensors.

## Risks & unknowns

The tremor classifier may miss very still hands, which reads as the game cheating. The verbal holder check is a cop-out that could get gamed. Orders may turn out trivially satisfiable in ten seconds, making the look budget pointless — the whole design lives or dies on order tuning. And people may simply refuse to hand over an unlocked phone.

## Done means

Four phones on a real wooden table: the host screen shows correct `RESTING / HELD / READING` for all four with under 500ms lag and fewer than one misclassification per minute, and one group of four wins and one group loses a round decided entirely by sensors, with no manual override touched.
