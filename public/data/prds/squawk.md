## Overview
Squawk is a 3-player cooperative voice game in the Spaceteam lineage, built around the real asymmetry of air-traffic control: the person who can see the picture is not the person flying the plane. One player is the controller; the rest are pilots. It's for a living-room crew who like the panic of shouting exact instructions before a klaxon goes off.

## Problem
Most 'talk to survive' games give everyone symmetric info, so coordination is just parallel button-mashing. The itch here is *dependency*: you physically cannot do your job without believing a voice you can't verify, and readback discipline (say it back or it doesn't happen) turns careless talk into crashes.

## How it works
Two planes approach one runway. The **controller phone** privately shows a radar scope: each plane's callsign, current altitude, heading, and separation ring. The controller sees everything but can touch nothing. Each **pilot phone** privately shows only that pilot's own cockpit — callsign, current heading/altitude, fuel, and an empty *clearance slot*. Pilots see nothing about the other plane.

The controller speaks a clearance in strict phraseology: "Delta-Two-Two, descend and maintain two thousand." The named pilot must read it back aloud; their phone's on-device speech recognition checks the readback against the expected string. Only on an exact match does the clearance load into their slot and the plane actually descends. Meanwhile both planes drift toward each other on a server tick; if their separation ring breaches, the host TV blares a conflict klaxon and the round is lost.

The **host TV** shows a deliberately anonymized airspace — planes as unlabeled blips, a shared timer, landings scored — enough for spectators to feel the tension but useless as a cheat sheet. Success = both planes landed with no separation breach.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room) owns plane state and steps it on a ~500ms tick, broadcasting per-role filtered views: controller gets full state, each pilot gets only its own plane. Data model: `{planes: [{id, callsign, alt, hdg, fuel, clearance}], sepBreach, landed[]}`. Readback verification runs client-side via the Web Speech API (hold-to-talk to cut crosstalk); the phone posts a boolean match plus the recognized transcript, and the server applies the clearance only on match. The genuinely hard part is speech recognition reliability on aviation phraseology under room noise — needs a constrained grammar (fixed callsigns, digits, verbs) and a graceful 'say again' fallback so a bad match costs time, not the game.

## v1 scope
- 1 controller + 2 pilots, exactly 2 planes
- One approach sequence, ~90-second round
- Only two clearance verbs: descend/maintain, turn heading
- Win = both landed, no separation breach

## Out of scope
- Weather, holding patterns, more runways
- Departures, ground taxi, fuel emergencies
- Score history, rematch tuning

## Risks & unknowns
- Speech recognition on noisy phones may frustrate; needs constrained grammar + fallback
- Tick rate vs. talk latency: too fast and readback can't keep up
- Controller may just point at the TV — anonymize hard enough that they can't

## Done means
Three people in a room land two planes using only spoken clearances and enforced readback, lose when they let separation break, and immediately want to try three planes.
