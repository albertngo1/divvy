## Overview

A cooperative party game where the whole room is the interface. Each phone shows a compass; every round the server broadcasts a target bearing (e.g. "north-northeast, 22°"), and every player must physically point their phone in that direction within a tolerance window. All must land inside the window before a shared timer expires. Rounds escalate — tighter tolerance, weirder bearings ("152°"), moving targets that drift while you're aiming. The game only works because each player is holding their own phone; a single phone can't be pointed by six people at once.

## Problem

Compass sensor is on every smartphone since ~2012 and used by roughly nothing beyond map apps. Real-world spatial games (Ingress, Pokémon Go) use GPS but ignore heading. In the party-game space, "physical movement" games mean loud, breakable things (Twister, charades) — no one has explored subtle whole-room physical coordination via phone heading. This turns the couch/kitchen/backyard into a game board using data the phone already has.

## How it works

Room code join. Everyone opens on their phone, allows compass permissions (iOS: `DeviceOrientationEvent.requestPermission`). Round 1: all phones show a compass rose with a target arrow pointing NNE (22°), tolerance ±15°. When every phone reads a heading within tolerance, the shared timer freezes and the group scores a "star". Round 2: tolerance shrinks to ±10°. Round 3: bearing drifts slowly during the round. Round 4: bearings assigned individually — everyone gets a different heading, must all hit simultaneously. Rounds 5+: pattern challenges ("spell a hexagon" — each player takes a corner). Session = 8 rounds, party score = stars earned.

## Technical approach

PartyKit or homelab Socket.IO. Room state = `{round, target_bearings: {player_id: degrees}, tolerance_deg, scored, elapsed}`. Client reads compass via `DeviceOrientationEvent.alpha` (with `webkitCompassHeading` fallback for iOS). Emits `heading_update` at 5Hz (rate-limited); server checks all players in tolerance simultaneously and broadcasts `round_scored` when all pass. No AI needed. Bearing sequences precomputed per round or randomly generated per session with a seed. Small optional visual: an arrow that turns green when in tolerance, gray when off.

## v1 scope

4 fixed rounds (single bearing all players, tolerance 15°/10°/5°, one moving-target round). 3-8 players. 90-second timer per round. Score = rounds cleared out of 4. No pattern/individual-bearing rounds, no session persistence, no sensor calibration UI, no landscape lock. Web only. iOS gesture required for permission at join.

## Out of scope

Individual bearings per player, "spell a shape" pattern rounds, GPS integration, difficulty tiers, replay history, custom bearing sequences, tournament mode, spectator visualizer. Also excluded: any UX for out-of-the-room players (all players must be in the same physical space).

## Risks & unknowns

Compass accuracy varies wildly across phone hardware — an iPhone 12 vs an older Android could differ by 5-10°, blowing out the tolerance. May need per-phone calibration (figure-8 gesture at start) OR generous tolerance that gets tighter across rounds. iOS `requestPermission` is a UX hurdle — must fire during a user gesture (join tap). Older Androids expose `alpha` in the wrong reference frame; needs `deviceorientationabsolute` or manual normalization. Playtest question: is "point your phone north" actually fun for more than 2 rounds, or does the novelty wear off in 30 seconds? The escalation (moving targets, patterns) may or may not save it.

## Done means

4 friends open the room, grant compass permission, and physically point their phones through 4 rounds of increasing difficulty in a single ~5-min session. If they walk around trying to face NNE while laughing, v1 shipped. If they all just sit still and rotate wrists — probably shipped too, but hunt for the walking-around variant.
