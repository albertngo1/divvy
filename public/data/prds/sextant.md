## Overview
A two-person cooperative aiming game where the room's walls and ceiling become a hemisphere of sky. Each round hides one virtual star at a specific azimuth+altitude. The trick: those two coordinates are split across two different phones. One player owns the horizontal bearing, the other owns the vertical pitch, and the star only locks when both are simultaneously correct. For small groups who like Spaceteam-style forced verbal coordination.

## Problem
Most 'aim your phone at the room' games give one phone the whole picture, so passing a single phone around loses nothing. The itch here is orthogonal decomposition: neither player holds a complete answer, so they *must* talk the room into alignment.

## How it works
Both players calibrate by pointing at the TV (zeroes compass alpha). The host TV shows a shared 'sky' — a faint dome over the room — plus a single blinking clue for the target star's position, but the clue is deliberately incomplete on-screen. Privately:
- **Phone A (Azimuth)** shows only a left/right needle: 'the star is 40° right of the TV.' Player A sweeps their body until their compass heading matches, then holds LOCK.
- **Phone B (Altitude)** shows only an up/down needle: 'the star is 25° above the horizon.' Player B tilts their phone (deviceorientation beta) until pitch matches, then holds LOCK.
The star on the TV brightens proportionally to how close the *combined* (heading, pitch) pair is to target. It captures only when BOTH phones report in-band for 1.5s. Because A can't see altitude and B can't see azimuth, they narrate to each other ('I'm locked left, you're still too low').

## Technical approach
Host tab + two phone PWAs + authoritative WS server (PartyKit / Durable Object over Tailscale Serve). Data model: `Room{ target:{az,alt}, phones:{A:{heading,locked}, B:{pitch,locked}} }`. Phones stream `deviceorientation` alpha (A) / beta (B) at ~30Hz; server computes angular error and broadcasts a single scalar 'brightness' to the TV. The genuinely hard part is compass drift and per-device alpha offset — solved by the mandatory 'point at the TV' zeroing and a slow low-pass filter on heading; a 3° hysteresis band prevents lock-flicker. iOS requires a tap-to-grant `DeviceOrientationEvent.requestPermission()`.

## v1 scope
- Exactly 2 players, one star, one round.
- Fixed azimuth/altitude target, ±5° tolerance, 1.5s hold.
- TV shows brightness meter + captured/failed.
- No score, no timer beyond a soft 60s.

## Out of scope
- 3+ players, constellations, multiple stars, leaderboards, sound.

## Risks & unknowns
- Compass jitter on cheap Androids may make holding within 5° frustrating; may need to widen band or add smoothing.
- Two players standing close can occlude each other's motion; requires physical spread.
- Beta pitch flips near vertical (gimbal) — clamp to 0–80°.

## Done means
Two phones on a real WS room, calibrate to the TV, and by talking (not screen-sharing) drive one star from dark to captured within 60s at least 3 of 5 attempts.
