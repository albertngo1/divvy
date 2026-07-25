## Overview
Cold Shoulder is a 4-player, one-round deduction game for a living room, played entirely with the phone's compass. Everyone is publicly asked to point at real objects in the real room. Privately, each phone has blacked out a 60° wedge of that room — a direction you are not allowed to point. The fun is watching someone give a slightly wrong answer, and figuring out what they're steering around.

## Problem
Compass games so far are "aim at a person" or "claim a sector" — the sensor produces the whole game. Here the compass produces a *constraint*, and the actual content is people arguing about why Dana pointed at the radiator instead of the obviously-oldest grandfather clock. It also solves the classic hidden-role problem where the imposter has nothing to physically do: here everyone has a secret, everyone must dodge, and the tell is behavioral, not verbal.

## How it works
**Zeroing (10s).** TV shows a big target. Each player points their phone at the TV and taps ZERO. This captures a per-device heading offset so all four phones share one room-space coordinate frame. Players then spread out anywhere — no circle required.

**Private state.** Each phone shows a compass ring with a live needle and one shaded red arc (60° wide, random center, different per player). That's it. It never shows other players, other arcs, or the prompt count.

**Public state.** The TV shows the current prompt and a countdown. Three prompts, 12s each: *"Point at the oldest thing in the room." / "Point at where you'd hide." / "Point at the thing most likely to break tonight."* Everyone aims and taps LOCK (auto-locks at 0). If your needle is inside your red arc at lock, your phone flashes BURNED and you take −2, silently.

**Reveal.** After each prompt the TV draws all four locked headings as named arrows on a simple top-down room stub. Arrows are directions, not objects — so each player must say out loud what they claim they pointed at, and the room can look and disagree. That's the bluff surface.

**Endgame.** TV randomly names one player the Suspect. Everyone else privately rotates their phone and locks a guess at the Suspect's arc center. Within 30° = +1 to the guesser. The Suspect scores +1 per wrong guesser.

## Technical approach
Host browser tab + phone PWAs + one PartyKit Durable Object per room. Heading from `deviceorientationabsolute.alpha` (Android) or `webkitCompassHeading` (iOS, behind `DeviceOrientationEvent.requestPermission()` on a tap). Phones stream `{playerId, heading}` at 10Hz; server keeps `players[{id, zeroOffset, arcCenter, locks[], burned}]` and is authoritative on lock timestamps and scoring. Host renders from server state only — it never receives arc centers until reveal.

Genuinely hard part: indoor magnetometers are liars. Speakers, laptops, rebar and radiators bend headings by 20–40°, and drift accumulates. Mitigations: re-zero prompt before *every* round ("face the TV, tap"), a deliberately fat 60° arc, 30° guess tolerance, and a low-pass filter with an outlier reject on the heading stream. If a phone's heading variance while stationary exceeds a threshold, the TV tells that player to move two steps and re-zero.

## v1 scope
- 4 players, exactly one round, three prompts, one Suspect
- Hardcoded prompt list of 8, pick 3 at random
- Fixed 60° arcs, random centers, no overlap check
- One host screen: prompt, clock, arrow diagram, final score
- No lobby art, no avatars, no sound

## Out of scope
- More than one Suspect, multi-round, arc shapes other than a wedge
- Anything using pitch/tilt
- Reconnect handling beyond "refresh and re-zero"

## Risks & unknowns
- Magnetic distortion may make arrows visibly wrong, killing trust in the reveal
- iOS permission gesture friction at join time
- Players may just stand still and point lazily; needs the prompts to be genuinely object-specific

## Done means
Four phones on one Wi-Fi, all zeroed within 5°, complete three prompts, and the TV draws four arrows that observers in the room agree match where people were actually pointing — and at least once, a player is caught dodging.
