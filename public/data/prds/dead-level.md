## Overview

**Dead Level** turns your phone into a two-axis inclinometer and your home into a survey site. Three players each receive a *different* private target — a slope magnitude plus an absolute downhill bearing — and must roam the house placing their phone flat on real surfaces until one of them matches, then keep hands off for three seconds while everyone else's walking shakes the floor. For people who never noticed that no table in their house is level.

## Problem

Room-scale party games use the room as scenery: stand here, point there. But every real house already contains a rich hidden dataset — the specific sag of the coffee table, the settle of the floor near the doorway, the tilt of the window sill — and nothing reads it. The itch: a board that already exists, that the host didn't design, and that nobody in the room has ever measured.

## How it works

**Survey sweep (30 s, all phones at once).** Each phone privately instructs its owner to place it on any three surfaces for 2 s each. The server harvests every reading and learns the actual distribution of (slope, bearing) in *this* house. Targets are then generated only from geometry the room provably contains — no impossible hunts.

**The round (60 s).** Each phone privately shows: your target as a dial (`1.6° ± 0.5`, downhill arrow at 350° ± 25°), your live slope+bearing needle, a **HANDS OFF** state, and a 3 s hold ring. The host TV shows only three lock lamps, a shared "floor is shaking" tremor bar, and the countdown. It never shows anyone's target or reading, so nobody can shoulder-surf a solution.

Two mechanics make it a game rather than a scavenger hunt. First, **holding it doesn't count**: hand tremor is 8–12 Hz and shows a variance an order of magnitude above a placed phone's noise floor, so the server rejects any hold whose jitter exceeds the per-device floor learned during the sweep. You cannot fudge a reading by tilting your wrist. Second, **the floor is a shared medium**: while your phone sits on a table waiting out its 3 s, someone stomping past registers as jerk on *your* accelerometer and voids *your* hold. Late in a round, everyone still searching is actively destroying the person who's nearly done — so the room fills with hissed "stop moving" while one player creeps.

Coarse (slope, bearing) grid cells are claimed by whoever locks first, so a near-collision between two players' targets forces the loser to go discover the house's *second* surface with that geometry.

## Technical approach

Host tab + phone PWAs + a Socket.IO server behind Tailscale Serve (LAN-only is fine; no public exposure needed).

Phones sample `devicemotion` at 60 Hz and compute, over a 1 s window: gravity vector from `accelerationIncludingGravity`, slope = `acos(gz/|g|)`, in-plane downhill direction = `atan2(gx, gy)`, jitter = σ of `|g|`, plus absolute heading from `webkitCompassHeading` (or `deviceorientation.alpha`) to rotate the downhill vector into room-absolute bearing. Frames post at 8 Hz as `{slopeDeg, bearingDeg, sigma, seq}`.

Model: `Room { phase, floorProfile[], claimedCells:Set, players: { id, target{slope,bearing,tolS,tolB}, holdSince, sigmaFloor, locked } }`. The server owns hold timing and match tests; clients only render.

Hard part: the compass. Placing a phone on a metal-legged table or next to a radiator throws heading by tens of degrees, which is exactly where the interesting slopes live. Mitigations: generous ±25° bearing tolerance, a 3 s trimmed-mean heading, rejecting holds where magnetometer magnitude deviates >25% from the sweep's median, and a visible `MAGNETIC — MOVE IT` state so the distortion becomes flavor instead of a silent bug.

## v1 scope

- 3 players, one 60 s round, one target each
- 30 s survey sweep generating targets from real measured geometry
- Tolerances ±0.5° slope, ±25° bearing, 3 s hands-off hold
- Host TV: three lock lamps, tremor bar, countdown, finish order
- Reject held phones via jitter threshold; void holds on floor jerk

## Out of scope

- Scoring, multiple rounds, cross-room leaderboards
- Cooperative or team variants
- Any surface identification ("the coffee table") — geometry only
- Wedging a coin under a corner to fabricate a slope: legal in v1

## Risks & unknowns

A rented-flat floor may be suspiciously flat, collapsing the target space — the sweep will reveal this immediately and the tolerance must shrink to compensate. Compass distortion indoors is the real threat. Accelerometer bias varies per handset, so slope is only trustworthy as a *relative* measure against that phone's own sweep. Hard floors may transmit footsteps so well that no hold ever completes; carpet may transmit nothing, killing the interference mechanic. iOS gates `devicemotion` behind a permission gesture.

## Done means

In one real living room, three phones each lock a *distinct* real surface within 60 s. A phone held in a steady hand never locks across 10 attempts. Walking heavily within 2 m of a phone mid-hold resets its ring within 300 ms, visible on both the phone and the TV's tremor bar. Re-running the game in a second room generates different targets without a code change.
