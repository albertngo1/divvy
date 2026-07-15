## Overview
Merge is a real-time anti-coordination game for 3-5 players sharing a TV, each holding their phone as a private car cockpit. Everyone is a car approaching a single-lane bottleneck; the room wins only if all cars slip through one at a time.

## Problem
Most "co-op" party games let everyone see the whole board, so coordination collapses into one loud person calling the shots. Merge itches at the real-world dread of a highway merge: you can only sense your own gap, everyone's instinct is to accelerate, and everyone accelerating is exactly what causes the pileup.

## How it works
Each phone PRIVATELY shows: your speedometer, a hold-to-accelerate / release-to-coast / swipe-down-to-brake control, a countdown of meters-to-merge, and a haptic buzz that intensifies as you close on the funnel. You do NOT see the other cars while they're upstream. The shared TV shows only the final visible stretch — the merge funnel itself — plus a room "flow" meter; a car pops into view on the TV only during its last approach, creating sudden "someone's already there — brake!" moments. If two cars occupy the merge point within the same ~200ms window, they crash: both eliminated, klaxon, wreckage on-screen. Win = every car clears the funnel before a 60s timer.

The only viable strategy is to silently stagger — open a gap you can't fully see, read the TV's late reveals, and trust the haptics — because the shared screen deliberately withholds the global picture.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Server runs a fixed 30Hz sim of each car's position/velocity on a 1D track. Phones send throttle intents; server integrates motion, resolves merge-zone occupancy, and detects collisions. Data model: Car{id, pos, vel, throttle, alive}. Sync: server → host receives full state (but the host renders only the visible zone); server → each phone receives ONLY that car's pos/vel, its gap-to-nearest-car-ahead-in-merge-order, and a buzz level. Genuinely hard part: real-time fairness under phone latency — a slightly-late brake must not cause a phantom crash. Use client-side prediction on the speedometer, server reconciliation, and a per-room collision grace window tuned to measured ping.

## v1 scope
- 3 players, one merge, one 60s round
- Hold-to-accelerate + brake only (no steering)
- Fixed straight track, single bottleneck
- Crash = elimination; win if all pass cleanly
- Local room, one shared TV, QR join

## Out of scope
- Multiple lanes, curves, or scoring across rounds
- Remote play / matchmaking
- Car customization

## Risks & unknowns
- Latency fairness IS the game; jitter-induced phantom crashes would feel cheap
- Is "feel your gap via haptics + late TV reveal" legible, or just frustrating?
- Per-room collision-window tuning under mixed device pings

## Done means
3 phones join by QR, each drives blind, and the server eliminates exactly the cars whose merge-point occupancy overlaps within the window. A room that staggers successfully sees all three cars clear the funnel and a win screen — reproducibly, on real phones over the local network.
