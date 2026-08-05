## Overview

A co-operative, 4-minute physical puzzle for 3–5 people in one room. Each player's phone is privately assigned a resting attitude — a pitch and roll it must be *left sitting at*, unheld, on some real surface in the room. Win condition: all phones seated simultaneously for five continuous seconds. It's for groups who like Jackbox but are tired of typing jokes into a keyboard; this one ends with four adults on the floor negotiating over a couch cushion.

## Problem

Party games treat the phone as a keyboard and the room as a couch. The accelerometer is the most universally available, best-supported sensor on earth and almost nobody uses it for anything but shake-to-undo. Meanwhile the room itself — its slopes, its soft furniture, its floating floor — is a rich shared board that's already in the house and costs nothing to ship.

## How it works

1. Each phone privately draws a **bubble level**, centred on *its own* secret target (pitch 0–70°, roll ±45°, tolerance ±4°). Because the bubble is drawn relative to your target, it looks like an ordinary spirit level — you never learn the absolute angle you're chasing, so you can't just tell someone "I need 40 degrees."
2. **Seated** = both axes inside tolerance AND high-passed accelerometer jerk under a hands-off threshold for 1.5 s continuous. Holding it doesn't count. You have to build a rig: a book under a phone edge, a phone wedged in a sofa arm, propped on a stair nose, leaned on a laptop lid.
3. The **coupling** is the whole game. Seating requires stillness, and finding a slope requires walking. The last player crossing the floor is the one who un-seats the first.
4. One **re-roll** per player if your angle has no home; costs 15 s off the shared clock.

**Phone (private):** your relative bubble, a hands-off indicator, your re-roll button. **Host TV (shared):** a row of N *unlabelled* lamps (how many are seated, never who), a room-wide wobble trace summing everyone's jerk, and the clock. Nobody is told whose phone just dropped — the room has to shout it out.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object. Attitude comes from `devicemotion`'s `accelerationIncludingGravity`, low-passed to a gravity vector: `pitch = atan2(-x, hypot(y,z))`, `roll = atan2(y, z)`. Deliberately no yaw — no magnetometer, no calibration, no compass drift. Sampled at 20 Hz on-device.

The phone evaluates `seated` locally and sends only *transitions* plus a 4 Hz wobble scalar, so traffic is tiny. The DO holds authoritative state and runs the 5-second all-seated timer on its own clock.

**The hard part is not sync, it's the grace window.** Strict simultaneity over lossy home wifi produces false failures that feel like cheating. The DO treats a player as seated if their last `seated:true` is under 400 ms stale, and requires a 250 ms sustained break before cancelling the timer. Too tight and packet loss loses you the game; too loose and you can cheat by snatching your phone up.

`Room { code, phase, allSeatedSince, players: { id, name, target{pitch,roll,tol}, seated, lastSeen, wobble, rerollUsed } }`

## v1 scope

- One round. 3–5 players. QR join, no accounts.
- Fixed 4-minute clock, one re-roll each.
- Win/lose only — no points, no leaderboard.
- Targets drawn from a hand-tuned table biased toward angles that exist in ordinary rooms.

## Out of scope

Multiple rounds, difficulty tiers, per-phone-case calibration, spectator view, sound design, anything using yaw or the magnetometer.

## Risks & unknowns

iOS 13+ demands a user gesture before motion events — a hard gate on the join screen. Some Androids deliver motion at 10 Hz or below. Very soft furniture may make *nothing* seatable; mitigate with an auto-widening tolerance if no player seats within 60 s. Accessibility: bias at least one target per game to table height so a player who can't get on the floor still has a home.

## Done means

Four phones, one real living room, five test groups: at least three win inside 4 minutes, and the server log shows at least one round lost by a `seated→unseated` transition occurring within 500 ms of a different player's seat event — i.e. the room genuinely knocked itself over.
