## Overview
Still Life is a 4-player statue game for a living room with a TV. Everyone chooses a physical resting place for their phone — open palm, couch cushion, bookshelf, bare floor — and the phones become seismographs. One player is secretly trying to transmit a three-beat code through micro-movement without being attributed. For groups who like hidden-role games but are tired of the loudest talker winning.

## Problem
Sensor party games ask you to wave the phone around. Nobody plays with *stillness*, and nobody notices that a room is a menu of vibration environments: a hardwood floor carries every footstep in the house, a couch cushion swallows everything, an open palm broadcasts your own pulse. That's a free game board sitting in plain sight. And hidden-role games usually run on vibes; here the evidence is physical, live, and on the screen.

## How it works
**Setup (20s).** Each player physically places their phone somewhere in the room and takes a standing/sitting spot they must hold. Each phone PRIVATELY reports the noise floor it just measured — "this surface is LOUD" / "this surface is dead." Nobody else knows how quiet your hiding place is. One re-placement allowed.

**Deal.** Roles go out privately: one Signaler, three Watchers. The Signaler's phone privately shows a code — three impulses, gaps of 1.5–4s. Each impulse must land *in a band*: above that phone's own calibrated noise floor ×2, but below an absolute "obvious" ceiling. Slamming the phone voids the symbol. Watcher phones show only their own live jitter bar.

**Freeze (60s).** Nobody walks. You may shift weight, cough, lean back — which is exactly how the Signaler works, and exactly how an innocent Watcher standing on the same floorboards gets framed.

**Host TV** shows four live traces labelled A–D, *shuffled and anonymous*, plus the clock. It never shows names.

**Vote.** Each phone privately votes on a trace LETTER, not a person. That's the whole game: you must have watched the room and the screen at once and built the mapping yourself. Signaler wins if the code was detected AND at most one vote is correct.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit or Socket.IO over Tailscale Serve). Phones sample `devicemotion` at ~60Hz, high-pass out gravity, and batch 20ms magnitude samples into 200ms frames with client timestamps. Server maps client clocks to its own via ping/pong offset; the TV renders on a 400ms delay buffer so all four traces line up. Model: `players[]{id, surfaceNoiseFloor, traceLetter}`, `round{signalerId, code[], detections[], votes{}}`.

The hard part is **threshold fairness**: a phone on a rug and a phone on oak differ by 20dB, so detection must be relative to a per-phone calibration window with hysteresis, and the ceiling rule must be enforced server-side only — phones never decide.

## v1 scope
- Exactly 4 players, one 60s round, one Signaler.
- Scalar magnitude only; no orientation, no gyro.
- Fixed 3-impulse code.
- Phone UI = text + one bar. TV = four sparklines + a clock.
- Room code lobby, no accounts, no persistence.

## Out of scope
Multiple rounds, rotating roles, a Morse-like alphabet, discussion timer, trace scrubbing/replay, tremor fingerprinting, spectators.

## Risks & unknowns
- iOS needs `DeviceMotionEvent.requestPermission()` behind a tap, over HTTPS — real onboarding friction.
- Android sample rates vary; some cap near 50Hz.
- Deniability may be *too* easy, making the Signaler unbeatable; the ceiling rule and surface calibration are the tuning knobs.
- 60 seconds of enforced silence can die socially without TV tension.

## Done means
Four phones on four different surfaces; the Signaler lands three in-band impulses; each spike appears on the correct anonymized TV trace within 400ms of the real movement; all four private votes register; the TV reveals the letter→person mapping and names a winner. Bench test: one person, four phones, a still room — fewer than one false detection per phone per minute.
