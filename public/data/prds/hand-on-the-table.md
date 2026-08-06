## Overview

A 4-player, one-round deduction game where the shared table is literally the network cable. Every phone lies face-down on the same hard table. One phone (the Sender) buzzes its vibration motor in timed bursts; the other three phones pick those bursts up through the tabletop with their accelerometers and privately decode a short code. A hidden Damper can corrupt any receiver's copy by resting a palm, elbow, or drink on the wood between the Sender and that phone. For groups who like table-tapping, murder-mystery physicality and hate reading rules.

## Problem

Party games treat the table as furniture. Meanwhile the table is a real acoustic medium with real attenuation, and human bodies are real dampers — an untapped, hilarious, entirely physical channel that nobody has made load-bearing.

## How it works

1. Setup: all four phones face-down on the table, spread at least 40cm apart. A 5-second calibration has the Sender buzz once so each receiver records its baseline burst energy.
2. Roles, dealt privately: one Sender, one Damper, two honest Receivers. Nobody's phone shows anyone else's role.
3. The Sender's phone privately shows a 5-symbol code (e.g. `▲ ● ▲ ■ ●`) and a GO button. Symbols are encoded as burst lengths: short=▲, long=●, double=■, 250ms gap between symbols.
4. Each Receiver's phone privately shows only *its own* decode — five slots that fill in live, with any low-confidence slot rendered as `?`. Decodes differ per phone because damping is directional and distance-dependent.
5. The Damper's phone shows the same receiver UI plus a private instruction: make at least two of the honest phones drop symbols. Their only tool is their hand on the wood — visible to the room, deniable as fidgeting.
6. Host TV shows nothing but a transmission progress bar and, at the end, all three decodes side by side. The group votes on who damped. Sender scores if a majority of the code is recovered; Damper scores if it isn't and they escape the vote.

## Technical approach

Phone PWAs open `DeviceMotionEvent` (60Hz cap on iOS/Chrome) and compute a rolling RMS envelope of `accelerationIncludingGravity` magnitude, high-passed to kill gravity drift. The motor runs at ~180Hz, so 60Hz sampling aliases badly — we detect *envelope energy*, not frequency, which is robust at 200ms burst lengths. Server: a PartyKit Durable Object holds `{roomId, roles, code, senderTimeline, decodes: {playerId: symbol[]}}`. Phones receive a start timestamp plus an NTP-style clock offset from WS ping/pong, so each receiver windows its envelope against the *known* symbol schedule rather than doing blind onset detection — this is the trick that makes 60Hz sampling sufficient.

The genuinely hard part: per-table SNR. Glass, MDF and solid oak differ by an order of magnitude, and a phone in a thick case is nearly deaf. Calibration sets a per-phone threshold as a multiple of its own baseline burst.

## v1 scope

- 4 players, exactly one round, ~4 minutes
- One Sender, one Damper, fixed 5-symbol code
- Android-only Sender (`navigator.vibrate` is absent on iOS Safari); receivers any platform
- Host TV: progress bar + final three-decode reveal + vote tally
- No scoring persistence, no lobby art

## Out of scope

Multiple rounds, role rotation, error-correcting codes, iOS transmission, phones on different tables, replay of raw traces.

## Risks & unknowns

- Soft or wobbly tables may pass ~0 signal → prompt a 10-second table test before the round and refuse to start below threshold.
- iOS vibration gap constrains casting; a speaker-tone fallback (~70Hz through the table) is untested.
- Damping may be too effective, wiping all decodes — cap by requiring phones spread apart.

## Done means

On a solid wood table with four phones, an honest receiver decodes ≥4 of 5 symbols correctly, and a palm placed between Sender and one receiver reliably drops ≥2 symbols on that phone while leaving the other two receivers ≥4 correct — reproducible across 5 trials.
