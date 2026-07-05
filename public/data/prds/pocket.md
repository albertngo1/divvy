## Overview
Pocket is a cooperative rhythm game where one drum kit is split across the room — each phone *is* one instrument. For 3–5 players around a single TV. It steals the note-highway of rhythm games but shatters the chart across phones so the band only exists when everyone holds their thread.

## Problem
Rhythm games are single-player or one-controller affairs. A shared screen can't be a band — you can't stack four scrolling charts on one TV and expect anyone to read their lane. The specific joy of playing music *together* — locking your one part into a groove while the person beside you holds theirs — has no party-game form.

## How it works
The loop is divided: kick, snare, hats, clap. Each phone privately shows ONLY its instrument's scrolling note lane plus a big tap zone, flashing and vibrating on your beats. The host TV plays ALL the audio, shows the shared bar, a "tightness" meter, and who's in the pocket.

You tap your part. The server scores each tap against the host transport clock. Nail it and your instrument sounds in the mix; MISS and your instrument DROPS OUT — so the whole room instantly *hears* who slipped. Every few bars a random phone privately gets a **FILL — solo** cue: only that phone knows, everyone else must lay out for two beats, so you must watch your own screen to catch your turn.

- **Phone (PRIVATE):** your lane, your tap zone, your private fill cue, your accuracy.
- **Host TV (SHARED):** the combined groove audio, tightness meter, per-player in-pocket / dropped indicator.

## Technical approach
The host tab is the audio + clock authority; phone PWAs are SILENT controllers; the WS server judges timing. Phones never play audio — that kills per-device drift. Each phone runs a one-time latency calibration (tap along to 8 host clicks → measure tap-to-server offset) so judging is fair across devices. Data model: `Song{bpm, lanes:{playerId:[beatTimes]}}`; each tap → `{playerId, clientTs}`; server maps to the nearest beat using host transport + that phone's calibrated offset. The genuinely hard part is input latency: judging simultaneous taps from 5 phones against one groove, *fairly*, over house WiFi — the calibration plus a generous-but-honest hit window is the whole ballgame.

## v1 scope
- 3 players, 3 instruments, ONE 16-bar loop.
- Mute-on-miss + tightness meter.
- Per-phone latency calibration (crude is fine).
- One scripted fill OR none — pick one.

## Out of scope
Song library, difficulty tiers, melodic instruments, leaderboards, phone-side audio.

## Risks & unknowns
WiFi jitter that makes fair judging impossible; whether mute-on-miss is fun or just punishing; calibration UX friction; 3 lanes may be too sparse to feel like a groove.

## Done means
Three phones each hold a different instrument, play a 16-bar loop, and when one player stops tapping, their instrument audibly drops from the TV mix within a beat while the others keep the groove going.
