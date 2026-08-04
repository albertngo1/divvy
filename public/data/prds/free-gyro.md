## Overview

**Free Gyro** is a 3-player cooperative room game for a TV plus three phone controllers. Each phone is a *free-running* inertial compass: it integrates the gyroscope's yaw rate and never consults the magnetometer. Within ninety seconds, everyone's private idea of "north" has quietly rotated apart, and the room has to notice.

For groups of 3 who like a co-op puzzle where the enemy is your own confidence.

## Problem

Party games treat sensors as buttons — shake to answer, tilt to steer. Nothing uses a sensor's *failure mode* as the game. Gyroscopes drift; that drift is invisible, personal, and hilarious once three people are confidently facing three different walls.

## How it works

1. **Zero.** All three players stand facing the TV and tap ZERO. Each phone's heading frame is set to 0° there.
2. **Assignment.** Each phone privately receives a target bearing in its *own* frame (e.g. 137°) plus a hidden per-device drift bias the server injects (0.3–1.5°/s, random sign) on top of real hardware drift.
3. **The task.** Each phone shows PRIVATELY: a big arrow saying `TURN LEFT 24°` and nothing else — no compass rose, no north, no other players. Players physically rotate their bodies until their arrow reads ALIGNED, then hold.
4. **The judge.** The magnetometer runs the entire time and is *never shown to anyone*. The server uses true magnetic heading to score. The three target bearings were chosen so that, if nobody drifted, all three players would face the same real-world direction.
5. **The host screen** shows only one thing: a SPREAD bar — the angular disagreement between the three true headings — with no per-player breakdown. It creeps upward. The room knows it's wrong; nobody knows who is wrong.
6. **Transfer alignment.** Two players may walk to each other, hold phones flat and edge-to-edge, and both press SYNC for 2s (server confirms via a simultaneous accel tap-spike and matching gyro rates). Their two frames are averaged. Averaging two errors shrinks the spread even though neither becomes true — which is exactly the win condition. Each sync costs 15s off the clock.
7. **Win:** hold SPREAD under 12° for 3 continuous seconds before the clock ends.

## Technical approach

Host tab + phone PWAs + PartyKit Durable Object as authority.

- **Phone → server, 20 Hz:** `{playerId, gyroYawRate, integratedFrameDeg, trueMagHeadingDeg, accelMag}`. Integration happens on-device from `DeviceOrientationEvent`/`Gyroscope`; the server re-derives it as a cheat check.
- **Server state:** `{players: {id, frameDeg, injectedBiasDegPerSec, targetBearingDeg, trueHeadingDeg}, spreadDeg, syncBudget, clock}`.
- **Server → phone:** only `{errorDeg, aligned}`. Server → host: only `{spreadDeg, syncCount, clock}`. The asymmetry is enforced server-side, not by hiding UI.
- **Hard part:** sensor permission + frame consistency. iOS requires a user gesture for `requestPermission()`, `webkitCompassHeading` differs from `alpha`, and yaw rate must be gravity-projected so a tilted phone doesn't spuriously rotate. Second hard part: SYNC detection — pairing two devices by coincident accel spikes within a 150ms window using WS-estimated clock offsets.

## v1 scope

- Exactly 3 players, one round, 90 seconds.
- One zeroing step, one target bearing set, one win check.
- Unlimited syncs at a flat 15s cost each.
- Host screen: spread bar, clock, WIN/LOSE.

## Out of scope

Multiple rounds, scoring, walking/position (rotation only), pitch and roll, more than 3 players, calibration tutorials, rejoin after disconnect.

## Risks & unknowns

- Real hardware drift may be tiny on modern phones — hence the injected bias; tuning it so drift feels organic rather than arbitrary is the whole balance job.
- Players may cheat by lining up with a wall. Acceptable; magnetic truth still judges them, and it's funnier when the wall is wrong.
- Magnetometer distortion near a TV could poison the judge. Mitigate by requiring players to stand ≥1.5m from the screen.

## Done means

Three phones zero at the TV, drift apart measurably on the host bar within 45s with no player input, a two-phone SYNC visibly reduces the bar, and a group that never syncs loses while a group that syncs twice wins.
