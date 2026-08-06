## Overview

A cooperative four-player mic game for a living room with a TV. The shared screen shows a combination lock with four rings. Every phone is a private tuner. A ring opens only when two players sustain a specific musical interval together — and the instant a player *speaks*, their ring dies. You cannot ask who your partner is. You have to hum at people until someone hums back in the right relationship.

## Problem

Mic games that "punish talking" almost always just meter loudness: be quiet, score points. That's a negative-space rule, and it produces a quiet, boring room. The itch is a game that bans *words* and hands back a worse channel — expressive enough to actually coordinate through, stupid enough to be funny. Humming a fifth at someone across a couch is inherently comic and genuinely hard.

## How it works

**Calibration (20s):** each phone shows a tuner needle and a note letter. You slide your voice until the needle centers. Nothing is played aloud, so no one learns your pitch by leakage — everyone just glissandos, badly.

**Private on each phone:** your note letter, your live tuner needle and cents deviation, your interval instruction ("find a voice a FIFTH ABOVE you"), your ring's fill bar, and your personal talk-lockout timer. You never see whose ring you share.

**Public on the TV:** four rings with anonymous fill, a 90-second clock, and an unattributed red flash reading SOMEONE SPOKE.

**The gate (on-device):** a sustained vowel is legal. Consonant transients and pitch contour typical of speech are illegal. Speaking resets your ring to zero and dims your phone for six seconds — the tuner disappears, so you're deaf to your own pitch and useless to your partner.

**Completion:** both partners within ±35 cents of their targets, simultaneously, for 1.2 seconds. All four rings inside 90 seconds wins.

## Technical approach

PartyKit Durable Object per room is authoritative; phones are PWA clients. Each phone runs an AudioWorklet at 48kHz, 1024-sample frames: pYIN for f0 plus confidence, A-weighted RMS, spectral flux. It ships `{f0, conf, rms, flux}` at 20Hz over WebSocket. The server timestamps on receipt (never trust phone clocks), keeps ring state, and checks pair simultaneity on a 100ms grid with 250ms jitter tolerance.

The genuinely hard part is own-voice attribution with four people humming at once. Proximity gives each phone its owner ~15–20dB of headroom over the room, so f0 frames are accepted only when `rms > own_baseline + 12dB` and `conf > 0.8`. This still breaks when someone leans toward another phone — which is why phones are required to sit in-hand, and why leaning is a legitimate griefing tactic.

## v1 scope

- Exactly 4 players, 2 rings, one 90-second lock, one difficulty.
- Two intervals only: perfect fifth and octave (widest detection margin).
- Speech gate = spectral-flux threshold with 300ms hysteresis. No ML.
- No accounts, no scoring, no rounds. Win or lose, then refresh.
- Host screen is one HTML page: four arcs, a clock, a red flash.

## Out of scope

More than four players. Odd player counts. Chords of three. Difficulty ramps. Persistent scores. Any transcription. Any recording that leaves the device.

## Risks & unknowns

Tone-deaf players may never center the needle — needs a generous ±35 cents and a visible needle at all times. Cross-talk attribution may collapse in a small hard-walled room. The flux gate may fire on laughter, which might be a feature. Bluetooth speakers or a TV playing audio will poison every mic.

## Done means

Four phones on one LAN, four humans who have never played: all four rings open inside 90 seconds at least once in five attempts, with zero false speech-gate trips on sustained vowels and at least 90% detection of a spoken sentence.
