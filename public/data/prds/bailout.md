## Overview
An asymmetric cockpit party game. One player is the pilot with the full aircraft dashboard on their phone. Everyone else holds a single instrument — altimeter, fuel gauge, compass, artificial horizon, airspeed indicator. The plane is going down. The pilot can't see any raw readings; they can only steer. The passengers shout numbers so the pilot can land.

## Problem
Co-op games with asymmetric roles (Keep Talking and Nobody Explodes, Overcooked) are consistently the best-received party formats, but they need either a manual PDF or a shared screen. Nothing captures the pilot-and-crew fantasy where everyone genuinely holds a different piece of the truth in their hand.

## How it works
3–5 players join. One is randomly assigned the pilot; the rest each get one instrument. The pilot's phone shows a horizon-with-runway view and steering controls (pitch up/down, throttle, gear). The pilot sees no numbers. Each passenger's phone shows only their instrument, updating in real time as the plane moves. To land, the pilot needs airspeed under X, altitude descending smoothly to zero, heading matching the runway, fuel not depleted — but they only know this by asking. "Compass, what am I on?" "Two-eight-zero." "Altimeter?" "Twelve hundred and dropping fast." Success = wheels down on runway within tolerances. Failure = crash animation, everyone yells.

## Technical approach
Socket.IO on the homelab. Server runs a simple 2D flight sim at 30Hz — pitch, throttle, drag, gravity, fuel burn — and broadcasts filtered slices to each client. Pilot receives control state and a rendered horizon (canvas). Each passenger receives only their instrument's scalar plus a rendered gauge (SVG). Instruments are analog-styled — needles, dials — so reading them out loud requires a small skill (interpolating between tick marks). The per-phone split is load-bearing: if instruments were on a shared screen the pilot would just glance; keeping each reading privately on one passenger's phone forces the "call it out" ritual that is the entire game.

## v1 scope
- 4 players fixed (1 pilot + 3 instruments: altimeter, airspeed, compass)
- One landing attempt per round, ~2 minutes max
- Fixed runway heading, fixed starting altitude/speed
- Binary outcome: landed within tolerances or crashed
- Instrument readings update at 5Hz

## Out of scope
- Fuel gauge, artificial horizon (v2 instruments)
- Weather, wind, turbulence
- Multiple runways or airport choice
- Difficulty tiers
- Emergency events mid-flight

## Risks & unknowns
- Analog gauge reading may be too easy or too hard — needs playtest calibration
- 2-minute rounds may feel long for a party game; may need to shorten to 60s
- Pilot's canvas view leaking information the passengers should own
- Latency between pilot input and instrument update breaks trust

## Done means
Four people with four phones can complete or bungle a landing, and the group's reaction to a successful touchdown is louder than the reaction to a crash.
