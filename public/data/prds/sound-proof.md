## Overview
A 4-minute cooperative round for 3-4 people in one furnished room. Every phone becomes its own sonar: it plays a short sweep through its speaker, records itself, and infers how occluded it is (open palm vs. under a cushion vs. inside a drawer). Each player is privately told a different target occlusion and must physically hide their phone to hit it. For groups who already own a couch, a bookshelf, and a junk drawer.

## Problem
Sensor party games keep using the phone to measure the *player*. Nobody uses the phone to measure **what is on top of the phone**. Meanwhile every room is full of an untapped board: cushions, coats, drawers, cereal boxes, shoes. The itch is a game where the correct move is to jam your phone into the couch and walk away.

## How it works
1. **Calibrate (20s).** TV: "Hold your phone flat in your open palm." Each phone plays a 1.5s log sweep (2-8 kHz) at fixed volume, records itself, and computes `R = energy(4-8k) / energy(0.5-2k)`. Fabric kills highs; the ratio is self-normalizing against speaker/mic gain. This is that device's open-air baseline.
2. **Private deal.** Each phone shows ONLY a fuzzy dial with a target band — e.g. "0.45-0.60, half-buried" plus a plain-language nudge ("cloth, not wood"). Targets differ: one player needs nearly-open, one needs deeply-buried, one needs the awkward middle.
3. **Hunt (90s).** Players roam and stash. The phone screen shows a live needle (updated once per 1.2s cycle) and a red **CROWDED** bar when it hears a *neighbouring phone's* sweep above threshold — meaning someone stashed too close to you.
4. **Lock.** All phones in-band, zero crowded pairs, held 5 continuous seconds. Touching your phone to check it changes the reading, so peeking is self-punishing.

**Host TV shows:** four anonymous lamps (in-band / out), a crowding-pair count, a countdown. Never a target, never a location.

## Technical approach
PartyKit Durable Object as authority; phone PWAs over WS.

Data model: `Room {phase, cycleMs, slots[], players[]}`, `Player {id, baseline, targetLo, targetHi, lastRatio, inBand, heard:{peerId: dB}}`.

Sync: the server assigns each phone a **TDMA slot** (i x 300ms inside a 1200ms cycle) and a distinct sweep band. Phones estimate clock offset NTP-style (median of 5 WS ping/pongs) and emit only inside their slot +/-40ms; outside it they record and report cross-levels. Phones post `{ratio, heard}` at ~5Hz; the server owns the band test and the 5s hold timer.

Hard part: audio pipeline hygiene. `getUserMedia` must be opened with `echoCancellation:false, autoGainControl:false, noiseSuppression:false` or the phone cancels its own sweep and AGC destroys the ratio. iOS needs a user gesture to start audio and drops the AudioContext on screen lock, so hidden phones need a Wake Lock and screen-on.

## v1 scope
- 3 players, one 90s round, one target-band triple (open / half / buried).
- Fixed 1200ms TDMA cycle, hardcoded slots.
- Crowding = simple threshold on cross-level, no distance estimate.
- Host TV: three lamps and a timer. No scores, no rounds, no lobby art.

## Out of scope
Multi-round, scoring, room-type presets, seeker/hider phases, Android-vs-iOS gain profiles, spectating.

## Risks & unknowns
- Ratio may not separate "under a magazine" from "under a cushion" on cheap speakers; may need to widen bands to 3 coarse buckets.
- Loud rooms swamp the sweep; may need per-cycle noise-floor subtraction.
- Someone hides a phone somewhere they can't retrieve it.

## Done means
Three phones, one living room: after calibration, each shows a distinct target; players stash them; the TV lights all three lamps and declares a win only when all three sit in-band with no crowded pair for 5s — and moving one phone next to another turns a lamp red within 2 seconds.
