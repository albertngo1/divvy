## Overview

A 90-second cooperative panic game for three people in one room, a TV, and three phones held at chin height. The host screen is a machine with three needles — PITCH, PACE, BRIGHTNESS — that must all sit inside their target bands at the same time for three continuous seconds. The needles are driven by the room's voices, summed to a single mono channel. The machine has no idea who is talking.

## Problem

Spaceteam-lineage games treat voice as a transport layer: you shout a word, the word is the move. Nobody has built a game where the *sound* of the room is the control surface and where the act of coordinating physically perturbs the thing you're coordinating. Talking to each other should cost something.

## How it works

Every phone runs a mic feature extractor at 20 Hz and reports four numbers: fundamental frequency, syllable-onset rate, spectral centroid, and RMS level. The server computes each axis as an **RMS-weighted average across all phones** — loudness is not a target, it's voting weight. The louder you talk, the more the mix becomes *your* voice on all three axes at once.

The host screen shows the three needles, their target bands, and a room-energy floor: if the room falls near silence, the machine stalls, so somebody must always be voicing.

Each phone privately shows only: which single axis is yours, your axis's target band, your own live contribution to it, and your current share of the room's weight. You cannot see anyone else's axis, target, or weight. So when PITCH is riding low, the pitch player must decide — sing higher, or get louder and outvote the bass in the corner — and getting louder yanks PACE and BRIGHTNESS toward whatever their own delivery happens to be. Fixing your needle breaks theirs. Explaining that out loud is more voice in the mix.

## Technical approach

Phone PWA: `getUserMedia` with `autoGainControl:false`, `echoCancellation:true`, an AudioWorklet doing autocorrelation f0, spectral centroid, and an onset counter; ~16 bytes per frame over WebSocket. No audio ever leaves the device.

Authoritative server (PartyKit Durable Object) holds `{players: {id, axis, target, gain, lastFrame}}`, keeps a 200 ms jitter buffer, timestamps frames on arrival, mixes, and broadcasts needle state at 20 Hz to the host and a private slice to each phone.

The genuinely hard part is not sync — it's **making three phone mics commensurable**. iOS AGC and per-device EQ mean raw RMS is meaningless across handsets, and every phone also hears the other two players. Mitigations: a 5-second "say your name" calibration that fits per-device gain and noise floor; a hard near-field gate so a leaked neighbour is below threshold; exponential smoothing so needles are readable rather than twitchy.

## v1 scope

- Exactly 3 players, one axis each, assigned at join
- One 90-second round, one fixed target band per axis
- 5-second calibration, then go
- Host renders three needles plus the energy floor; win/lose, no score
- No host audio at all (avoids feedback into the phones)

## Out of scope

More than three players, difficulty ramp, multiple rounds, a saboteur role, recording or playback, leaderboards, native apps, iOS Safari fallbacks beyond "use Chrome".

## Risks & unknowns

f0 estimation on cheap mics in a loud room may be too noisy to steer. The dominant strategy might collapse to "everyone shouts." Three people talking constantly for 90 seconds may be tiring rather than funny. Cross-device calibration may simply not hold.

## Done means

Three phones and a host on one LAN: a group that has never played holds all three needles in band for three consecutive seconds within 90 seconds at least once in five attempts, and afterwards each player can state which axis they had — from feel, not from being told.
