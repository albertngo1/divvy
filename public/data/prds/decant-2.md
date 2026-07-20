## Overview
A 3-4 player physical party game where each phone is a private glass of virtual water and the room is the plumbing. Players stand at fixed spots around a coffee table or in a loose ring; the shared TV is the reservoir gauge everyone glances at. For groups who like fidgety, wordless-coordination games (Camber, Ballast) but want a resource-flow puzzle instead of a balance one.

## Problem
Tilt-controlled games almost always drive one shared object on a screen. Nobody uses the accelerometer AND the compass together to make *which direction you physically tilt, relative to where a person is standing* mean something. Decant makes your body orientation the routing table: pouring 'left' is meaningless; pouring 'toward Sam' is the move.

## How it works
At setup, each phone calibrates by pointing at the TV (zeroes compass), then the host assigns everyone a clock position in the ring so the app knows the fixed bearings between every pair of spots. Each player secretly gets a **target fill line** (e.g. 30%, 70%) shown only on their phone. Everyone starts at 50%.
To play, you tilt your phone like a real cup toward a neighbor. The app reads tilt magnitude (pour rate) and combines your live compass heading with your spot to decide *which player you're pouring into* — you must physically turn to face them. Water drains from you, fills them. Overshoot your own line and you must beg others to pour back.
PRIVATELY each phone shows: its own current level, its secret target line, and a subtle 'you're facing → Sam' label. The HOST screen shows only anonymized level bars (no names, no targets), so nobody can see whose glass is whose. Win when all glasses sit within ±5% of their private targets for 3 seconds.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Sensors: `DeviceMotion` (accel → tilt vector) and `DeviceOrientation` (alpha heading). Data model: `players[]` = {spotAngle, level, target, facingHeading, pourRate}. Each phone streams (tilt, heading) at ~20Hz; server resolves target-neighbor by nearest fixed bearing, applies conservation-preserving transfers (drain-source = fill-dest, clamped 0-100), broadcasts the anonymized bar array to the host at 10Hz. The genuinely hard part is **conservation under lag**: transfers must be server-authoritative and idempotent per tick so two simultaneous pours can't create or destroy water, and compass drift between cheap Android sensors must be tamed by the TV-zeroing step plus a dead-zone so small turns don't mis-route a pour.

## v1 scope
- 3 players, one round, one set of random targets.
- Fixed triangle spots, bearings hard-set from the assigned clock positions.
- Pour = tilt past 20° toward a neighbor; single global pour rate.
- Win = all three within ±5% for 3s; host shows three anonymous bars + a win flash.

## Out of scope
- More than 4 players, moving spots, obstacles, 'spill/evaporation' decay.
- Any player-name reveal, scoring history, multiple rounds.

## Risks & unknowns
- Compass accuracy indoors near metal/TVs may mis-route pours; dead-zone + re-zero mitigates.
- Two players facing each other pouring simultaneously could oscillate; server damping needed.
- Is 'aim by turning your body' legible enough without an on-phone map? Needs a playtest.

## Done means
Three phones on one WebSocket room reach and hold all-within-target for 3s within 90 seconds, using only body-turning + tilt, with server-verified total water conserved to ±0.5% across the round.
