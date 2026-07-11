## Overview
Fathom is a cooperative, real-time "blind pilot" party game for 3–5 players in a room with a shared TV. One player is the **Pilot**, who holds the only chart of a treacherous harbor; everyone else captains a ship they must steer to the dock without ever seeing where the rocks are. It's for groups who like tense, shouty co-op (Keep-Talking-adjacent) but with continuous, live movement instead of turns.

## Problem
Most "one person has the map" games are turn-based and quiet, so they collapse into one person calmly narrating. The itch here is the panic of a real harbor pilot conning several ships through fog at once — perfect information but scarce *attention* — while blind drivers must trust and translate fast. Passing a single phone around the room would kill it: each captain needs their own live steering and private instrument.

## How it works
Each **Captain**'s phone shows only a rudder (left/right), a fixed throttle, and one private gauge — "depth under keel" — which drops as they near a shoal. That gauge is their sole hint: no map, no sight of other ships. The **Pilot**'s phone shows the full top-down chart: the safe channel, every shoal, and each ship's live position and heading. The Pilot talks freely ("Red ship, ease left, you're shoaling — Blue, hold your line"). Ships move continuously; a grounded ship freezes 3s and alarms. The shared **host TV** renders a fog-of-war dramatization — just wakes, buoys, and alarm flashes — so spectators feel every near-miss without seeing the channel. Win when all ships reach the dock before the tide timer empties. The fun is the Pilot's bottleneck: multiple ships drifting toward rocks simultaneously, one voice.

## Technical approach
Host tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ tideRemaining, channel[], shoals[] }`, `Ship{ id, x, y, heading, speed, depthUnderKeel, aground }`. The server runs a ~20Hz physics tick integrating each ship's heading/throttle, derives `depthUnderKeel` from distance to the nearest shoal, detects grounding, and broadcasts three tailored views: full state to the Pilot, per-ship private state to each Captain, fogged state to the host. Captains send rudder deltas at input rate; the server stays authoritative to block cheating and desync. The genuinely hard part is smooth real-time steering over mobile networks — needs client-side prediction on the rudder with server reconciliation, plus a jitter buffer so lag spikes don't cause phantom groundings.

## v1 scope
- 3 players: 1 Pilot, 2 Captains.
- One harbor, one winding channel, a few shoals, one dock.
- On-screen left/right rudder + fixed forward speed (no throttle, no tilt).
- Voice is just the room (no in-app audio).
- Win/lose screen; no scoring or persistence.

## Out of scope
- Tilt steering, throttle control, currents/wind.
- Radar-sweep mode (Pilot sees only pinged ships).
- Multiple rounds, matchmaking, remote play, spectator phones.

## Risks & unknowns
- Real-time steering feel over WebSocket lag is make-or-break.
- Is guiding 2 ships tense or trivial? May need to force their channels apart.
- The depth gauge could be too helpful (self-solvable) or useless — needs tuning.

## Done means
Three people in a room: two blindly steer, one reads the chart and talks; both ships dock (or ground) within the timer, the TV shows fog and alarms, and testers instinctively start shouting course corrections. One round, start to finish.
