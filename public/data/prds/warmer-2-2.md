## Overview
Warmer is a 3–4 player audio-positioning game: one player is the 'Beacon' whose phone emits a steady private tone as they wander (eyes closed) around the room, and every other player must physically settle at their OWN secret distance from the Beacon — one at arm's length, one across the room — using only their phone's live read of how loud the tone is. It's Marco Polo where each hider has a different assigned orbit and the target keeps drifting.

## Problem
Room-scale hot-and-cold games rely on shouting and honesty. There's no clean way for four people to each privately chase a *different* distance from the same moving source at the same time — and a single shared phone obviously can't listen from four places at once.

## How it works
The Beacon's phone plays a fixed-frequency tone via WebAudio and shows only 'keep moving slowly.' Each other phone runs an FFT locked to that frequency, converting the tone's band energy into a smoothed loudness value = a distance proxy. Each of those phones PRIVATELY shows one thing: a warmer/colder needle relative to *its own* secret target radius (e.g. 'you belong close,' 'you belong far') and a lock ring that fills when you hold your band for 3 seconds. The host TV shows ONLY a row of anonymous lock lights — no distances, no names — so nobody knows who's supposed to be near or far. Because the Beacon keeps drifting, everyone's correct spot keeps sliding, forcing constant silent repositioning. Win when all orbits lock simultaneously.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room {beaconId, freq, phase}`; per-player `{id, role, targetBand:[min,max], loudness, lockedMs}`. Beacon phone: WebAudio `OscillatorNode`. Polo phones: `getUserMedia` → `AnalyserNode`, integrate energy in a narrow bin around `freq`, smooth (EMA), send loudness at ~10Hz. Server holds each player's secret band, computes in/out-of-band, tracks a 3s hold, and pushes to the HOST only an anonymized lock-light array; each phone gets back just its own needle + lock progress. The hard part is that loudness↔distance is noisy and non-monotonic (reflections, body shadowing, the moving source) — mitigated with per-phone auto-calibration at round start (sample loudness at a known 'touching' distance), heavy smoothing, and bands defined in relative not absolute terms.

## v1 scope
- 1 Beacon + 2 Polos, one 30–45s round.
- Two secret bands only: 'near' and 'far.'
- One tone frequency, one calibration touch at start.
- Host shows 2 lock lights; phones show needle + lock ring.

## Out of scope
- Multiple beacons, scoring, multi-round play.
- True triangulation or absolute distance in meters.
- Obstacles, teams, or role rotation UI.

## Risks & unknowns
- Room reflections may make the far/near boundary mushy for small rooms.
- Background noise or music near the tone frequency breaks detection.
- iOS mic + audio autoplay both need explicit taps.

## Done means
With the Beacon slowly roaming, two players holding their own phones can silently drift to their secret near/far orbits and both lock within one 45s round, and it's obviously impossible to play by passing one phone because both distances must be sensed at the same instant from two bodies.
