## Overview
Dead Hand is a 3–4 player cooperative game on a shared TV plus one phone per player. A dot crawls across a maze-ish board on the TV. It only moves while the room is silent. Whoever is steering it changes every 15 seconds without announcement, and only the current driver's phone knows they're driving. The room must route the dot through everyone's private waypoints inside 3 minutes.

## Problem
Co-op games solve coordination with talking, then bolt on a silence gimmick that the room routes around. Dead Hand makes the coordination channel and the progress channel the *same* channel: talking is how you'd fix a mistake, and talking is what freezes the fix. The tension isn't "don't talk" — it's watching someone drive wrong and having to price out whether correcting them is worth the stall.

## How it works
- **Host TV (public):** a 12×8 grid, the crawling dot with a short trail, a goal square, a 3:00 clock, and a big **CARRIER** bar that fills red the instant any mic goes hot. The dot advances one cell per 1.2s of continuous room silence; any detected speech freezes it and, after 1.5s of continuous speech, walks it *backward* one cell per second. The TV never shows who is driving or who is talking.
- **Every phone (private):** a d-pad. Tapping it always feels responsive — the arrow lights up, the phone buzzes. But only the current driver's input is actually applied. Your phone does not tell you whether you're the driver. You infer it from whether the TV dot obeyed you.
- **Waypoints (private, asymmetric):** each phone privately shows ONE grid cell that its owner must get the dot to touch. Yours is invisible to everyone else and to the TV. So you need the dot to visit your cell — which means you need to be driving when it's nearby, or you need someone else to steer there, which you can only ask for out loud, which freezes the dot.
- **The bail-out:** each player gets one **PING** button. Pressing it flashes a single anonymous cell marker on the TV for 2 seconds, no attribution, no sound. It's the only free communication in the game, and it's one-shot.
- **Win:** dot reaches the goal with all waypoints touched before 3:00. Post-round, the TV replays the path with waypoints and driver-shifts overlaid — you finally see the three seconds where two people were both convinced they were driving.

## Technical approach
Host tab + phone PWAs + a PartyKit Durable Object as the authority. Data model: `Room {tick, dotXY, driverId, driverShiftAt, carrierHot, clock}`, `Player {pid, waypointXY, pingUsed, lastInputDir}`.

The server runs a 20Hz simulation tick and is the only writer of `dotXY`; phones send `{dir}` intents and the host renders state, so a laggy phone can never desync the board. Driver rotation is a server-side shuffled cycle with a jittered 12–18s dwell so it isn't countable.

Mic gating: each phone runs an AudioWorklet emitting 20ms RMS + a voicing flag, streamed as `{dbfs, voiced}` at 50Hz — audio never leaves the device. The server ORs the room into a single `carrierHot` boolean with asymmetric hysteresis (hot after 2 voiced frames, cold after 400ms quiet). The hard part is threshold honesty in a loud room: TV audio, laughter, and a phone lying face-up next to a speaker all trigger false hot. Mitigation: 8s per-device noise-floor calibration at join, a voicing gate that rejects broadband clatter, and requiring at least one device ≥8dB over its own floor.

## v1 scope
- 3 players, one 3-minute round, one hardcoded 12×8 board, one goal, one waypoint each.
- Fixed 15s±3 driver rotation; no roles, no powers except one PING each.
- Host screen: grid, dot, carrier bar, clock, end-of-round path replay.
- Phone: d-pad, own waypoint, PING button. Nothing else.

## Out of scope
- Multiple rounds, scoring across rounds, difficulty tiers, generated boards.
- Obstacles, hazards, moving goals, per-player abilities.
- Speaker attribution (v1 only needs "is anyone talking", not who).

## Risks & unknowns
- If the driver is too obvious, the bluff collapses; if too opaque, it reads as broken input. Dwell time and the fake haptic need playtesting together.
- Backward-walk on sustained speech may be too punishing and kill all attempts; may need to cap reversal at 3 cells.
- A room that just goes fully silent and brute-forces the maze wins boringly — waypoints must be spread far enough that pure silence can't cover them in time.

## Done means
Three phones and a TV in one room: the dot advances only during measured silence, freezes within 200ms of someone speaking, obeys exactly one phone at a time with rotation invisible on the TV, each phone shows a different private waypoint, PING renders anonymously, and a full 3-minute round ends in a win or loss with a replay that correctly overlays driver-shift boundaries.
