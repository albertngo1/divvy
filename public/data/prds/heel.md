## Overview
Heel is a 3-player cooperative convergence game where each phone is a physical tilt-controller. Every player rolls their own invisible-to-others ball across one shared textured landscape shown on the TV, trying to make all three balls settle on the same feature — with zero talking. For groups who like the tactile, giggly desperation of a labyrinth marble maze but want a wordless Schelling twist.

## Problem
Most convergence party games are tap/drag flat-screen affairs. There's an untapped itch: the body-level satisfaction of steering by tilting a real object, plus the tension of trying to guess where the room will *physically settle*. Heel makes the accelerometer the whole game.

## How it works
The TV (shared) shows a single stylized terrain map: a soft heightfield with a few salient features — a lone peak, a lake, a bright notch — the kind of thing that pulls the eye. It shows nothing else during play except an anonymized heat cloud (a blurred blob wherever balls currently cluster) so you sense proximity but never who or exactly where.

Each phone (private) shows ONLY that player's own ball on their own copy of the terrain. You tilt the phone; the ball rolls with simple physics (gravity toward tilt, friction, terrain nudging it toward valleys). You cannot see the other two balls. When you think you've parked where everyone else will park, you press-and-hold LOCK; releasing before 1.5s cancels. Once locked your ball freezes.
Win condition: all three locked balls fall within a small radius (e.g. 8% of map width) of each other. On win the TV zooms the cluster and reveals all three trails overlaid — the payoff is seeing three wobbly independent paths converge on the same notch.

The per-phone architecture is load-bearing: each player needs their own live accelerometer AND a private view of only their own ball. Passing one phone around destroys both the simultaneity and the hidden-position secrecy the Schelling read depends on.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room{ terrainSeed, phase }`, `player{ id, ballX, ballY, locked }`. Physics runs client-side on each phone (deviceorientation/accelerometer → velocity integration) for a smooth 60fps feel; each phone streams its ball position to the server at ~10Hz. The server is authoritative only for terrain seed, lock state, and the win check (pairwise distance ≤ radius). Host subscribes to positions to render the blurred heat cloud (never exact dots). Genuinely hard part: iOS requires a user gesture to grant `DeviceMotionEvent` permission, and accelerometer scaling differs per device — a 4-second calibration (tilt-to-corners) normalizes sensitivity so a heavy tilter and a light tilter share a coordinate frame.

## v1 scope
- Exactly 3 players, one fixed terrain map, one round.
- Tilt-to-roll physics + lock button.
- Heat-cloud host render + overlaid-trails reveal.
- Single win/lose result screen.

## Out of scope
- Multiple maps, procedural terrain, scoring across rounds.
- Spectators, >3 players, rematch flow.
- Sound design beyond a win chime.

## Risks & unknowns
- iOS motion-permission friction may break onboarding; needs a clean gesture-gated prompt.
- Per-device accelerometer variance could make convergence feel unfair without solid calibration.
- Terrain may over-determine the answer (everyone trivially rolls into the one lake) — need enough plausible features that the Schelling read is non-trivial.

## Done means
Three phones on a real network calibrate, each rolls its own ball by tilt with the others hidden, the host shows only a heat cloud, and a round where all three lock within radius triggers the overlaid-trails win reveal — verified end to end on at least one iOS and one Android device.
