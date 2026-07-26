## Overview

**Dowsing** is a 4-player room-scale hunt for a phone-shaped treasure that doesn't exist. One player is the **Hider**; the rest are **Dowsers**. The twist is a deliberately perverse instrument: each Dowser's phone gives a strong signal only when the phone is aimed *away* from the truth, so finding the target means learning to read a negative.

## Problem

Hot-and-cold games are as old as parties, and phone compasses make them trivially solvable — a needle that points at the thing is a walkthrough, not a game. The itch: make the sensor *honest but inverted*, so the instrument is real, the physics are real, and the skill is interpretation rather than obedience.

## How it works

1. **Calibrate.** Everyone points their phone at the TV and taps ZERO. That defines room-north for all devices (absolute compass is unreliable indoors; relative-to-TV is not).
2. **Hide.** The Hider's phone privately shows a top-down sketch of the room with a shaded region. The Hider walks to a spot inside it, points their phone at the TV, and taps HIDE — that captures a *bearing* from the TV, and combined with a coarse "how far from the TV" slider they set, gives the buried spot. Only the Hider ever sees it. The TV shows nothing but a shovel icon.
3. **Hunt.** Each Dowser sweeps their phone around the room like a metal detector. The phone privately shows a single vertical **pull** bar. The pull is computed as `cos(angle between phone heading and the bearing to the target) ` mapped so that the bar is LOUDEST at 180° off — pointing directly away — and dead-flat when you're aimed right at it. There is no map, no distance, no arrow. Just one lying bar.
4. **Asymmetry that matters:** each Dowser is privately told a different partial truth — Dowser A's bar also weakens near a decoy, Dowser B's bar saturates within 1m of the target, Dowser C's bar is noisy but unbiased. So they must describe their instruments to each other out loud, in a room where the Hider is standing there smirking and is allowed to lie about their own readings once.
5. **Dig.** Any Dowser can stand somewhere, aim at the TV, and tap DIG. The host TV shows the dig site as a dot on a room diagram and, if wrong, the *distance* only (never the direction). Three digs total, shared across the team.
6. Reveal: TV animates all three dig sites and the true spot.

Phones must be private and simultaneous: three people sweeping three differently-flawed instruments at the same time in the same room is the entire game.

## Technical approach

- **Sensor:** `deviceorientationabsolute` / `webkitCompassHeading`, with the point-at-TV zero offset stored per device. 15Hz, EMA smoothed.
- **Data model:** `Round { hiderId, targetBearingDeg, targetDist, digs:[{playerId,bearing,dist}], instruments: {playerId -> {type, params}} }`.
- **Sync:** phones send heading at 15Hz over WebSocket to a Durable Object; the server computes each player's pull value server-side (never ship the target to a client) and unicasts a single float back. Host receives only aggregate events (dig placed, digs remaining).
- **Hard part:** indoor magnetic compass drift near TVs, speakers, and steel-frame furniture is brutal — 20-40° swings. Mitigation: the point-at-TV zero, a drift-detector that asks players to re-zero if their heading rotates while stationary (cross-check against gyro integration), and generous scoring tolerance (±25° counts as a hit).

## v1 scope

- 4 players (1 Hider, 3 Dowsers), one round, 3 digs, 3-minute timer.
- Two instrument flavors only: "saturates close" and "noisy".
- Bearing-only target (skip the distance slider — target is any point along a ray).
- TV shows: shovel icon, digs remaining, final reveal. That's it.

## Out of scope

Multiple rounds, scoring, decoys, the Hider's one permitted lie (v2), reconnect, any AR or floorplan capture.

## Risks & unknowns

An inverted instrument may read as "broken" rather than "clever" — the onboarding screen has to teach the inversion in one sentence or the game dies. Compass quality varies wildly by handset; cheap Androids may be unplayable. Small rooms compress bearings and make ±25° cover half the space.

## Done means

Four phones plus a laptop: a Hider can bury a spot, three Dowsers sweeping simultaneously get visibly different bars in the same physical orientation, and a playtest group lands a dig within tolerance using verbal comparison of their readings — and can articulate afterward *why* pointing away was the trick.
