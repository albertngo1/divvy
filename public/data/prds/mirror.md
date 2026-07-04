## Overview

Players pair up. Each pair stands back-to-back holding their phones. One player (the Leader) tilts and rotates their phone slowly; the other (the Follower) has to mirror the motion in real-time — without seeing the leader. Their phones stream gyro data to the server, which computes a running delta between the two orientation vectors. Lower delta = better mirroring = higher score. Per-phone is the whole game: two phones, two independent gyros, two players who can't see each other.

## Problem

"Mirror me" is a classic improv/dance warmup — deeply social, immediately funny, and requires zero explanation. But it only works face-to-face and one pair at a time. A per-phone version lets four pairs play simultaneously across a room, scores them objectively, and — critically — hides visual info so the follower has to guess motion from *some other channel* (the leader's audible cues, breathing, chair squeaks, or nothing at all). The blindness is what makes it hilarious.

## How it works

Room code join, even number of players (4-8). Server pairs them randomly. In each round, one player per pair is Leader, the other Follower. They stand or sit back-to-back. Countdown, then 30 seconds: Leader tilts their phone slowly in any way they want (pitch, roll, yaw). Follower tries to match. Both phones stream `DeviceOrientationEvent` (alpha/beta/gamma) at ~20Hz. Server computes vector delta each frame, averages over the round. Round ends, everyone sees a scoreboard: pair rankings + a wiggly line chart of the two orientation traces overlaid. Roles flip, next round.

## Technical approach

`DeviceOrientationEvent` for gyro data, requires `DeviceOrientationEvent.requestPermission()` on iOS (user tap first). WebSocket connection streams `{alpha, beta, gamma, t}` at 20Hz per phone. Server computes per-frame angular distance between paired phones (quaternion delta or simple Euclidean on the three angles for v1), averages. Room state = `{round, pairs: [{leader, follower}], scores}`. Trace chart client-side from stream buffer post-round. Calibration step: both phones show a "hold flat" screen for 2s to zero their reference frames before the round starts.

## v1 scope

4-8 players, 3 rounds, random pairing each round, 30-second mirror phase, Euclidean angle delta scoring, back-to-back rule enforced by honor system. One game mode: "free-form mirror." Scoreboard shows pair rankings + overlaid trace lines.

## Out of scope

Choreographed leader modes (server dictates the moves), team modes, tournament brackets, gyro-based games beyond mirror (dance-dance clones), replay video, motion-blur trails, spectator view showing all pairs simultaneously.

## Risks & unknowns

iOS gyro permissions are a wall — every player has to tap "allow motion" before the game works, and if they say no once it's stuck. Euclidean angle delta may be a bad metric — rotating in place is easy to mimic, subtle tilts hard, so scores may cluster near "perfect." May need to weight yaw less (since compass drifts). Room acoustics: leaders may accidentally cue followers by shifting weight audibly — that's arguably the fun part, but it might dominate. Novel-but-shallow risk: is one round enough? Might need "leader draws a shape in the air" variants to sustain.

## Done means

Two friends stand back-to-back holding phones, one player tilts wildly, the other rotates the wrong way and they both burst out laughing when the trace chart reveals it. If a pair gets a "near-perfect" round, v1 shipped.
