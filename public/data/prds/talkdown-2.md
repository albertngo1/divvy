## Overview
A frantic air-traffic-control comedy for 3 players. One phone is the radar map. The other two are pilots flying by instruments alone, unable to see where they are in the sky. The only bridge between map and pieces is the controller's voice.

## Problem
"One person knows, everyone else is blind" games usually collapse into the knower reading a solution aloud. The itch here is the *inverse*: the knower has the map but no hands, the pilots have hands but no map, and neither can do the other's job. Real ground-controlled approaches are exactly this — tense, verbal, and impossible solo.

## How it works
Three devices, three completely different views:
- **Controller phone (THE MAP, private):** a top-down radar scope — the runway, each pilot's blip with live heading/altitude/distance readouts, and a drifting hazard (a storm cell or crossing traffic). The controller sees *everything about position* and can touch *nothing*.
- **Each pilot phone (private):** an instrument panel ONLY — artificial horizon, heading bug, altimeter, vertical-speed needle, throttle slider. Tilt the phone to bank and pitch; slide to throttle. No map, no runway, no other plane. A pilot knows their attitude but not where they are.
- **Host TV (shared theater, not the map):** a crude tower view — landing lights, a round timer, and status callouts ("PLANE 2: TOO STEEP — GO AROUND"). It shows outcomes, never positions.

The controller talks: "Plane 1, turn left heading 270, descend to 800." The pilot obeys blind. Both planes are falling in real time, so the controller must split attention and voice across two descents at once. Land both on the runway centerline within the fuel timer to win.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) runs a fixed-tick (20Hz) flight sim: each plane is `{x,y,alt,heading,vspeed,fuel}`. Pilot phones send tilt deltas via `deviceorientation` (beta/gamma) + throttle; server integrates and broadcasts. Controller phone subscribes to full state and renders the radar; pilot phones subscribe only to their OWN plane's instruments (server filters per-connection — pilots literally never receive position data). Host TV subscribes to a redacted stream (status flags only). Genuinely hard part: making blind tilt-flying feel controllable — needs light auto-stabilization, generous landing tolerances, and ~150ms-tolerant interpolation so laggy tilt doesn't feel like a coin flip.

## v1 scope
- 1 controller + 2 pilots, exactly.
- Calm air, one straight runway, one hazard, 90-second fuel timer.
- One round, win/lose, no scoring beyond "both landed / crashed."
- Tilt-to-bank + throttle slider; voice is out-of-band (players are in the same room).

## Out of scope
- Multiple runways, wind, radio-only (no talking) mode.
- More than 2 pilots, matchmaking, persistence.
- In-app voice — the room provides it.

## Risks & unknowns
- Blind tilt-flying could feel unfair; tuning tolerances is the whole game.
- `deviceorientation` permission/calibration friction on iOS.
- Two simultaneous descents may overwhelm one controller — may need to stagger arrivals.

## Done means
On three phones + a TV, a controller who can see only the radar talks two pilots (who see only instruments) onto the runway within 90s, and if either pilot peeks at the controller's screen the round is trivially solved — proving the private per-phone split is load-bearing.
