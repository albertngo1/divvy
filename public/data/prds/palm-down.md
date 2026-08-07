## Overview

**Palm Down** turns a wooden table into a shared physical network. Phones lie face-down and flat; their accelerometers read knocks conducted through the tabletop. One player is secretly the Sender; everyone else drums cover noise. Each phone is a *spatially distinct receiver*, so each player privately learns a different piece of the answer. For 4 players at one table, 6 minutes.

## Problem

Party games treat phones as tiny screens and ignore that they are instrumented sensor nodes with fixed physical positions. The itch: use the table itself — attenuation, seating, the grain — as the game board, and make each phone's *location* the reason its information is unique. If you could pass one phone around, none of this exists.

## How it works

1. Setup: 4 players, one table. Host screen shows a table diagram and assigns seats 1–4. Each phone shows *"screen down, flat on the table, don't hold it."*
2. Calibration (15s): host plays a countdown; each player knocks 3 times at their own seat. Server learns each phone's noise floor and a rough amplitude-vs-seat matrix.
3. **Round.** Server privately deals roles. Exactly one phone shows: *"You are the SENDER — knock this rhythm: short short LONG, starting on the green bar."* The other three show: *"Cover drumming. Drum continuously, any rhythm, medium volume."* Nobody knows who got what.
4. **Transmit (12s).** Host screen shows a green bar and a metronome. Everyone drums; the table becomes audible mush. The Sender embeds their pattern inside it.
5. **Private readout.** Each phone runs a matched filter against the known pattern *locally* and shows ONLY its own result: a single bar, "signal at my corner: 0.42". No direction, no identity. Because vibration attenuates across the tabletop, the Sender's neighbours read high and the far corner reads low. The Sender's own phone shows a fake plausible bar so they can lie about it.
6. **Talk (60s).** Players compare bars out loud. Three honest numbers triangulate; the Sender must fabricate a fourth that fits.
7. **Vote.** Private tap on the host-numbered seat. Room wins if the majority finds the Sender; Sender wins otherwise.

## Technical approach

- Host tab + phone PWAs, PartyKit / Durable Object as authoritative room.
- Sensing: `DeviceMotionEvent.accelerationIncludingGravity` at the browser cap (~60 Hz). iOS requires `requestPermission()` behind a tap and HTTPS.
- Pattern: three impulses at t=0, 250ms, 750ms — well inside a 60 Hz sample budget. Detection is a local matched filter over a high-passed magnitude envelope; only the scalar score goes to the server.
- Data model: `Room{code, phase, seats[4], pattern}`, `Player{id, seat, noiseFloor, matchScore, isSender, vote}`, `Round{senderId, scores, votes}`.
- Sync: the hard part is **clock alignment**. The matched filter needs each phone's window aligned with the host's green bar to ±30ms. Solution: Cristian-style offset estimation over the WebSocket (20 ping/pongs, keep the minimum-RTT sample) at join, re-run once before transmit; the phone timestamps samples in its own corrected clock and slides ±150ms to find the best correlation peak.
- Second hard part: separating one drummer's rhythm from three others on the same rigid surface. Cover drumming is deliberately continuous, so the discriminator is *pattern correlation*, not loudness — and even so, SNR will be marginal on a light IKEA table.

## v1 scope

- Exactly 4 seats, one table, one round, one Sender.
- One fixed 3-knock pattern (no pattern library).
- Bars are raw scalars, no smoothing or fancy viz.
- Host screen: seat diagram, green bar, countdown, reveal. That's it.
- Solid-wood table only; the setup screen says so out loud.

## Out of scope

Multiple senders, jammers, pattern selection, multi-round scoring, glass/metal table support, phone-in-hand play, cross-table play.

## Risks & unknowns

Attenuation may be too flat across a 1.2m table to distinguish seats. Cover drumming may swamp the pattern entirely at 60 Hz. Browsers throttle motion events when the screen is off or backgrounded — phones must stay awake and face-down with a wake lock. Human ears may just *hear* who is knocking the odd rhythm, killing the deduction.

## Done means

Four phones flat on one table complete a full round; each phone's local matched-filter score for the true Sender's two nearest seats is measurably higher than the far seat in 4 of 6 test rounds; the vote resolves and the host reveals the Sender. Clock offsets between all phones and the host measure under 30ms after calibration.
