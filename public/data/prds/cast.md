## Overview
Cast is a 3–4 player concurrent-room game where the group builds one absurd creature together — but each person only choreographs a single body segment, blind, by physically moving their phone through the air. It's for groups who want a silly shared artifact with zero drawing skill required. No points; the win condition is the finished creature GIF, saved by everyone.

## Problem
Gesture and motion-sensor party games almost always resolve to a score. And collaborative-creature games (exquisite-corpse monsters) are drawn, so they favor artists and get passed on one device. Cast makes the body itself come from your body, keeps every limb private until assembly, and hands you a keepsake instead of a leaderboard.

## How it works
The host TV shows an empty armature: a central body with attachment points (head, two arms, tail). Each phone is privately assigned ONE segment. During a 10-second 'record' window, you physically sweep your phone through the air; the phone captures the accelerometer + gyroscope motion path and turns it into the shape and wiggle of your segment — a big swooping arc makes a long curling tail; sharp jabs make spiky limbs. You cannot see the other segments, and you cannot see the assembled body — your phone shows only your own segment forming from your motion. When all phones have recorded, the host stitches every captured segment onto the armature and the composited creature does a little idle animation, spinning on the TV. Because each limb was choreographed blind, the monster is always incoherent and funny. The host exports it as a looping GIF/WebM keepsake; each phone gets the same file.

Private phone shows: 'You are the TAIL. Record now,' a live preview of just your segment, a re-record button. Shared TV shows: the empty armature during recording (segments hidden), then the full assembled, animated creature at reveal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve). Phones use `DeviceMotionEvent` (accel + rotationRate) sampled ~60Hz for 10s, resampled to a fixed-length path client-side, and upload a compact keypoint array `{segmentId, path:[{t,ax,ay,az,rx,ry,rz}...]}` — not raw streams. Data model: `Creature{armature, segments:{segmentId->path}}`. The server just collects all segment paths and signals 'ready'; the host does the procedural mesh: map each path to a parametric limb (arc length → limb length, curvature → bend, jerk → spikiness) via a simple skeletal spline, then render with three.js and record N frames to WebM. The genuinely hard part is not sync (segments are recorded independently, no real-time contention) but the motion→limb mapping feeling *legible* — a player must recognize 'that's my swoop' in the final creature, which needs a hand-tuned, deterministic gesture-to-geometry function and per-device motion normalization (iOS motion permission + gravity subtraction).

## v1 scope
- 3 players, one creature, one round
- Fixed armature with exactly 3 attachment segments
- One deterministic gesture→limb mapping; GIF export

## Out of scope
- Textures, colors, faces, sound
- More armatures or segment counts
- Re-recording after assembly, spectators

## Risks & unknowns
- iOS requires an explicit motion-permission tap; UX friction.
- Cross-device accelerometer normalization — will everyone's 'big swoop' scale comparably?
- Whether the mapping is legible enough that players feel ownership of their limb.

## Done means
Three phones each record a 10-second blind motion gesture; the host assembles the three segments into one animated 3D creature that visibly reflects each player's motion, and exports a single looping GIF that all three players can save.
