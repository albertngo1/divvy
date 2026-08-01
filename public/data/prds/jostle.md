## Overview

A 3-player, 75-second, one-round physical game. The TV is a dinner table stacked with 12 glasses. Every player must perform a private phone gesture a set number of times — but the gestures have wildly different *durations*, only you know yours, and any two gestures that overlap in time jolt the table and break a glass. Everyone can see each other's arms and everyone can talk, and it still goes wrong constantly.

## Problem

Real-time collision games almost always punish *instants* — two taps in the same 200ms window. That collapses into reflex and latency arguments. The itch here is **occupancy**: contention over an interval you can't see the length of. Verbal coordination fails not because people can't talk, but because "I need about two seconds starting roughly now" isn't a thing a human can say fast enough, six times, while three other people are also mid-move.

## How it works

Each phone privately holds a **Motion Card**, drawn from a pool of three with deliberately mismatched occupancy:

- **SHAKE** — one sharp jerk, ~250ms.
- **SLOW TILT** — hold 30° left, unbroken, for 2.0s.
- **FLIP** — face-down 1.2s, then back up.

Plus a private rep target (6) and a private cooldown (3s minimum between reps). Nobody else is told your motion, your duration, or your cooldown — they only see your arm.

The phone classifies its own gesture on-device from DeviceMotion at ~60Hz and reports an interval `[start, end]` in normalized server time. The server checks overlap: if any two intervals intersect (plus a 150ms guard band), it's a **jolt** — one glass breaks on the TV, and *both* reps are voided. Both colliding phones flash red privately; the TV shows only the broken glass and a live seismograph trace of table wobble, never who did it.

Private on phone: motion card, rep counter, cooldown ring, clipped-flash. Public on TV: glasses remaining, per-player rep count, the wobble trace.

Scoring is individual — reps completed. But if all 12 glasses break, the round ends early and everyone's score halves. Shared doom, private greed.

The comedy is that a SHAKE player thinks they can slot in "real quick" while the SLOW TILT player is two-thirds through a hold nobody can see the end of.

## Technical approach

Host tab + phone PWA + Socket.IO server behind Tailscale Serve (HTTPS is mandatory — iOS gates DeviceMotion on secure context plus a user-gesture `requestPermission()` tap).

Data model: `Round{glasses, tStart, players[]}`, `Player{token, motion, target, cooldownMs, reps, intervals[]}`. Each phone runs its own classifier and emits `{startTs, endTs}` in device clock; the server converts using a per-socket offset from a 20-ping RTT calibration (median offset, discard outliers). Overlap detection runs server-side on normalized timestamps only — clients never adjudicate.

The genuinely hard part is **fair simultaneity for intervals, not points**: a 250ms shake and a 2000ms tilt have very different sensitivity to clock skew, and a 40ms offset error can void a rep that a human would swear was clean. Second-hardest: gesture classification thresholds vary by device, grip, and case — v1 uses a 10-second per-phone calibration ("do your motion twice") to set amplitude thresholds, and rejects intervals longer than 3s as "you put your phone down."

## v1 scope

- Exactly 3 players, 3 motion types, one 75s round.
- 12 glasses, 6 reps each, one fixed cooldown.
- 10s calibration, one break sound, one wobble trace.
- No lobby art, no accounts, no rematch button.

## Out of scope

- More than 3 motions, 4+ players, adaptive difficulty.
- Haptics, per-device auto-tuning, spectator view, multiple rounds.
- Enforcing that players don't just read their card out loud (house rule only).

## Risks & unknowns

- iOS permission friction: a mandatory tap before every session is an ugly first 20 seconds.
- If the room simply shouts strict turn-taking, the private durations may not bite — mitigate by shrinking the guard band, raising rep targets, or adding a hidden per-player cooldown jitter.
- Classification false positives (pocket, gesticulating while talking) could break glasses unfairly and feel arbitrary.

## Done means

Three phones calibrate in under 15 seconds; a deliberate simultaneous SHAKE and SLOW TILT breaks exactly one glass, voids both reps, and shows two overlapping bars on the TV's wobble trace; a clean 75-second round ends with correct per-player rep counts and at least one collision that playtesters agree was nobody's fault.
