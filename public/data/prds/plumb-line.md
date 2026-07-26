## Overview

**Plumb Line** is a 3-4 player cooperative sensor game for a living room with a TV and everyone's phone. Each player holds their phone flat-ish and becomes one *plane sample* of a single invisible surface suspended in the room. The group's job: collectively tilt into agreement on a plane that satisfies a constraint none of them can see alone.

## Problem

Accelerometer party games almost always reduce to "shake it" or "steer a car." Static gravity vector — the phone's *attitude at rest* — is a rich, high-precision, two-degree-of-freedom analog input that nobody uses. And tilt is beautifully embodied: your wrist, your posture, where you're standing all show in the data.

## How it works

1. **Zero.** Everyone lays their phone flat on the nearest hard surface for 2s. That captures each device's gravity bias (phones lie about level by 1-3°).
2. **Deal.** The host TV shows a single translucent plane floating over a wireframe room. Each phone is privately dealt one **stake**: a fixed 3D anchor point in the room ("knee height, by the lamp"), rendered on that phone only as a tiny diagram of where to stand.
3. **Hold.** Each player holds their phone at their stake. The phone's pitch/roll defines the plane's local tilt *at that stake*. The server fits a least-squares plane through all 3-4 (anchor, normal) samples and computes a **residual** — how badly the samples disagree about being one flat plane.
4. **The private half.** Each phone privately shows ONLY: its own bubble (a spirit-level dot) and a single scalar "strain" bar — how much *this* phone is contributing to the residual. It never shows the fitted plane, the target, or anyone else's bubble.
5. **The public half.** The TV shows ONLY the fitted plane, wobbling in 3D, plus a target: a ring the plane must pass through (e.g. "tilt the plane so it slopes down toward the kitchen at 20°"). The TV shows the goal; the phones show the feedback. Neither is sufficient.
6. Win when residual < threshold AND the plane hits the target ring, held for 3 seconds. Players shout: "drop your corner!" "I'm already at max!"

The fun is the split: the room can see the answer but not the error; each player can feel their error but not the answer.

## Technical approach

- **Sensor:** `DeviceOrientationEvent` (beta/gamma) with `requestPermission()` on iOS; low-pass filter (alpha 0.15) to kill hand jitter.
- **Data model:** `Room { players: {id, anchorXYZ, normal:[x,y,z], bias, connected} , fitPlane, residual, targetRing, holdStartMs }`.
- **Sync:** phones publish normals at 20Hz; server (PartyKit Durable Object) is authoritative, runs the SVD plane fit at 20Hz, broadcasts `{plane, residual}` to the host only and `{ownStrain}` privately per connection. Host renders at 60fps with interpolation between 20Hz ticks.
- **Hard part:** the plane fit is under-determined and unstable with 3 near-collinear anchors — anchors must be dealt with good spatial spread, and the residual metric needs normalizing so one wild player doesn't saturate everyone's strain bar into uselessness.

## v1 scope

- 3 players, one round, 90-second timer.
- Fixed anchor set (hardcoded triangle), one fixed target ring.
- Flat-on-table zeroing only.
- Host TV: plane + ring + timer. Phone: bubble + strain bar. Nothing else.

## Out of scope

Scoring across rounds, moving targets, room scanning/AR, more than 4 players, reconnect handling, sound.

## Risks & unknowns

Android/iOS orientation conventions differ and need per-platform normalization. Holding a phone steady for 3s at knee height is genuinely tiring — may need 2s. Risk that the strain bar is *too* informative and the game becomes solitaire minimization rather than a conversation.

## Done means

Three phones and a laptop on the same LAN: after zeroing, three people at three spots in a real room can, through talking to each other, get the TV plane inside the ring and the residual under threshold for 3 continuous seconds — and at least one playtest group fails on the first two attempts and succeeds on the third.
