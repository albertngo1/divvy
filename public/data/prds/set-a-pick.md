## Overview

A hidden-constraint spatial game for exactly 4 standing players in one room. Each phone is simultaneously a beacon and a listener in the ultrasonic band. Nobody hears anything. The winning move is a human formation — somebody physically standing between two other people, like setting a pick.

## Problem

Mic-based room games all measure the same scalar: loudness, therefore distance. That gives you rings and orbits — an isotropic, boring geometry where the only verb is *walk toward* or *walk away*. But high-frequency sound is directional and a human torso is an actual obstacle. If you play in the shadowing regime instead of the falloff regime, the primitive stops being "how far" and becomes "who is between whom," and suddenly the other players are terrain.

## How it works

**Carriers.** Each phone continuously emits a quiet tone on its own frequency — Blue 18.6 kHz, Red 18.9 kHz, Green 19.2 kHz, Gold 19.5 kHz — and continuously FFTs the other three bins. The server keeps a live 4×4 audibility matrix.

**Calibration.** Everyone stands in a loose circle facing outward for 5 seconds. This captures each *ordered pair's* clear-line reference level, because phone speaker output and mic sensitivity vary wildly by device and no absolute threshold could ever work.

**The private assignment.** Each phone privately shows two names: `HIDE FROM RED` and `SHOW TO GREEN`. Assignments form a permutation, so every player is simultaneously somebody's hide-target and somebody's show-target — meaning exactly one class of physical arrangement satisfies all eight constraints at once, and it involves people deliberately eclipsing each other.

**Private vs shared.** Your phone shows two dials and nothing else: received level from your show-target (must stay above threshold) and from your hide-target (must drop ≥8 dB below its calibrated reference), plus warmer/colder feedback. The host TV shows only `5 / 8 satisfied` and a 90 s clock — never which constraint, never whose.

**The talking layer.** You may ask anyone to move. Every request leaks a piece of your graph. At the end the TV draws the audibility graph and reveals every assignment, so the room finds out who spent 90 seconds hiding from whom.

**Win.** All 8 constraints held simultaneously for 3 continuous seconds.

## Technical approach

- `getUserMedia` with `echoCancellation`, `noiseSuppression`, and `autoGainControl` all **false** — non-negotiable, since every one of them will eat an 19 kHz carrier. 48 kHz capture, `AnalyserNode` with 4096-bin FFT (~11.7 Hz resolution, far more than needed to separate 300 Hz-spaced carriers).
- Emission via a single `OscillatorNode` per phone, amplitude ~0.05, started inside the join gesture.
- Phones report smoothed per-bin dB at 4 Hz. Server (PartyKit Durable Object) is authoritative: it holds the calibration matrix, applies per-pair relative thresholds with hysteresis, runs the 3 s hold timer, and computes the satisfied count. Data model: `Room{players[], calib[from][to], assignments[]}`, `Sample{phoneId, dB[3], t}`.
- **Hard part: the physics, not the sync.** Body shadowing at 19 kHz is real (roughly 10–20 dB) but wall reflections partially fill the shadow back in, so the usable dynamic range is thin. Everything keys off *relative* drop from each pair's own calibration, never absolute level. Carrier drift onto a neighbor's bin and a stray Bluetooth speaker both break it.

## v1 scope

- Exactly 4 players, one round, 90 seconds, no scoring.
- One hide + one show per player; assignments are a fixed derangement.
- Phone UI: two dials, two names, warmer/colder.
- TV: countdown, satisfied count, end-of-round graph reveal.

## Out of scope

5+ players, jammer roles, furniture as declared occluders, multi-round scoring, sitting-down play, any persistence.

## Risks & unknowns

**Go/no-go risk:** if body shadowing measures weaker than the reflection floor, the game silently degenerates into a distance game — prototype shadow depth in a real living room *before* building anything else. Some phone speakers roll off brutally above 18 kHz; fallback to 17.5 kHz carriers, which some people (and every dog) will hear, requiring a warning screen. Standing still for 90 s with a phone held out is also mildly tiring.

## Done means

Four calibrated phones reach 8/8 held for 3 seconds; replaying the same permutation a second time produces a recognizably similar human formation — proving the room is playing geometry and not chasing noise.
