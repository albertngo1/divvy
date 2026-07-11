## Overview
Overcast is a real-time cooperative party game for 3 players. One player is the controller, holding the room's only map — a radar scope — on their phone. The other two are pilots flying blind in cloud, each with a private cockpit and no view of the airspace. The whole game is the controller's voice threading two blind planes through separation and onto one runway before fuel dies. It's the beloved air-traffic-control fantasy squeezed into a 5-minute couch panic.

## Problem
Everyone secretly wants to be the calm voice in the tower. But co-op party games usually give everyone the same screen; when all players see the board, there's nothing to *say*. The itch here is asymmetric blindness: the tension only exists because the pilots genuinely cannot see what the controller can, so speech becomes the entire game.

## How it works
The **controller's phone (PRIVATE map)** shows a top-down radar: two plane blips with heading vectors, the runway strip, a no-fly cloud bank, and separation rings that flash red when the blips crowd. The controller sees everything and can touch nothing.

Each **pilot's phone (PRIVATE cockpit)** shows only its own instruments: a big current-heading number, an altitude readout, a fuel bar, and buttons — turn left/right, climb/descend, throttle. No map, no runway, no other plane. "You are in cloud."

The **shared host TV** deliberately shows almost nothing spatial: a white tower window, the mission clock, and landing lights. When a plane finally breaks cloud, it emerges onto the runway on the TV — the payoff shot for the room. The TV keeps blindness pure and turns landings into celebration.

The controller talks: "Cessna, turn right heading zero-niner-zero, descend to two thousand." Pilots execute on their own panel. Bring both down without a collision or a flameout.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { planes: {id, x, y, heading, alt, fuel, landed}, controllerId, tick }`. The server runs an authoritative ~10Hz physics sim integrating each plane's heading and speed; pilots send input events (turnRate, throttle, climbRate), the controller receives full state, each pilot receives only its own plane's state. Genuinely hard part: a fair, low-latency real-time sim over lossy phone connections — client-side interpolation on the pilot panel, server-authoritative collision/separation and landing-cone checks so no one can cheat the physics.

## v1 scope
- 1 controller, 2 pilots, 2 planes
- Fixed spawn positions, one runway heading
- 90-second shared fuel/mission clock
- Land both planes = win; collision or fuel-out = loss
- One round, then hand the controller phone to someone new

## Out of scope
- More than two planes, weather, wind, go-arounds
- Scoring/leaderboards, multiple runways
- Any spatial rendering on the TV beyond the landing shot

## Risks & unknowns
- Sim latency making pilot inputs feel mushy
- Difficulty tuning: too easy is boring, too tight is rage
- Whether voice alone carries enough info without a text channel

## Done means
On three phones over one WebSocket room, a controller who can see the radar verbally vectors two pilots — who see only their own instruments — into two clean landings within 90 seconds, with a collision correctly ending the round.
