## Overview
Gauss is a 3-4 player cooperative game where each phone reads the raw MAGNITUDE of the magnetometer (not heading — the field-strength channel compass apps throw away) and the room's hidden magnetic landscape becomes the board: the radiator, the speaker magnet, the steel table leg, the laptop, the wiring in the wall. For groups who like a tense, silent treasure-hunt.

## Problem
Every compass game uses only heading. The magnitude channel — which spikes near metal and electronics — is completely ignored, and nobody realizes their room has a rich, invisible magnetic terrain you can actually stalk through.

## How it works
Setup begins with a 20-second survey: each phone records baseline field magnitude as the player waves it around the room. From that, the server assigns each phone a private target magnitude tied to a distinct metal feature (a value only reachable near, say, the radiator). The phone shows only a Geiger-style meter — a proximity bar plus click cadence that rises as live magnitude nears its secret target — with NO map and NO direction. Players sweep their phones through the room, reading hot/cold from the clicks alone, homing in.

The host TV shows only N anonymized beacon dots, dark until locked. Hold your phone within tolerance for 3 seconds and your beacon lights; all beacons must be lit simultaneously, and drifting off re-darkens yours. Because targets differ, players converge on different metal features; if two targets read similar magnitude, both phones crowding one object interfere, forcing spatial renegotiation. Private per phone: your live meter + lock state. Shared on TV: anonymized beacons + the round timer.

## Technical approach
Host browser tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve HTTPS — a secure context is required for sensor permission). Phones use the Generic Sensor `Magnetometer` API, computing magnitude = sqrt(x²+y²+z²) and streaming ~10Hz. Data model: `room { players[], beacons: { playerId, targetMag, tol, locked } }`. Server runs per-beacon hold timers and enforces simultaneous lock; TV renders lights. The genuinely hard part is calibration: magnetometers drift and carry a per-device hard-iron offset, so absolute cross-phone comparison is hopeless. The survey sidesteps this by setting each phone's target RELATIVE to its own readings, never comparing devices.

## v1 scope
- 3 players (Android), 20-second survey
- Three targets near three distinct metal objects
- One round, 3-second simultaneous hold
- Anonymized beacon lights on TV

## Out of scope
- Hidden prop magnets, direction arrows
- Multiple rounds, scoring
- iOS support (Safari lacks the Magnetometer API)

## Risks & unknowns
- Magnetometer API is Android-Chrome-only; iOS Safari has no equivalent, so v1 is Android-only
- Fields are weak beyond ~30cm from metal; furniture-light rooms may have too flat a terrain
- Phone self-noise (vibration motor, other nearby phones) muddies readings
- Survey/calibration adds friction that can feel fiddly before the fun starts

## Done means
Three Android phones complete the survey, each homes in on its own metal hotspot using clicks alone, and all three hold within tolerance for 3 seconds simultaneously to light every TV beacon; walking one phone away re-darkens its beacon.
