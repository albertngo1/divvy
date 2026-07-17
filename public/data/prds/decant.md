## Overview
Decant is a cooperative, prop-free relay for 3-4 players standing in a loose ring around a host TV. Each phone is a glass of virtual liquid; the goal is to carry a fixed pour from a starting glass to a designated 'guest' glass all the way around the ring within a time limit — without spilling. For families and party groups who like tactile, physical-comedy co-op.

## Problem
Pouring and bucket-brigade relays are gleefully tactile but need real props and real mess. Phone tilt sensing (accelerometer/gyroscope) is almost never used for anything but screen rotation, and passing a single phone around a room is dead boring. Decant turns the whole room into a wet-handed relay line with nothing but phones — and makes the tilt sensor the entire verb.

## How it works
**Calibration:** each phone walks through 'Point at the RED player and tap,' capturing a compass bearing to every other player. Thirty seconds, done.

**Play:** The host TV shows a ring of glasses (one per player, colored), each with a live fill level, plus a highlighted SOURCE (full) and TARGET (the empty 'guest' glass). PRIVATELY, each phone shows ONLY its own glass — current fill, its live tilt angle, and the color of whoever it's currently aimed at. To pour, you tilt your phone past ~25° WHILE physically facing a teammate: liquid flows from your glass into theirs at a rate proportional to tilt. Tilt while aimed at nobody (empty air) and it spills — lost forever, red splash on your screen. A 'everyone gets a taste' rule requires each glass to briefly hold liquid, forcing the full relay rather than a direct source→target dump. You glance up at the shared TV to see everyone's fills (private phones never show them); you look down to aim and pour.

**Win:** target glass reaches the fill line with under 30% total spill.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room { players[], glasses: {playerId: fillMl}, spilledMl, sourceId, targetId, phase }` plus per-phone calibrated bearing maps. Each phone streams `deviceorientation` alpha (heading) and beta/gamma (tilt) at ~20Hz. Server is authoritative and conserves liquid exactly: each tick, for any pouring phone it resolves the aimed target (nearest calibrated bearing within ±20°); if tilt exceeds threshold and a valid target exists, it moves `min(rate·dt, sourceFill)` from pourer to target, else adds to spill. The genuinely hard part is real-time conservation across concurrent pours (two people into one glass, overflow) plus compass drift — needs low-pass smoothing on headings and server reconciliation so delivered + spilled + remaining stays exactly constant.

## v1 scope
- 3 players, one ring, one source, one target
- 90-second timer, fixed 100ml, single round
- Tilt + heading only; tap-to-calibrate bearings
- No accounts, no history

## Out of scope
- 4+ player auto-layout, mixing/coloring liquids
- Spectators, scoring history, reconnection polish
- Anything beyond a single iOS motion-permission prompt

## Risks & unknowns
Indoor compass interference (metal, wiring) can misattribute aim — mitigated by a wide ±20° cone and a re-calibrate button. Players standing too close make bearings ambiguous (a spacing prompt helps). iOS requires a user gesture to grant DeviceOrientation access.

## Done means
Three phones calibrate; the TV shows the ring; tilting-while-facing a teammate visibly moves liquid between their glasses on the TV within 200ms; tilting toward empty air spills; a full target glass triggers a win screen — and delivered + spilled + remaining equals 100ml ±1 throughout.
