## Overview
Nap is a 90-second, 3–4 player scramble where the game board is every surface within arm's reach of your couch. Each phone becomes a friction-noise classifier: hold it near a real surface, rub that surface with a finger, and the mic's spectrum says whether you found fabric, grain, or glass. For groups who want everyone physically fanned out across the room within ten seconds of the round starting.

## Problem
Phone party games use the phone as a numbered button; scavenger hunts use the camera, which is slow, needs light, and lets one person film on everyone's behalf. Nobody uses the mic as a *material* sensor, even though a fingernail dragged across carpet, oak, and a windowpane produces three unmistakably different noises. The itch: a game whose board is your actual furniture, and where two people can be racing for the same couch arm without either knowing it.

## How it works
**Calibration (15s).** The TV tells everyone to rub their own palm 5cm from the mic. This captures each device's noise floor and effective gain.

**Private per-phone state.** Each phone shows exactly one target class: HISS (fibrous/soft — carpet, couch arm, sweater, curtain), RASP (grainy/hard — wood grain, cardboard, brick, denim), or SQUEAL (smooth/hard — glass, ceramic, laminate, a painted door). Two of the four players are deliberately dealt the *same* target. Nobody is told this. Below the target is a private match meter and nothing else.

**The act.** Find a candidate surface, hold the phone ~2cm off it, rub with a finger for 1.5 continuous seconds. The meter fills; a successful lock sends a claim.

**Shared host screen.** A 90s clock and a three-slot claim board — one slot per class, each OPEN or filled with a swatch and the claimer's name. The TV never shows anyone's target, so an OPEN slot tells you nothing about who wants it.

**The twist.** First lock of a class = 2 pts. If your class gets claimed out from under you, your phone silently swaps to a backup target and you scramble — which is loudly visible to the room as sudden panic. That panic is the only tell that you had a rival. Backup lock = 1 pt, nothing = 0.

## Technical approach
Host tab + phone PWAs + one PartyKit Durable Object per room. On-device feature extraction: WebAudio `AnalyserNode`, 2048-point FFT, 40ms hops. Over a rolling 1.5s window compute band-energy ratios (100–600 / 600–3k / 3k–8k Hz), spectral centroid, spectral flatness and zero-crossing rate, each divided by the calibration baseline. A hand-tuned decision tree yields `{class, confidence}`. Phones POST `{playerId, features, proposedClass, confidence}` at 5Hz over WS; the server owns first-lock ordering by receipt time, assigns backups, and broadcasts claim state. Server model: `room{clock, claims{class→playerId}}`, `player{id, target, backup, baseline, locked}`.

Genuinely hard part: mobile browsers apply AGC and noise suppression that flatten exactly the cues we need. Request `getUserMedia({audio:{autoGainControl:false, noiseSuppression:false, echoCancellation:false}})`; iOS Safari partially ignores this, so per-device baseline normalization is load-bearing, not polish. Second hard part: party noise. Speech is weak above 3kHz, so require sustained 3–8kHz energy well above baseline for the full window, which rejects talking and laughter.

## v1 scope
- 3–4 players, one 90-second round, three classes only
- Rub with a finger *next to* the phone — never rub the phone itself
- Hand-tuned thresholds, no ML, no per-room training
- Host screen: clock, three claim slots, final score
- Duplicate target dealt to exactly one pair

## Out of scope
- More than three material classes, or naming specific objects
- Camera verification, multi-round play, anti-cheat beyond the sustain window
- Any Android/iOS native build

## Risks & unknowns
- Classification may be too noisy across devices to feel fair
- Rooms with few hard-smooth surfaces make SQUEAL trivially contested or impossible
- Players may discover a cheat surface (rubbing their own jeans) that satisfies two classes

## Done means
Four phones on one Wi-Fi, each dealt a target, and in a live living room all four players lock a class within 90 seconds with ≥80% agreement between what the phone classified and what the surface actually was — and the duplicate-target pair visibly races.
