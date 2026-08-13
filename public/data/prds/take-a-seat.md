## Overview
A 90-second embodied minority game for 5 people on one couch and two chairs. There are no buttons. The only input is whether your body is standing or sitting, read off your phone's accelerometer. Each phone privately holds a different rule about the *number* of standing people, so the room oscillates, over-corrects, and occasionally locks into a stable configuration nobody planned.

## Problem
Sensor party games keep using the phone as a pointer or a microphone. The most legible sensor state in a living room is the one nobody reads: are you up or down. And the delightful part of El Farol / minority games — everyone reacting to a lagged aggregate — has never been played with actual bodies, where standing up is socially loud and sitting back down is an admission.

## How it works
1. Lobby: each player does 3 sit/stand reps to calibrate their own phone's vertical-impulse threshold.
2. Deal: each phone privately receives one posture rule, e.g. *"Be STANDING while fewer than 3 people are standing"*, *"Be SEATED while an even number are standing"*, *"Be STANDING while the person on your left is seated"*.
3. Round runs 90s continuously. You score one point per second your posture satisfies your rule.
4. **Phone shows privately:** your rule, one green/red pip (satisfied right now?), your accumulated seconds. It never shows the count.
5. **Host TV shows publicly:** five dots, filled = standing, delayed by 1.5s. Nothing about who holds what.
6. Because the TV lags, the honest way to read the count is to look at the actual room — the room is the board.
7. If all five players are satisfied simultaneously for 3 continuous seconds, the round ends early and everyone banks a fat bonus. The v1 rule set is hand-authored to have exactly one such fixed point, and it is not reachable by everyone being greedy.
8. Reveal: TV replays the standing-count trace as a wobbling line while rules are read aloud.

## Technical approach
Host browser tab + phone PWAs + a PartyKit Durable Object per room (WSS; Socket.IO over Tailscale Serve works identically).

Data model: `Room { code, phase, t0, players: { id, name, rule, posture, lastTransitionAt, satisfiedMs, calib }, countHistory: RingBuffer<{t, n}> }`.

Phones send only `posture_change{state}`; the **server** timestamps it, so there is no cross-phone clock sync problem — 50ms of LAN jitter is invisible against a 1.5s display delay. The server ticks at 10Hz, evaluates every rule against the true count, accrues `satisfiedMs`, and fans out asymmetric payloads: each phone gets only its own boolean and score; the host gets only the delayed count.

Sensor: `devicemotion` at ~50Hz, low-pass the gravity vector, project linear acceleration onto it. Sit→stand is a sustained +0.15–0.5g vertical impulse over 300–600ms followed by deceleration; stand→sit mirrors it. State machine with per-device thresholds from calibration, hysteresis, and a 700ms refractory window. iOS needs `DeviceMotionEvent.requestPermission()` behind a tap in the join flow.

The genuinely hard part is **classification, not sync**: posture is shared state, so one false transition poisons all five rules at once. Mitigations: per-device calibration, server-side rate limiting to one transition per player per 700ms, and a two-finger 1s hold to force-resync — which draws a visible glyph on the TV so it can't be quiet cheating.

## v1 scope
- Exactly 5 players, one 90-second round, no rematch button (refresh the tab)
- 5 hand-authored rules with one guaranteed fixed point
- Calibration = 3 reps in the lobby
- TV = five dots + end-of-round wobble trace
- No names, no avatars, no persistence

## Out of scope
Multiple rounds, player-authored rules, cross-round leaderboards, phone-in-pocket detection, spectators, remote play, procedurally generated rule sets.

## Risks & unknowns
Deep couches produce weak impulses and may under-trigger. Half-squatting is unclassifiable — treated as no transition, which is probably a feature. Knee mobility is a real accessibility wall: needs a toggle that swaps posture for "phone raised overhead" (detectable from orientation + impulse). Chaotic rule sets may never settle; the 90s cap is the backstop.

## Done means
Five phones on one Wi-Fi complete a 90s round. Against a hand-logged video of 40 real transitions, ≥95% are classified correctly within 400ms and there are zero false positives from gesturing. The TV count is never wrong by more than one for longer than 1s. At least one playtest visibly oscillates, then locks, and ends early on the all-satisfied bonus.
