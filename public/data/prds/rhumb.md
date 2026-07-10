## Overview
Rhumb is a silent anti-coordination party game for 4–6 people standing in a room. Each phone is a private compass; the room's 360° is carved into eight 45° sectors, and everyone must end up facing a sector nobody else is facing. It's for groups who want a tense, funny standoff with zero screens-in-the-middle and no talking.

## Problem
Most "don't pick the same thing" games (like the classic where matching answers score zero) run on written guesses. The itch: make anti-coordination *physical and continuous* — you commit by pointing your body, you can adjust in real time, and you can watch everyone else's shoulders but never see their screen. Compass heading is the perfect hidden-but-embodied signal.

## How it works
Players stand roughly in a cluster, each holding a phone flat, pointing it away from their chest. Each phone PRIVATELY shows only ITS OWN current sector (a big compass wedge, 1–8) and whether it's currently "clean" or "contested" — pulsing red if it shares a sector with anyone. Crucially it does NOT show who the rival is or which other sectors are taken.

The shared host screen shows only an anonymous tally: a ring of eight sectors, each lit as EMPTY, CLAIMED (exactly one player), or CONTESTED (two or more) — but not identities. Players read the room with their eyes (who's facing where) and their own red pulse, then physically rotate to hunt an empty sector. A round resolves when, for a continuous 4 seconds, every player occupies a distinct sector. With 4 players and 8 sectors it's solvable but jittery, because two people creeping toward the same gap cancel each other.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Phones read `deviceorientation` `alpha` (compass heading), quantize to a sector, and send it at ~8 Hz. Data model: `Room { players[], settleStartTs }`, `Player { id, heading, sector }`. Server computes per-sector occupancy, derives each player's contested flag, and detects the all-distinct-for-4s win. The hard part is heading reliability: `webkitCompassHeading` vs `alpha` differ across iOS/Android and drift near metal/speakers, so v1 includes a one-tap "calibrate: everyone face the TV" that zeroes each phone's offset to a shared reference, and applies hysteresis so a player straddling a sector boundary doesn't flicker.

## v1 scope
- 4 players, 8 fixed sectors, single round.
- Calibrate-to-TV zeroing, per-phone sector + clean/contested pulse.
- Host ring showing empty/claimed/contested, anonymous.
- 4-second all-distinct win detection.

## Out of scope
- Scoring, multiple rounds, variable sector counts, tilt/pitch.
- True north accuracy, magnetic-interference mapping.

## Risks & unknowns
- Compass drift/metal interference could make sectors unstable; mitigate with calibration + hysteresis + generous 45° sectors.
- iOS requires a user gesture + permission for `deviceorientation`; handle in the join flow.
- Players standing shoulder-to-shoulder may all read similar headings — encourage spreading, which is the point.

## Done means
Four phones calibrated to the TV: each player sees only their own sector and a red pulse when shared, the host ring reflects live occupancy anonymously, and turning their bodies until all four hold distinct sectors for 4 seconds flips the host to a win screen — with no phone ever revealing who is where.
