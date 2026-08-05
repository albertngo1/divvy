## Overview

A 4-player, one-table party game where the tabletop is the game board and four phones lying on it are a crude accelerometer array. One player secretly knocks the underside of the table; the array localizes roughly *where*, and the room argues about *who*. For groups who already have a dining table, four phones, and fifteen spare minutes.

## Problem

Hidden-role games run on pure assertion — you say a thing, people believe or don't. There is no physical evidence, so play collapses into who is best at talking. Meanwhile every phone contains an accelerometer sensitive enough to feel a knuckle-rap through two feet of wood, and nobody uses it. Table Talk injects one piece of noisy, objective, physically-generated evidence into a social argument and lets the table itself testify.

## How it works

Setup (~40s): players sit around one hard table and lay their phone flat in front of them. The TV shows a top-down table diagram; each player taps their own phone once to calibrate per-device accelerometer gain and register their seat position.

Round: everyone puts both hands under the table and is told to keep moving them. The server privately names one player the **Tapper** and shows only that phone a target zone on the underside — *"far edge, near Priya's phone"* — deliberately far from the Tapper's own seat. During a 12-second window the Tapper must reach out and rap once. Everyone else's phone shows a countdown and nothing else.

All four phones sample `devicemotion` at max rate, compute peak |a| in the window, and report one scalar. The server converts the four amplitude ratios into a heat blob on the TV diagram.

Private vs shared: each phone privately shows *only its own* felt magnitude as a wordless bar (FELT IT HARD / barely). The TV shows only the fused blob. So each player holds a private witness statement they may report honestly or not, and the blob is public but ambiguous — a long arm reaches far.

Scoring: everyone votes on the TV for the Tapper. The Tapper scores if the blob lands in their assigned zone **and** they survive the vote.

## Technical approach

Host browser tab + phone PWAs + PartyKit Durable Object as authority. Data model: `Room{seats[], calibration[], phase}`, `Round{tapperId, targetZone, window, reports:{playerId:{peak, sampleCount}}}`. Phones only ever send a scalar; the server does fusion, so a hacked client can lie about magnitude but cannot see anyone else's.

The genuinely hard part is that amplitude falloff through a tabletop is wildly material-dependent (a glass table rings, a padded one is dead) and iOS requires an explicit `DeviceMotionEvent.requestPermission()` user gesture. Fusion is therefore *relative*: normalize each phone against its own calibration tap, then pick the zone maximizing likelihood over ratios only. No absolute physics, no metric units.

## v1 scope

- Exactly 4 players, one table, one round
- One calibration tap per phone
- Four fixed target zones (quadrants)
- Amplitude-ratio blob, no timing/TDOA
- One vote, one scoreboard line, then stop

## Out of scope

Multiple rounds, more than 4 phones, time-of-arrival localization, a second Tapper, table-shape configuration, spectator mode.

## Risks & unknowns

The knock may simply be audible enough for humans to localize by ear, making the array decorative. Soft tables may swallow the impulse entirely. Browser `devicemotion` rates vary 30–120Hz across devices. Phones vibrating from a nearby notification are false positives.

## Done means

On a bare wooden table, four calibrated phones, 20 knocks in known quadrants: the fused blob names the correct quadrant ≥70% of the time, and a full round runs end to end without a phone reconnect.
