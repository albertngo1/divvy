## Overview

Hide-and-seek where the only clue is acoustics. A hider secretly stashes a fingerprint of one spot in the room; seekers must physically find a place where their own phone hears the room the same way. For 4 players in a cluttered living room — the more couches, curtains and corners, the better it plays.

## Problem

Room-scale party games keep reaching for compass and accelerometer, which only ever answer "which way" and "how hard." Meanwhile every room is already a dense, invisible map: a corner is boomy, under the coffee table is comb-filtered, next to the curtain is dead. Phones can read that map with a mic and a chirp, and nobody plays with it. The itch is a hot/cold game whose terrain is real and physical but completely unseeable.

## How it works

**Setup.** Everyone stands touching the TV. The host emits a 300 ms log chirp (200 Hz → 8 kHz). Each phone records the 400 ms tail and stores it as its *origin* signature. This doubles as a per-device whitening calibration, cancelling the fact that a Pixel mic and an iPhone mic hear differently.

**Hide.** Three seekers face the wall. The hider walks to three spots of their choosing; at each, the host chirps and the hider's phone captures a signature. Those three become the three seekers' targets — one each, assigned privately.

**Seek.** Seekers scatter. The host chirps every 4 seconds. On each chirp, every phone simultaneously computes a 24-band log-mel envelope of the tail, whitens it against its origin signature, and reports the cosine distance to *its own* target. **Private on the phone:** one number and one word — WARMER / COLDER — plus a heat bar. **Public on the TV:** three anonymous thermometers and a countdown, never a location, never a target.

**The collision rule.** A human body is an absorber. Two seekers crowding the same corner measurably deaden each other's readings, so both drift *colder* — the room punishes clustering, and the whole point is that all three phones must be listening to the same chirp from three different places at once. A single phone passed around cannot play this; the interference and the simultaneity are the game.

First seeker under threshold for two consecutive chirps wins. 90 seconds.

## Technical approach

Host tab (WebAudio chirp emitter + the only clock that matters) + phone PWAs + a PartyKit Durable Object. Host broadcasts `chirp{seq, tFire}`; phones arm a 600 ms recording window, run the mel analysis on-device, and return `{playerId, seq, dist}`. Server holds targets and win state; feature vectors for targets are stored server-side so a seeker's client never sees the answer vector.

Model: `Room{code, phase, chirpSeq}`, `Player{id, role, originVec[24], targetVec[24]|null, lastDist, streak}`.

The genuinely hard part is *not* the WebSocket layer — it's making the feature stable. Phones need only ~±50 ms alignment (grab the whole tail and energy-gate onto the chirp onset), but mic AGC, orientation, and pocket occlusion all move the vector more than a two-metre position change does. Mitigations: whitening against origin, normalising each vector to unit energy, dropping the sub-300 Hz bands, and a phone-flat-in-open-palm rule.

## v1 scope

- 4 players (1 hider, 3 seekers), one room, one 90-second round.
- One chirp every 4 s from the host; no phone-side emission.
- Phone shows only: heat bar, WARMER/COLDER, distance number.
- Host shows three anonymous thermometers + timer + winner card.

## Out of scope

Multiple rooms, hider mobility during seek, team play, decoy targets, ambient-noise rejection beyond simple gating, rematch scoring.

## Risks & unknowns

Biggest unknown is discriminability: does a 2 m move actually change the mel envelope more than device noise does? Needs a bench test in one real living room before anything else is built. Small, hard, empty rooms may be too acoustically uniform to play in. Loud talkers corrupt chirps; a chirp with excess broadband energy should be discarded and re-fired.

## Done means

In one real furnished living room, a hider captures three spots; three seekers each hold a phone reporting warmer/colder against a different target; walking two metres toward the correct spot moves the bar in the correct direction on at least 8 of 10 chirps; one seeker locks on within 90 seconds and the TV declares them.
