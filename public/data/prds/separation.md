## Overview
Separation is a cooperative air-traffic panic for 3-4 players, host screen + phone each. The host TV is a top-down radar showing everyone's aircraft as identical blips crawling across a small sky. Each player privately pilots exactly one plane from their phone and must guide it to its runway — but you can only see YOUR instruments, so avoiding collisions means announcing intentions out loud.

## Problem
Collision-avoidance games usually give everyone the same view. Separation splits the picture: the radar shows WHERE planes are but not who's who or what they're about to do; your phone shows your intentions but not the traffic. Neither view is enough alone. That gap is the whole game, and it's exactly the Devils-&-the-Details flavor of "NO not you, I'M turning left."

## How it works
Each phone PRIVATELY shows: your callsign, current heading, altitude band (LOW/MID/HIGH), fuel bar, and your assigned runway. You steer by dragging a heading dial and tapping a climb/descend toggle to change altitude bands. The host radar shows all blips moving in real time but strips identity and altitude — two blips can overlap horizontally safely IF they're in different altitude bands.

Because nobody can see who owns which blip or who's climbing, players narrate: "Blue heading north, I'm dropping to LOW." A conflict is two aircraft within the horizontal separation radius AND in the same altitude band; the server fires a warning klaxon on the host and both phones flash. Hold a conflict too long → collision, round over. Land every plane on its runway (correct heading + LOW band + slow) before anyone runs out of fuel to win. The trick: altitude is a free third dimension nobody can see but you, so verbal altitude calls become the primary deconfliction tool.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object; Socket.IO over Tailscale Serve). Data model per plane: `{callsign, x, y, heading, altBand, fuel, runwayId, landed}`; server simulates at ~10Hz and is the sole authority on positions and conflicts. Phones send only intent deltas (new heading target, altitude toggle); server integrates and broadcasts the radar snapshot to the host and a private instrument packet to each phone. The genuinely hard part is the sim/latency split: conflict detection must run server-side on authoritative positions (never client-trusted) while phones show a smooth locally-interpolated heading dial, and the separation radius + plane speed must be tuned so a verbal call (~1.5s) is fast enough to resolve a conflict but the airspace is tight enough to force constant talk.

## v1 scope
- 3 players/planes, one round, one small square airspace, 3 runways.
- 2 altitude bands only (LOW/HIGH); tap to toggle.
- Drag-dial heading, fuel countdown, host radar with klaxon.
- Win = all landed; lose = one collision or one empty tank.

## Out of scope
- deviceorientation tilt-to-steer (drag dial is enough for v1).
- 4+ planes, weather, holding patterns, scoring.
- Reconnect / spectator mode.

## Risks & unknowns
- Is 2 altitude bands enough tension, or does it need 3?
- Radar readability of identical blips on a TV across the room.
- Tuning speed vs. separation radius vs. human voice latency.

## Done means
3 phones each pilot one plane with a private instrument view, the host radar shows anonymous blips, same-band proximity triggers a shared klaxon and dual phone flash, verbal altitude/heading calls resolve conflicts, and landing all three before fuel-out yields a win screen.
