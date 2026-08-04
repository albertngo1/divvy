## Overview

A living-room game for exactly 3 players and one laptop. Lights low. The host laptop's webcam watches the room; each player sits in a distinct part of the frame holding a phone. Every phone is a lamp. Every player has a secret pattern to blink at the camera. The camera has exactly one auto-exposure, and it belongs to all of you.

## Problem

Games about "don't step on each other" almost always simulate the contested resource in software — a lock, a lane, a slot. Software contention is invisible: you learn you collided when a server tells you, after the fact, and the punishment feels like a ruling. Blown Out makes the shared resource physical and instantly legible. When two lamps fire together, the room watches the live camera preview on the TV wash to white. The penalty lands in your eyes before it lands on the scoreboard.

## How it works

**Calibration (30s).** Each player flashes alone; the host learns their seat's bounding box in frame plus the ambient baseline.

**The round.** 16 slots × 1.2s, metronome on the TV.

Each phone privately shows a fixed 6-slot *rhythm* — e.g. `ON · ON ON · ON` — that is yours and yours only. The shape is locked. What you choose is the **phase**: which of slots 0–10 your rhythm starts on, set with a dial and a COMMIT button. Once committed, the phone auto-fires a full-white max-brightness screen during your ON slots (no fumbling with a button).

Three private combs must interleave so no two teeth land in the same slot. That is the whole puzzle.

**Talking is allowed. Showing your phone is not.** You can describe your rhythm — "mine's three quick then a gap" — accurately or otherwise. Everyone is incentivized to claim more room than they need.

**Collision.** Two ONs in one slot → the webcam's AE clamps hard. Both bits decode as ambiguous, the whole frame drops toward mid-grey, and AE takes ~1.8s to recover, so the *next* slot is unreadable for all three players — including the one who wasn't involved. Score = your correctly decoded bits. A well-placed comb-set scores 18/18; one collision costs roughly 5.

**Host screen:** live camera feed, slot metronome, and a per-slot decode ribbon (green / grey / red) with player attribution revealed only at the end. **Phone screen (private):** your rhythm, your phase dial, commit state.

## Technical approach

PartyKit room (or Socket.IO over Tailscale Serve). Host tab is the authoritative clock and the only camera. Phones NTP-offset against the host at join; a 1.2s slot needs only ±100ms accuracy, which is forgiving. Phones pre-schedule their flash times locally from committed phase — no per-slot round trip.

CV runs entirely in the host tab: `getUserMedia` → canvas at 15fps → mean luma per calibrated ROI, plus global-frame luma.

The genuinely hard part is discriminating *two flashes* from *one bright flash*. Signature: a collision produces a global luma spike followed within ~200ms by the entire frame — including unlit background — darkening as AE reacts. A single flash raises one ROI with a much smaller global dip. Decision rule is a threshold on (background-ROI delta) rather than on player-ROI brightness.

## v1 scope

- 3 players, one 16-slot round, one rhythm each, no rematch flow
- Screen-flash only (white div at brightness 1.0); no torch API
- Fixed seating; calibration is a manual "stand still and flash" step
- Score printed as raw decoded bits, no leaderboard

## Out of scope

Torch API, moving players, >3 seats, multi-round campaigns, phone-side camera use, any audio.

## Risks & unknowns

Webcam AE curves vary wildly by device; some cams do face-priority metering that breaks ROI isolation. Room must be genuinely dim. Phone max brightness differs by 3× across handsets — calibration must normalize per-seat. If AE recovery is faster than ~1s the collision penalty stops stinging; if slower than 3s the round becomes unwinnable.

## Done means

With 3 phones in a dim room: a non-overlapping phase set decodes at ≥90% per-bit accuracy, and a deliberately overlapping pair produces a visible white-out on the TV plus ≥2 slots marked unreadable for all three players.
