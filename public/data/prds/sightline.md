## Overview
Sightline is a concurrent-room party game — a shared host screen (TV) plus every player's phone as a private compass sight. Four to eight friends sit in a loose ring; each phone quietly aims across the physical room at a secret human target. For groups who love the tension of a Werewolf night-kill but want it fast, physical, and wordless.

## Problem
Social-deduction games stall in talk. And the handful of "point your phone" games are cooperative — everyone converges on one shared bearing. Nobody has built the competitive version where each phone hides a DIFFERENT bearing and the room's seating IS the board. The itch: a duel you fight with your body, not your mouth.

## How it works
At round start the host shows a numbered seating ring; each player taps their seat, then calibrates by pointing their phone at the TV — this pins every phone's compass to a shared zero, sidestepping true-north drift. The host secretly assigns each player one target as a directed cycle, so everyone is someone's hunter and someone's prey.

PRIVATE on your phone: a single arrow and your target's name ("Aim at Priya"), plus a heat meter that fills as your heading converges on the bearing from your seat to theirs. You physically rotate to line them up; when your reticle holds on-target for 0.5s you "lock." You never see anyone else's target.

SHARED on the host: nothing but a countdown, then — after the draw — a slow-motion replay of who locked whom and when. You score if you locked your target before your hunter locked you. Ties, misfires (locking the wrong seat), and players who never drew get called out for laughs.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, one room per game). Data model: room {seats:[{playerId, angleDeg}], assignments:{hunter→prey}, locks:[{playerId, targetSeat, tMs}]}. Each phone streams compass heading (deviceorientationabsolute / webkitCompassHeading) at ~15Hz minus its TV-calibration offset, computes target bearing = atan2 of (prey seat − own seat) on the ring, decides lock locally, and sends only lock events — timestamped by server receipt to dodge clock skew. Genuinely hard part: iOS gates DeviceOrientation behind a user gesture, the compass is noisy and laggy, and mapping heading→seat needs a stable per-phone offset. The TV-calibration step plus a generous ±20° tolerance are the whole ballgame.

## v1 scope
- 4 players, one round, one simultaneous draw
- Fixed ring, tap-to-seat, tap-the-TV calibration
- One target each (a single directed cycle)
- Lock detection + server-ordered scoring + a replay list

## Out of scope
- Multiple rounds / elimination brackets
- Walking the room; standing players
- Compass auto-calibration; Android/iOS parity polish
- Anti-cheat on self-reported seats

## Risks & unknowns
Compass accuracy indoors near metal and electronics; whether ±20° feels fair or sloppy; iOS permission friction; whether players can physically distinguish 6–8 seats by heading in a small room.

## Done means
Four phones in a ring can each be handed a secret target, physically aim, and the host correctly reports — within one second — who locked whom first, producing at least one round with a clear winner and a laugh.
