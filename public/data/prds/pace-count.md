## Overview
Pace Count is a heads-up concurrent-room game where each player navigates the physical floor to a secret target tile guided ONLY by phone haptics — the screen stays dark. The phone counts your steps (accelerometer) and reads your heading (compass) to dead-reckon your position. The room's floor is the board. For 3 players, one round.

## Problem
Phone games glue eyes to the screen. Pace Count inverts it: the phone goes silent and dark and becomes a buzzing guide in your hand, forcing you to look up and move. The itch is walking semi-blind through a familiar room, trusting only vibration.

## How it works
The host TV shows the room as a small grid with each player's secret goal tile (spectator overlay). Each phone PRIVATELY runs step-peak counting + heading and buzzes turn-by-turn: two short buzzes = turn right, one long = go straight, a triple = 'you've arrived.' The phone shows NO map — the whole channel is haptic and private. Players start at the TV (heading zero, position origin) and walk simultaneously toward their own tiles. Host dots converge live. Win (cooperative) = all three reach their tiles without dead-reckoned collisions.

Per-phone architecture is load-bearing: three phones are buzzing three different routes at the same instant. You physically cannot pass one phone around — each body needs its own live-integrating guide in-hand while walking. Private, simultaneous, and continuous.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Phones use DeviceMotion for step-peak detection and deviceorientation/webkitCompassHeading for heading; Vibration API for output. Data model: `{players:[{id, stride, pos:{x,y}, heading, goal}]}`. Each phone computes its own dead-reckoned `pos` locally and streams it to the server, which is authoritative over arrival and collision and broadcasts dots to the host. Calibrate stride by walking a known 3-step baseline at start; snap-correct heading whenever a player returns to the TV.

Genuinely hard part: dead-reckoning drift — step count × stride + heading integrates error fast indoors. Mitigate with short routes (a few meters), generous arrival tolerance (one tile), and periodic heading re-zero at the TV.

## v1 scope
- 3 players, ~3×3 floor grid, one secret target tile each, one round
- Haptic-only guidance, screen dark on phones
- Host shows converging dots + goal tiles
- Win = all three arrive within tolerance

## Out of scope
- Obstacle/collision penalties beyond a simple flag
- Competitive racing, multiple rounds, scoring
- Precise indoor positioning (no beacons/UWB)

## Risks & unknowns
- iOS Safari lacks the Vibration API → fall back to a single-earbud private audio cue, or Android-only v1
- Dead-reckoning drift may make arrival feel unfair; tolerances must be loose
- Step false positives from gestures; DeviceMotion gated behind a user gesture on HTTPS

## Done means
Three phones calibrate stride at the TV, then each player, screen dark, follows haptic buzzes across the floor; all three host dots land on their secret tiles within tolerance in one round.
