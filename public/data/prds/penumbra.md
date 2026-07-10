## Overview
Penumbra is a hidden-role deduction game for 4–6 players, built on the phone's ambient-light sensor. One lamp is the room's only strong light source. Every phone lies face-up as a private light meter. One secret player is the Shade; during a synchronized capture window they must briefly cast a shadow over ONE other player's phone. The victim's phone privately registers the dip — and the table must deduce who reached.

## Problem
Ambient-light sensing is the most ignored phone signal, and it only becomes a game when many phones read *different* local light at once. The itch: a social-deduction game where the tell is physical (a hand crossing a beam) and one player secretly *knows* they were targeted — information a single passed phone could never distribute privately.

## How it works
Phones lie face-up around a table under one lamp; each calibrates to its own resting brightness. The host TV runs a 5-second 'Hold Still' capture window with a countdown. Every phone PRIVATELY shows only its own light trace and, at the end, whether *it* got shadowed (a private ping: 'You were touched by the dark'). The Shade's phone privately shows their role and a 'reach one phone' instruction; everyone else is told to keep still. During the window the Shade must physically pass a hand/arm over a chosen victim's phone to drop its lux below threshold — while everyone watches for the movement. Phones report only their own peak dip to the server; the host reveals WHICH seat got shadowed but not who did it. Now the victim holds private truth (they know they were hit and roughly from which side), the group debates the movement they saw, and everyone votes for the Shade. Seating geometry is the board: the Shade can only reach phones within arm's length, so who *could* have hit the victim narrows the suspect list — and the Shade must pick a victim far enough to be plausibly deniable but close enough to reach.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{ phase, windowStart, shadeSeat, victimSeat }`, `Player{ seatId, baselineLux, minLuxInWindow }`. Sensor: AmbientLightSensor API where available, else camera getUserMedia sampling average luma of a downscaled frame. Each phone computes `dip = baseline - minLux` during the window and reports it; the server picks the largest dip above a personal threshold as the shadowed seat and broadcasts only that seat + the vote tally. Server holds the secret Shade role. The genuinely hard part: robust, per-phone light calibration under drifting room light and auto-exposure — needs a rolling baseline and a relative-drop threshold rather than an absolute lux value, plus a synchronized capture window (server timestamp + client-side countdown) so all phones sample the same 5 seconds.

## v1 scope
- 4 players, one Shade, one capture window, one vote.
- Camera-luma sensing (widest support); 3 s calibration before the window.
- Host shows countdown, the shadowed seat, and a single majority vote.
- Win/lose on whether the table votes out the Shade.

## Out of scope
- Multiple rounds, roles beyond Shade, scoring across games.
- AmbientLightSensor-only builds, flashlight/counter-play, decoy shadows.
- Reconnect polish, spectators.

## Risks & unknowns
- Auto-exposure may fight the dip (camera brightens to compensate) — must lock exposure or use short windows.
- Ambient drift (someone walks past the lamp) causes false shadows; thresholds must be relative and generous.
- Very bright or very dim rooms compress the signal; needs a 'lighting OK?' pre-check.

## Done means
Four phones under one lamp run a capture window in which the Shade successfully darkens exactly one victim's phone, that victim (and only that victim) sees a private 'you were touched' ping, and the host correctly reports the shadowed seat — end-to-end, on real hardware, within the 5-second window.
