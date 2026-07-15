## Overview
Interlock is a 3–4 player blind spatial-routing puzzle for a host screen plus private phones, named for the railway signaling that keeps trains off each other's tracks. Each player must lay a rail line from their own secret origin to their own secret destination across one shared grid — without any two lines ever sharing the same piece of track.

## Problem
The itch is coordination-without-communication over shared space. If everyone could see everyone's plans, this is a trivial drawing exercise. The tension comes from committing your route blind, discovering that two of you fought over the same junction, and having to silently guess who should yield. Collisions (shared track segments) are the failure and they cascade — a single contested segment derails both trains.

## How it works
The host TV shows a 5×5 grid of stations with the same layout for everyone, but NO routes. Each phone PRIVATELY shows the same grid overlaid with just that player's OWN glowing origin and destination station, and lets you tap a path of adjacent cells connecting them. Nobody sees anyone else's origin, destination, or drawn route.

When all players lock in, the server reveals simultaneously. It checks every track SEGMENT (the edge between two adjacent cells): any segment used by two or more routes is a collision — those routes derail. On the host TV, colliding segments flash RED; success segments glow. Crucially, the reveal shows WHERE collisions happened but NOT whose routes caused them (routes stay private). Players get a few attempts: after each failed lock, everyone re-plans on their phone, using the red-segment map to triangulate where a rival must be squeezing through and reroute around it — pure silent inference, in the spirit of an aggregate-only feedback meter. The room wins when all routes reach their destinations with zero shared segments; the instance is always guaranteed solvable (edge-disjoint paths exist).

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Room {grid, players[], attempt}; Player {id, origin, dest, route:[cellIds], locked}. Sync is turn-batched, not continuous: phones stream their in-progress route only to themselves; on lock the server holds each route privately until ALL are locked, then computes the multiset of segments, marks any with count≥2 as collisions, and broadcasts to the host ONLY the anonymized collided-segment set + win/continue state, while sending each phone its own success/derail verdict. The hard part is instance generation: producing origin/destination pairs on a small grid where an edge-disjoint solution provably exists but naive shortest-paths collide, so the puzzle bites without being unsolvable — done by sampling pairs and running a disjoint-paths feasibility check server-side before dealing.

## v1 scope
- 3 players, one fixed hand-picked 5×5 instance known to be solvable.
- Phone: tap adjacent cells origin→dest, lock button, clear button.
- Host: grid, red collided-segment flash on reveal, attempt counter, WIN state.
- Up to 5 attempts.

## Out of scope
- Procedural instance generator (v1 uses one curated grid).
- Diagonal moves, obstacles, multiple destinations.
- Scoring beyond win/lose, animations beyond flashes.

## Risks & unknowns
- Blind first attempt can feel like pure guessing; the red-segment feedback loop across attempts must carry the fun — needs playtesting on how many attempts feel fair.
- Route-drawing UX on small phone screens (mis-taps) could frustrate.
- Anonymized collision feedback may be too thin to actually triangulate rivals with 4 players.

## Done means
Three phones join a room code and each sees a distinct private origin/destination on the shared grid; locking reveals only anonymized collided segments on the host; a room can, across attempts, reroute to an edge-disjoint solution and trigger a WIN; and no phone ever receives another player's route data.
