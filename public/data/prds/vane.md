## Overview
Vane is a 3–5 player concurrent-room game where each phone becomes a compass needle. Players physically rotate their handset to aim at a heading, silently racing to occupy DISTINCT sectors of a shared compass rose. It's for groups who like a game that gets them physically turning in place, not just tapping.

## Problem
Anti-coordination games usually live in the abstract (grids, channels, numbers). The itch here: make the collision *physical and embodied* — you feel other people crowding your direction because you can literally see them turning the same way you meant to, and you have to bail. It's charades-energy with a magnetometer.

## How it works
The host TV shows a single compass rose divided into 12 sectors (30° each). Every player holds their phone flat and rotates their whole body/hand to steer a live needle.

Privately, each phone shows: (1) its own live heading needle and current sector, (2) a SECRET constraint dealt at round start — e.g. "you must land in a NORTHERN sector" or "within 60° of due-East" — so nobody can just fan out evenly; the legal arcs overlap and force real deduction, and (3) a LOCK button.

On a shared 5-second countdown, all needles freeze. The TV reveals every claimed sector at once. Any sector claimed by 2+ players flashes red — both those players bust and score zero, and they never knew who was coming because no phone shows anyone else's heading. Win = all players in distinct sectors, each satisfying their private constraint. The tension is that the constrained arcs collide, so silently guessing which legal sector nobody else is forced into is the whole game.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{players[], phase, seed}`, `Player{id, headingDeg, sector, constraint, locked}`. Phones read `DeviceOrientationEvent` (relative yaw), calibrated to a zeroed reference at join so we never trust raw magnetometer. Phones stream heading at ~15Hz; server keeps only latest and broadcasts nothing about others' headings until the freeze. On lock/timeout, server bins each heading into a sector, computes collisions, emits the reveal. Hard part: heading drift and indoor magnetic noise — solved by using relative gyro yaw + a per-player recalibrate gesture, and by making sectors coarse (30°) so small drift doesn't flip bins.

## v1 scope
- One round, 3–4 players.
- 12 fixed sectors, one secret constraint per phone from a small hand-authored deck.
- Single 5-second freeze, binary win/lose.
- Relative-yaw only; a "tap to recalibrate to forward" button.

## Out of scope
- True absolute compass / geographic north.
- Elevation/pitch, multi-round scoring, tie-breaks.
- Anti-cheat against peeking at neighbors.

## Risks & unknowns
- iOS requires a permission tap for orientation events; Android quirks in axis sign.
- Gyro drift over a 20-second round — recalibration must be dead simple.
- Is silent physical turning legible enough that people *feel* the collision, or does it need a haptic "someone's near your bearing" tell (deliberately omitted in v1)?

## Done means
Four phones each show an independent live needle; on the freeze, two phones aimed within the same 30° sector both flash red on the TV and score zero, a fully-distinct legal spread shows an all-green win, and headings survive a 20-second round without a bin flipping from drift alone.
