## Overview
An indoor treasure hunt for 3–4 players where the room is a literal search grid. A TV/laptop hosts, and each phone is a private divining rod that estimates its own position by counting your steps and reading your compass heading. For people who want to physically wander a room, not thumb a screen.

## Problem
Sensor party games rarely make you *walk to a specific spot.* Compass games claim sectors; step games count reps. Nobody has made phones do coarse indoor dead-reckoning as the whole point — and the inevitable drift, instead of being a bug, becomes the comedy: your phone swears you're close while you're standing in a bookshelf.

## How it works
**Calibration:** everyone starts on one "home" corner and takes a few paced steps so each phone learns your stride length (distance / step count). **Hiding:** one player is the Hider. Their phone privately guides them to walk out into the room and press "bury" — capturing a target point as (heading, steps) from home. Only the Hider's phone (and the host, secretly) knows where it is. **Hunting:** all other players hunt SIMULTANEOUSLY. Each hunter's phone PRIVATELY dead-reckons its own position (integrating step-events × stride along current compass heading from home) and shows only a warmer/colder dial + distance-to-cache estimate — nothing about where anyone else is. The **host TV** shows an abstract radar with anonymized blips and a hidden cache, purely for spectators to laugh at near-misses; it never reveals the cache to hunters. First hunter to stand within ~1m of the cache and press "dig" wins; the host then reveals true vs. estimated positions.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). **Data model:** Room{phase, hiderId, cache:{heading,steps}}, Player{id, stride, posEstimate:{x,y}, headingDeg, foundAt}. **Sensors:** DeviceMotion accel-magnitude peak detection → step events (reliable, count-based); DeviceOrientation `alpha` → compass heading (zeroed by facing a wall at home). Each phone integrates locally: on each step, `pos += stride * unitVector(heading)`. Warmer/colder = distance from posEstimate to cache point (both in the same home-relative frame). **Sync:** phones own their own dead-reckoning; only step/heading-derived position summaries (~5Hz) go to server for the host radar; server is authoritative for the win check. **Genuinely hard part:** every phone drifts independently and there's no ground-truth to correct against, so the shared home-origin + facing-the-wall heading-zero is what keeps all frames roughly aligned; getting the win-tolerance loose enough to be winnable but tight enough to feel earned is the tuning knob.

## v1 scope
- 3 players, one round: one Hider, two hunters.
- Stride calibration + heading-zero at home corner.
- Single cache, warmer/colder dial + "dig" button.
- Host radar for spectating; win by proximity press.

## Out of scope
- Multiple caches, rounds, or scoring across games.
- Any real SLAM/beacon positioning — pure dead reckoning.
- Obstacle modeling, multi-room, team play.

## Risks & unknowns
- Drift over ~20+ steps may make it unwinnable; keep the room small and tolerance generous, lean into drift as comedy.
- Compass alpha is noisy/needs the wall-facing zero; magnetic interference near TVs/speakers.
- Step over/under-count varies by gait and phone hold.

## Done means
Three phones calibrate at home; the Hider buries a cache by pacing out; both hunters independently walk the room and their private warmer/colder responds correctly to their own movement; the first hunter to physically reach the buried spot and press dig wins, and the host reveals estimated-vs-true positions showing the dead-reckoning was close enough to find it.
