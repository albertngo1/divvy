## Overview

A 90-second scramble for 3 players. The host TV is a single camera hovering over one wide animated scene (a chaotic house-party kitchen, four zones). Each phone is a photographer with a **private subject** and a **private early-warning buzz** telling them their subject is about to do something worth shooting. The lens is capacity-1. Everyone needs it *now*.

## Problem

Co-op party games almost always reward everyone leaning in at once. Nothing models the actual comedy of a shared, capacity-1 resource — one remote, one aux cable, one camera — where the failure isn't laziness, it's three people helping simultaneously.

## How it works

**Host TV (public):** the scene, rendered as if through one camera currently framed on one of four zones. Incidents fire every 3-8s somewhere in the scene — the dog gets on the counter, someone uncorks the wrong bottle — each peaking in a 1.2s window. If the camera is on that zone during the peak, the incident is captured on film and everyone sees it. The TV also shows a running film strip of captured shots and a fat SMEARED counter.

**Each phone (private):** your subject card ("the guy in the green apron"), a 4-zone aim pad, a private warning meter that fills ~2s before *your* subject acts (plus haptic buzz), and your own tally. Only shots of **your** subject score for you. Nobody sees anyone else's subject or warning.

**The collision rule:** an aim request repoints the camera in a 350ms pan. But if two different phones' requests land within a 400ms window of normalized room time, the camera **whip pans** — blurs across the whole scene, lands on a random zone, 2.5s of unusable recovery. Every incident peaking in that window is burned for everyone. Requesting the zone the camera is already on is free and never collides.

Scoring is individual (+1 captured, -1 burned window that was yours), so the room must verbally reserve the lens out loud — "MINE, three seconds" — while their private buzzers all go off at once.

## Technical approach

PartyKit Durable Object per room, 20Hz authoritative tick. `Room {seed, cameraZone, panUntil, recoverUntil}`, `Player {subjectId, captured[], burned}`, `Incident {id, zone, subjectId, tStart, tPeak}`. The incident schedule is seeded so the host renders animation from `seed` + the server's event stream.

Fair simultaneity is the hard part: each phone runs a 5-ping min-RTT offset handshake at join; aim requests carry client send time, the server converts to room time, buffers 450ms, then resolves — ≥2 distinct players in one 400ms bucket = whip pan. The 350ms pan animation masks the buffer, so honest requests feel instant. Rate-limit aim to 1/700ms per phone so mashing can't grief.

## v1 scope

- 3 players, 4 zones, one 90s round, 12 incidents
- Subjects are named colored dots; scene is CSS/canvas shapes, no art
- One collision channel (aim only) — no separate shutter button
- Post-round screen only; no lobby, no rematch

## Out of scope

Zoom/tilt, real video, spectators, multi-round tournaments, mobile host, subject-guessing meta-round.

## Risks & unknowns

400ms may punish honest turn-taking into misery — tune 250-600ms live. iOS Safari haptics are unreliable; fall back to a flashing bar plus a private earcon. Players may stare at their phone instead of the TV — keep the phone deliberately information-poor (no scene mirror).

## Done means

Three phones and a laptop: two players tapping different zones within 400ms produce a visible whip pan on the TV, both lose their peaking windows, and the post-round screen attributes each burned shot to the exact collision that caused it.
