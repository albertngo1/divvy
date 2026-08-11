## Overview

A 90-second cooperative constraint game for 3 people standing in one kitchen or hallway. Each player claims a hinged thing in the room — a cabinet door, the fridge, the oven, a bedroom door, a laptop lid — and holds their phone flat against the panel. The phone's magnetometer becomes a hinge encoder: the room's actual doors are the game's analog dials.

## Problem

Sensor party games almost always read tilt (gravity) because it's easy. But a door rotates about a *vertical* axis, so the accelerometer is blind to it and only the compass can see it — a genuinely underused reading. Meanwhile most "room as board" games treat the room as scenery. Here the furniture is the input device, and there is no version of this that works with one phone passed around: you cannot hold three doors at once.

## How it works

1. Join by 4-letter code on the host TV. Each player walks to a hinged object, closes it fully, holds the phone flat to the panel, taps **Zero**. That heading becomes 0°.
2. Opening the door rotates the phone; `angle = shortestDelta(heading, zero)`, clamped 0–120°.
3. Each phone PRIVATELY shows: your live angle in degrees, one constraint sentence naming other players ("Be wider open than Ana", "Stay under 30° while Sam is over 60°", "Be the middle one"), and a green/red dot for your own constraint only.
4. The host TV PUBLICLY shows: three unlabeled arcs sweeping live as doors move, a 90s clock, and a single number — how many of three constraints are currently satisfied. Never which ones, never whose.
5. Win when all three are satisfied simultaneously for 3 continuous seconds. Since nobody can see the constraint graph, the room has to talk: "I need you wider." "I can't, I'm capped."

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object per room.

- Phone: `DeviceOrientationEvent` — `webkitCompassHeading` on iOS (behind a tap-gated `requestPermission`), `absolute:true` alpha on Android. Median-of-5 filter, emit on >1° change, ~10 Hz.
- Server state: `{players: {id, name, zeroHeading, angleDeg, updatedAt}, constraints: [{ownerId, predicateId, argIds}], holdSince}`. 100 ms tick evaluates predicates, broadcasts a *public projection* (arcs + satisfied count) to the host and a *private projection* (own boolean + hold progress) to each phone.
- Constraint generation: sample 5 templates, verify by 5°-grid search that a joint solution exists and that no player can satisfy alone.
- Hard part is not latency — it's sensor trust. Steel door frames and a running fridge bend the magnetometer by 10–30°, iOS smooths heading with ~300 ms lag, and readings drift over 90 s. Mitigations: ±4° hysteresis on every predicate edge, a re-Zero button that doesn't cost the clock, and the 3-second hold requirement acting as a natural low-pass so a flickering reading can't strobe the win.

## v1 scope

- 3 players, one round, 90 seconds, five constraint templates.
- Room code join, Zero step, play, win/lose screen. Nothing else.
- Host TV: three arcs, clock, satisfied count.

## Out of scope

Multiple rounds, scoring, 4+ players, spectators, reconnect, sound design, auto-detecting magnetic interference, any device without an absolute compass (tell them to borrow a phone).

## Risks & unknowns

- Fridge and steel frames are the biggest threat; the Zero step may need a "this spot is noisy, pick another door" warning based on variance during a 2s hold.
- Homes without three hinged things within earshot.
- Constraint sets that are solvable on paper but physically absurd (a door that only opens 20° before hitting a wall) — v1 caps predicates at 45°.

## Done means

Three people in one kitchen, each holding a phone to a different door, zero, negotiate, and get the TV to WIN inside 90 s. Regression test: a recorded triple of heading streams replayed into the server drives it deterministically to WIN at the same tick.
