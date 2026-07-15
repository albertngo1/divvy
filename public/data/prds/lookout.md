## Overview
A cooperative real-time party game for 3–5 people in a room with a TV. One player is the **Lookout** with the only map; the rest are **Pilots** steering boats they cannot see. The core fun is a guide who is a *scarce resource*: the Lookout can only attend to one boat at a time while every boat keeps drifting toward rocks.

## Problem
"One person has the map" co-op games usually let the guide broadcast to everyone continuously (Keep Talking). That collapses into one person narrating a checklist. The itch here: make *attention itself* the bottleneck, so the group has to negotiate whose turn it is to be saved while the clock and the current keep moving.

## How it works
The host TV shows a **fogged** sea: harbor, a sweeping lighthouse beam, and vague boat silhouettes — but the rocks are invisible, so even a Pilot who peeks at the TV learns nothing. The Lookout's phone shows the **de-fogged** map: every rock, every boat's exact position and heading, and the harbor mouth.

Each Pilot's phone shows ONLY a private cockpit: a rotary wheel (drag to change heading), a throttle button, a tiny wake trail of their last few seconds, and one text line + a "LAMP ON YOU" glow. Boats **drift forward continuously** even when idle. The Lookout taps a boat to "shine the lamp": that boat's phone lights up and the Lookout can type/flick a short instruction to it ("hard left, rock at your bow"). Only the lit boat hears it; the others are in the dark, drifting. Goal: get all boats into harbor within 90 seconds without a single hull-crush.

The Lookout is forced to time-slice: turn away from a boat too long and it grinds a reef (haptic buzz + the TV flashes that silhouette red). Pilots can tap an "SOS" that queues a request light on the Lookout's map, but too many SOSes at once is its own chaos.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Server holds the world at ~15 Hz: `boats[{id, x, y, heading, speed, alive}]`, `rocks[]`, `harbor`, `lampTarget`, `timer`. Pilots send `{heading, throttle}` deltas; server integrates motion, does circle-vs-rock collision, and pushes each Pilot ONLY their own boat state + lamp/instruction, pushes the Lookout the full world, pushes the host a fogged render. Hard part: real-time sync of continuous motion with per-client filtering (each Pilot must never receive the map) while keeping the Lookout's view smooth. Interpolate on clients; server is source of truth for collisions.

## v1 scope
- 1 Lookout + 2 Pilots, one 90s round.
- One fixed map, ~6 rocks, one harbor.
- Lamp = tap-to-select + 3 canned instruction flicks (L / R / STOP).
- Win/lose screen, no scoring beyond time + hulls saved.

## Out of scope
- Multiple maps, currents/wind, procedural generation.
- Free-text chat, voice.
- Persistent scores, more than 5 players.

## Risks & unknowns
- Continuous drift may be too punishing for 2 Pilots; tune speed low.
- Pilots peeking at the TV — mitigated by fog, but verify it reveals nothing exploitable.
- Latency making the wheel feel mushy; needs client-side prediction.

## Done means
Three phones + a TV: boats drift live, the Lookout's phone alone shows rocks, the lamp lights exactly one Pilot's phone at a time, an unattended boat visibly crashes, and a run where both boats reach harbor triggers a win screen.
