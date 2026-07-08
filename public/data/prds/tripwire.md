## Overview
Tripwire is a one-vs-many stealth party game for 3-6 people in a furnished room. Most players are Guards who turn their phones into stationary motion-detecting cameras aimed at real zones of the room; one player is the Prowler who must physically sneak across the space undetected. The room's actual furniture — couches, doorways, kitchen island — is the board, providing both cover and camera mounts.

## Problem
Hidden-movement board games (Scotland Yard, Nuit) abstract sneaking into tokens on a grid. The itch: what if the sneaking were *real* — your own body creeping across a real room — and the sensors watching you were real phone cameras your friends aimed at the chokepoints?

## How it works
Each Guard props their phone (against a lamp, on a shelf) pointing at a zone. Their PRIVATE screen shows a live low-res motion feed (frame-differencing), a motion needle, and a WATCH BATTERY (~12s of armed time for a 60s round). Arming runs detection; if motion crosses threshold, the Guard taps CALL IT to drop an alarm pip. Three pips = Prowler caught. The catch: a phone can only be armed while physically still (devicemotion gate), so panning to hunt disarms it, and every false trigger (a passing pet, another player) still burns battery. Guards must guess *when* the Prowler will cross their lane and spend battery there.

The Prowler's PRIVATE screen shows only the goal object and a timer — no sensing; they read the room and Guards' faces. They win by physically touching the goal and tapping REACHED before three pips.

The shared HOST screen shows an abstract room map, the alarm pip count (0/3), the round clock, and — only at the end — a replay of which cameras were armed when, so everyone relives the near-misses.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{phase, clock, pips}, Guard{armed:bool, batteryMs, still:bool, lastMotion}, Prowler{reached:bool}. Guards run getUserMedia + a canvas frame-diff loop locally (sum of per-pixel luma deltas over a decimated grid); only the boolean `motionDetected` and battery drain sync up, never video. The server is authoritative on battery, the still-gate (fed by devicemotion), and pip count. Sync strategy: 10Hz state ticks; alarm pips are server-committed events. The genuinely hard part is a motion threshold that survives auto-exposure swings and different phone cameras without either constant false alarms or dead zones — needs per-camera adaptive baselining during a 3s arming warm-up.

## v1 scope
- 3 players: 1 Prowler, 2 Guards
- One 60s crossing, one room
- Frame-diff motion + still-gate + battery + 3-pip catch
- End-of-round armed-timeline replay on host

## Out of scope
- Multiple rounds / role rotation scoring
- Prowler gadgets, camera decoys, teams
- Recording or replaying actual video

## Risks & unknowns
- Camera motion detection reliability across phones/lighting is the whole game
- Dark rooms kill frame-diff; may need a minimum-light check
- Players cheating by holding/repositioning phones (mitigated by still-gate)

## Done means
Three phones in a real room: two propped Guards can arm/disarm on their private feeds, a walking Prowler reliably trips an armed camera within ~1m, and a full crossing resolves to a correct caught/escaped result with a legible replay.
