## Overview
Backlash is a 3–4 player cooperative concurrent-room game for a TV + phone controllers. Players line up side-by-side to become a mechanical gear train, and each phone is one gear you drive by physically spinning the handset in flat circles (like polishing a table). It's a party toy for people who like looking ridiculous together.

## Problem
Sensor party games lean on aim (compass) and loudness (mic). The gyroscope's *rotation rate* is almost never used, yet it captures something viscerally physical: which way and how fast you're twisting. Backlash turns that into the itch — everyone is furiously spinning, but spinning correctly relative to an invisible neighbor you can't fully see.

## How it works
Players stand in a fixed left-to-right line; positions are locked at join and define the gear order (the line IS the board). The host TV shows an animated gear train: a driver gear at the far left turning at a set speed, and the goal of transmitting torque all the way to a load at the right end.

Real meshing gears alternate direction: gear 1 clockwise → gear 2 counter-clockwise → gear 3 clockwise. Each phone PRIVATELY shows only two things: (1) your required spin direction this round (a big CW or CCW arrow), and (2) a live "mesh gauge" — are you matching the SPEED of the neighbor to your left? It never shows the neighbor's actual reading, only closer/faster/slower. You spin the phone flat about its vertical axis; `rotationRate.alpha` gives signed angular velocity (sign = direction, magnitude = speed).

The train "turns" only while every adjacent pair is (a) opposite in direction and (b) speed-matched within tolerance. The host shows torque propagating gear by gear; a mismatch anywhere stalls everything downstream and the offending mesh sparks red. Win = keep the load spinning for 8 continuous seconds.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `players[]` with `{seat, requiredDir, angularVel, ts}`; server holds `train` state. Phones sample `devicemotion` `rotationRate.alpha` at ~30Hz, low-pass filter, and send signed rad/s at 15Hz. Server computes each adjacent mesh's direction-agreement and speed delta, propagates torque, and broadcasts train state + each phone's private mesh-gauge delta. The genuinely hard part: cross-device gyroscope scale/units differ (deg vs rad, sampling jitter), so a 3-second calibration "spin steadily" step normalizes each phone's magnitude to a personal baseline before play.

## v1 scope
- 3 players, one straight gear train, one round.
- One fixed driver speed; symmetric tolerance.
- CW/CCW arrow + mesh gauge only; 8-second hold to win.
- iOS motion-permission tap gate at join.

## Out of scope
- Branching gear trees, variable ratios, gear-swapping mid-round.
- Scoring/leaderboards; multiple rounds.
- Fancy 3D gear rendering (2D top-down is fine).

## Risks & unknowns
- Sustained circular spinning may tire arms fast — cap rounds short.
- Gyroscope drift/units vary wildly; calibration must be robust.
- Distinguishing intended spin from hand wobble at low speeds.

## Done means
Three phones calibrate, each shows a private direction + mesh gauge, and when all adjacent pairs spin oppositely and speed-matched for 8s the host's load gear locks green — verified on two different phone models.
