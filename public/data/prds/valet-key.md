## Overview

A 90-second, four-player scramble where every phone ends up in the *wrong hands*. You read a private physical objective, hand your phone to your neighbor, and then you must talk them into satisfying it — except they can see the live warm/cold meter and you can't, and you know the goal and they don't. Four blind hill-climbs run at once in one room, out loud, over each other. For groups of four who like games that turn a living room into a shouting match with rules.

## Problem

Phone-as-controller games assume the phone stays with its owner. That's a wasted premise: the most interesting thing you can do with a private device is give it away. Handing over your controller creates instant asymmetry — knowledge on one side, sensing on the other — with no cards, no bluffing rules, no scaffolding. Nobody's built the party game where the phone is the hostage.

## How it works

1. **Calibrate (10s).** Each phone samples its own accelerometer noise floor and mic RMS while held still. All later thresholds are relative to *this device's* baseline.
2. **Read (10s).** Each phone privately shows one objective from a deck of four, referencing real room features: *"Be within arm's reach of the TV and held below waist height,"* *"Stay quieter than the room average for 20 of the next 90 seconds,"* *"Lie flat and perfectly still on a hard surface for 15 straight seconds,"* *"Be held facing the doorway, screen up, above the holder's head."*
3. **Hand off.** Text disappears. Everyone passes their phone to the left; the phone detects the handoff jolt (accel spike >2.5g baseline-relative) and the round starts.
4. **Scramble (90s).** The phone in your hands shows **only a single unlabeled needle, 0–100** — no words, no numbers, no hint of *which* sensor drives it. Its owner, screenless, shouts guidance. The holder narrates the needle back. Neither side can solve it alone.
5. **The commons.** The "stay quiet" objective is being murdered by everyone else's coordination. Nobody has to sabotage; the room does it.

**Host TV** shows: a countdown, a live room-loudness bar, four anonymous pips. Score reveal at the end only.

## Technical approach

Host browser tab + phone PWAs on a PartyKit / Durable Object room over Tailscale Serve (valid certs — needed for `getUserMedia` and iOS's `DeviceMotionEvent.requestPermission()`, both gesture-gated).

Data model: `Room{phase, t0, roomLoudness}`, `Device{id, ownerId, holderId, baseline{accelNoise, micRms}, objectiveId, progressMs}`. The objective spec stays resident on the owning device and is **never re-rendered** after handoff; the phone evaluates its own sensors at 20Hz locally and emits only `{deviceId, needle, satisfied}` at 5Hz. Server is authoritative for the clock, the derangement, and final scoring.

The genuinely hard part isn't sync — it's **cross-device sensor comparability**. "Quiet" on an iPhone 12 and a Pixel 6 differ by 20dB of AGC; "still" differs by an order of magnitude of accel noise. Everything must be expressed as a z-score against that device's own 10s baseline, and mic objectives must be *relative to the live room average* (broadcast by the host), not an absolute dBFS.

## v1 scope

- Exactly 4 players, one 90-second round, pass-left derangement only
- 4 hardcoded objectives (one each: proximity/tilt, mic, stillness, orientation)
- Needle = single scalar, no labels
- Host TV: countdown, room-loudness bar, end-of-round reveal
- Score = seconds satisfied

## Out of scope

Multiple rounds, objective drafting, deliberate sabotage roles, 5+ players, spectators, rematch, sound design beyond a start/stop tone.

## Risks & unknowns

- Mic AGC may flatten the loudness signal; may need `echoCancellation:false, autoGainControl:false`.
- Handoff-jolt detection could false-fire; fall back to a host countdown.
- Four people shouting may be chaos rather than fun — the 4-objective mix is the tuning knob.

## Done means

Four phones calibrate, reveal four different objectives, survive a physical handoff, and drive four independent unlabeled needles from local sensors; at T+90 the TV reveals four satisfied-second totals, and at least one playtest group audibly discovers that the quiet objective is impossible while everyone else is talking.
