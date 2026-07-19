## Overview
Limelight is a 3–5 player concurrent-room game for a group that wants something twitchy and spatial. Everyone runs one follow-spot in a blacked-out theater, chasing a dancer only they've been assigned to light. The whole joy is that beams must never touch — coordination is the failure mode.

## Problem
Most 'keep the object in the circle' games are solo skill tests. The itch here is a shared arena where your correct move (chase your dancer) constantly threatens someone else's correct move, and you can't just call out 'I've got the one in the red dress' because you don't know which dancer is theirs.

## How it works
The host TV shows a dark stage with N drifting, numbered silhouette dancers and N soft lit pools (the spotlights). Dancers wander on scripted looping paths and periodically cross near each other — the pinch points.

Each phone PRIVATELY shows: (a) a drag-pad to steer YOUR spotlight, (b) which dancer number is secretly yours (highlighted only for you), and (c) a small 'clean streak' meter. The host screen never labels whose beam is whose, so you cannot deduce others' assignments except by watching how beams move.

Collision rule: if two lit pools' centers come within one beam-radius, a white glare flares on the host screen, an audience boo plays, and BOTH colliding players' streak meters drain while overlap persists. Win condition: every player keeps their beam on their own dancer for the 30-second song with total fault-time under a threshold. When two dancers cross, one operator must arc their beam wide and yield — silently, guessing who'll blink first.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: room `{songSeed, t, dancers:[{id,path}], spots:[{playerId, x, y}], assignments:{playerId→dancerId (server-secret)}}`. Dancer motion is deterministic from `songSeed`+`t` so all clients render identically without streaming positions. Phones send only their spot's (x,y) at ~20Hz; server is authoritative for overlap detection (pairwise distance each tick) and broadcasts glare events + per-player fault deltas. The genuinely hard part is sub-100ms feel: use client-side prediction of your own beam, server-reconciled overlap flags, and render the host at 60fps interpolating the last authoritative snapshot. Assignments stay server-side; each phone only learns its own.

## v1 scope
- 3 players, 3 dancers, one 30-second song, one stage layout.
- Drag-pad control, fixed beam radius, one fault threshold.
- Host shows stage + glare flashes + final pass/fail with beams revealed.

## Out of scope
- Multiple songs, difficulty tiers, moving beam radius, scoring ladder.
- Any spectator view, replays, or cosmetics.

## Risks & unknowns
- Drag-pad-to-beam mapping may feel laggy on cheap phones; may need relative dragging.
- If dancers cross too rarely the anti-coordination tension vanishes; path tuning is load-bearing.
- Could devolve into 'everyone freezes' — needs forced pinch points to compel yielding.

## Done means
Three phones each steer a distinct beam, the host renders synchronized dancers and flares glare within ~120ms of any real overlap, and a test group can both fail (too much fault-time from a stubborn crossing) and clean-sweep a run by silently yielding at a pinch point.
