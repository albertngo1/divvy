## Overview

A 90-second standing party game for 3–5 people in one room, played on a shared TV plus a phone each. Every phone is a compass that has been sabotaged: instead of north, its needle tracks the *heading difference* between you and one secretly assigned other player. Finding out who that is means correlating an invisible instrument against visible human bodies — while someone is doing the same to you.

## Problem

Compass/orientation is the most-installed, least-used sensor on a phone. Every game that touches it turns into "point at the treasure," which is a solo scavenger hunt with extra steps. Nothing uses the fact that in a room full of people, *rotation is public* — you can see someone pivot — but *what their rotation means to your device* is private. That gap is a whole game and nobody has taken it.

## How it works

1. Players stand anywhere in the room, phone held flat like a compass. Host calibrates each phone's heading zero.
2. The server assigns a single hidden cycle: A tails B, B tails C, … Z tails A. Nobody tails themselves; everyone is tailed.
3. **Private on each phone:** one needle, drawn in your own body frame, at angle `θ(mark) − θ(you)`. Nothing else. If you pivot 40° left, the needle sweeps 40° right — your own motion drowns the signal. If you freeze and the needle twitches, *your mark just turned* — and you have to catch which body in the room moved.
4. **Public on the TV:** the round timer, a room-wide "total rotation" bar, and forced-turn beats. Never a heading, never a name.
5. Every ~15 s the TV calls **ALL TURN**: change heading by ≥30° within 3 seconds or drop a point. This injects mandatory noise so no one can win by standing frozen for 90 seconds.
6. Geometry is the board. To correlate needle twitches against bodies you must be able to *see* people; to hide your own turns you want to be behind someone or facing away — which blinds you. Corners are safe and useless.
7. At time-up, each phone privately names its guess. +3 for naming your mark, +2 for not being correctly named.

## Technical approach

Host browser tab + phone PWAs + one authoritative room object (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve for a LAN night).

Data model: `Room { code, phase, players[{id, name, heading, lastSeen, compliance}], marks: Map<id,id>, beats[] }`. Phones sample `deviceorientationabsolute` (Android `alpha`) or `webkitCompassHeading` (iOS, gated behind `DeviceOrientationEvent.requestPermission()` on a tap) at 20 Hz, low-pass with a 100 ms EMA, and send only heading deltas since round zero.

Key simplification: **the game needs relative heading, not true north.** Every reading is a delta from a per-round zero, so magnetic declination, hard-iron distortion from the fridge, and Android's absent absolute-orientation support all stop mattering. Drift over 90 s is small enough to ignore.

The genuinely hard part is perceptual latency, not throughput. Correlation dies above roughly 150 ms end-to-end, so the server fans out headings at 20 Hz over WebSocket and each phone renders its needle with a 60 ms client-side prediction using its own live sensor for the `−θ(you)` term (local, zero-latency) and the last server value for `θ(mark)`. Second hard part: tilt. A phone held at 30° pitch aliases pitch into heading; clamp readings and show a "hold it flat" nag when `beta` exceeds 25°.

## v1 scope

- 4 players, one 90-second round, one hidden cycle.
- One needle, one guess screen, one scoreboard.
- Three forced-turn beats.
- No accounts, no avatars, room code only.

## Out of scope

- Teams, multiple rounds, tailing chains longer than one hop.
- Decoy needles, jamming powers, or fake marks.
- Any use of position — bearing only, never distance.

## Risks & unknowns

- iOS permission gesture is an ugly onboarding step; needs a one-tap "Calibrate" that doubles as the prompt.
- Cheap Android magnetometers can jitter ±8°; may need gyro integration with slow magnetometer correction.
- Does self-motion make the needle *too* unreadable? Playtest a toggle that briefly zeroes the needle for 400 ms after your own large turn.

## Done means

Four phones in one living room, one 90-second round. At least two of four players correctly name their mark, at least one is wrong, and the post-round conversation is people re-enacting their own turns to prove what they saw. Needle-to-body latency measured under 150 ms on the slowest phone present.
