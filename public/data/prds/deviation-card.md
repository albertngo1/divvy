## Overview
A 3–4 player room-sweep game where the *error* in your phone's compass is the only signal. Players spin in place at candidate spots; the phone silently compares the magnetometer's reported heading against the gyroscope's integrated rotation. Where they disagree, there is iron: a radiator, a fridge, a laptop, rebar in the wall. Each player is secretly assigned to hunt either the *most* magnetically corrupted spot in the room or the *truest* one, then plants a flag. For groups who like their party games physical and slightly occult.

## Problem
Sensor party games almost always use the compass as a pointer — aim at a thing, claim a sector. That's a reskinned d-pad. Meanwhile the genuinely weird fact about phone compasses (they are wrong, locally, in ways that map the building) goes unused. And nobody knows their own room's magnetic geography, so the board is fresh in every living room, with zero props and zero setup.

## How it works
1. **Calibrate.** Host TV picks a neutral spot (middle of the floor). Everyone spins there once. Each phone stores its own personal baseline residual — devices differ wildly, so scores are only ever compared to your own baseline.
2. **Deal goals.** Each phone privately shows one card: **IRON** (plant your flag on the highest-deviation spot) or **TRUE** (lowest). Split is roughly even, never revealed.
3. **Sweep (90s).** Players wander independently. At any spot you hold the phone flat and do one slow 360° body spin. The phone integrates `rotationRate.alpha` from `devicemotion` to get true yaw, and compares it to `webkitCompassHeading` / `deviceorientationabsolute` alpha. After removing the best-fit linear ramp, the max residual is the deviation score.
4. **Private display.** Phone shows only: your goal card, your current spot's score as a needle against *your* baseline, and your two banked flags. You never see anyone else's numbers.
5. **Host TV shows** only an anonymous live bar of "spots swept: 7" and a coarse warmth ring per player position — enough to see someone crouching suspiciously by the fridge, not enough to know why.
6. **Reveal.** Everyone plants a final flag. TV redraws the room's true anomaly map from all pooled sweeps and scores each flag against the player's hidden card.

The bluffing is bodily: hovering near the oven is loud, and could mean either goal.

## Technical approach
Host browser tab + phone PWAs over a PartyKit Durable Object (one object per room code). Roles: `host`, `player`.

Data model: `Room { code, phase: 'lobby'|'calib'|'sweep'|'reveal', players: { id, name, goal: 'iron'|'true', baseline, flags: [{spotLabel, score, ts}] } }`.

Sensor math stays **on the phone** — raw heading streams are private and would be 30Hz of noise across the wire. Each phone publishes one small message per completed spin: `{spotLabel, rawScore, normScore, quality}`. Server is authoritative on phase, timer, and flag acceptance.

The genuinely hard part is not sync — it's **spin validation**. A fast, tilted, or wobbling spin manufactures fake deviation. Gate each spin: integrated yaw within 340–380°, duration 4–8s, `beta`/`gamma` stable within ±15°, sample gaps under 60ms. Failures get a "re-spin" toast and are never published. Second hard part: iOS requires a user gesture for `DeviceMotionEvent.requestPermission()`, so permission must be captured in the join tap.

## v1 scope
- 3 players, one 90-second round, one flag each.
- Spots are self-named by tapping one of 6 preset labels ("couch", "kitchen", "door"…).
- Two goal cards only: IRON and TRUE.
- Reveal screen: bar chart of every swept spot, flags overlaid.

## Out of scope
Actual 2D room mapping, camera/AR overlays, multi-round scoring, tie-breaks, more than 4 players, saving a room's magnetic map between sessions.

## Risks & unknowns
Some Android browsers report a fused (already gyro-corrected) heading, which would erase the very disagreement the game measures — needs a device sniff and a fallback to raw-heading-vs-time jerk. Rooms with no ferrous mass at all produce a flat, boring map. Spinning 3 people in a small apartment invites collisions.

## Done means
On three different phones, a spot beside a refrigerator scores ≥3× each device's own open-floor baseline, in 5 of 5 trials; the spin-quality gate rejects a deliberately sloppy spin; and one 3-player round runs lobby→reveal with correct win/lose per hidden goal card.
