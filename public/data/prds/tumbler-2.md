## Overview
Tumbler is a 3-player cooperative safecracking game for a host TV plus one PWA per phone. Each phone is one dial of a three-dial safe; you find your number *by listening* to a private clicking cue, and the enforced constraint is dead silence — because talking literally raises the room's noise floor and masks everyone's clicks.

## Problem
"Reward silence" games usually just penalize a sound with a point. Tumbler makes silence *functional*: the audio signal you need to win only survives in a quiet room. Talking doesn't just cost you — it sabotages your teammates' ears mid-crack. And the one thing you desperately want to do ("now! lock it NOW!") is the one thing you can't.

## How it works
Three players spread out, each holding a phone to their ear or on an earbud.
- **Each phone (private):** a rotary dial (turn via `deviceorientation` alpha, or a touch wheel) and a looping WebAudio tumbler-click whose clarity maps to distance from that phone's SECRET target number — far away = muffled, sparse clicks; close = crisp, fast clicks with a low-pass opening up. A private green glow when you're inside ±tolerance. Each phone hears a *different* target; no phone knows the others'.
- **Shared host TV:** the safe graphic, a single aggregate NOISE meter, and a lock-progress ring that fills only while ALL three dials are simultaneously in tolerance. The TV never shows individual dial positions.
- **The punishment:** every phone's mic measures ambient level and feeds the shared noise meter. High noise ducks each phone's own click playback — you go deaf to your cue. A single "got it!" spikes the meter and blinds the team for a beat. To crack the safe, all three must hold in-tolerance together for 2s while keeping the room quiet enough to hear.

The comedy is three people frantically miming "are you ready?" at each other, nobody daring to say the word that would break the safe.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{safeTargets[3], noiseFloor, lockProgress}`, `Player{id, dialAngle, inTolerance}`. Each phone streams `dialAngle` + a `micRms` sample at ~15Hz; the server aggregates RMS into `noiseFloor`, broadcasts a duck-factor, and evaluates the joint lock. Click audio is synthesized locally (interval + low-pass cutoff as functions of angular distance) so latency is zero. The genuinely hard part is **the mic-vs-own-speaker feedback loop**: each phone's click playback leaks into its own mic and inflates the noise floor. We gate it by subtracting known playback windows (we control click timing) and/or using getUserMedia echo-cancellation, plus a per-room noise calibration on countdown.

## v1 scope
- 3 players, 3 dials, one safe, one round.
- Tolerance ±5°, joint hold 2s to open.
- Noise floor ducks clicks above a calibrated threshold.
- Win = safe opens; that's the whole game.

## Out of scope
- Multiple safes, rounds, difficulty tiers, scoring.
- Per-player voice attribution (only aggregate noise matters in v1).
- Bluetooth-earbud requirement — phone-to-ear is fine.

## Risks & unknowns
- Speaker-into-own-mic feedback could make silence impossible without solid gating.
- "Clearer as you approach" audio must be legible on tinny phone speakers.
- Rooms with HVAC/ambient hum may need per-room noise calibration.

## Done means
Three phones, three players spread across a room: each finds their number by ear, and when all hold simultaneously in a quiet room the safe opens — while a single spoken "now!" measurably ducks the clicks and stalls the lock ring for everyone.
