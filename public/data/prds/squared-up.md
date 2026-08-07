## Overview

**Squared Up** is a standing-room party game for exactly 4 players (v1) plus a host screen. Every phone is a private compass and a private one-earbud audio channel; nobody looks at a screen during the round. Each player is secretly assigned another player to *face*, and must aim their own torso — phone in a back pocket — until the click in their earbud goes solid. The scoring phase asks the only question you cannot answer by looking: *who was aiming at you?*

## Problem

Pointing games ("point at the biggest liar") collapse instantly because pointing is public and simultaneous — the reveal is the whole game and it lasts 200ms. Meanwhile phone compasses sit unused in every party-game stack. The itch: make aiming *slow*, *bodily*, and *asymmetrically legible* — visible from the front, invisible from behind.

## How it works

1. Host screen shows a square and says: four chairs, one per corner, roughly TV-facing. Players stand at corners. This fixes the geometry the server reasons about (bearings between corners are known to ±20°).
2. Lobby: each phone runs a 10-second figure-8 magnetometer calibration and reports heading offset.
3. **Aim phase (25s).** Server deals a secret 4-cycle permutation. Each phone PRIVATELY shows one card — *"Face DANA"* — for 3 seconds, then blanks to a black "pocket now" screen. Phone goes in a back pocket, screen down. Each player puts in ONE earbud. The earbud emits a click train whose rate rises from 1 Hz to 12 Hz as your body heading closes on the true bearing to your mark; inside ±20° it becomes a steady tone. The host screen shows only a countdown and four anonymous corner dots that pulse when *someone* is locked — never who, never on whom.
4. **Freeze.** Server samples all four headings. Everyone stays put.
5. **Back phase.** Each phone privately shows three buttons: *who was aiming at me?* No talking allowed for 15 seconds, then 30 seconds of accusation, then locked answers.
6. Host reveals the cycle as arrows on the square. +2 per correct back-guess, +1 per player who held lock at the freeze.

The asymmetry is the engine: your target sees you turn, so half the graph is public — and the half aimed at your spine is not.

## Technical approach

- Host tab + phone PWAs; Socket.IO over Tailscale Serve (HTTPS is mandatory for `DeviceOrientationEvent`; iOS needs `DeviceOrientationEvent.requestPermission()` behind a tap).
- Heading source: `webkitCompassHeading` on iOS, `deviceorientationabsolute` alpha on Android, both normalized to true north and offset-corrected in calibration.
- Data model: `Room{code, phase, corners[4]}`, `Player{id, corner, headingDeg, offsetDeg, markId, backGuess}`, `Round{permutation, freezeHeadings, scores}`.
- Sync: phones stream heading at 15 Hz (server drops to 5 Hz for host render). Feedback loop stays LOCAL — the phone computes its own click rate from the target bearing the server sent once, so earbud latency is 0ms and packet loss is invisible.
- Hard part: heading is trash indoors. Steel desks and laptops swing readings 30–40°. Mitigations: per-corner calibration (each player aims at the host screen once, server stores that corner's local declination error), ±20° lock windows, and a host-screen "magnetic mess here" warning if a phone's field magnitude deviates >25% from 50µT.
- Second hard part: iOS Safari has no Vibration API — hence earbud audio, not haptics. Audio also survives pocket fabric better.

## v1 scope

- Exactly 4 players, exactly 4 corners, exactly 1 round.
- One assignment type: a single 4-cycle.
- Click-train earbud feedback, no haptics.
- Back-guess phase + a static arrow reveal on host. No animation.
- No accounts, no persistence, room code in URL.

## Out of scope

Variable player counts, free-form room layouts, saboteur roles, multi-round scoring, spectator view, sound design beyond a sine click.

## Risks & unknowns

Compass drift may make ±20° infeasible in a steel-heavy room. Players may cheat by peeking at pocketed phones. Four people rotating in a small living room is a collision hazard. The back-guess may be trivially solvable by elimination at N=4 — may need N=5 to be interesting.

## Done means

Four phones join by QR, calibrate, and complete one aim phase where at least 3 of 4 players reach steady-tone lock; the host screen reveals the true 4-cycle; each phone recorded a back-guess; scores render. Measured heading error at freeze is under 25° for 3 of 4 players across 5 consecutive test rounds in the same room.
