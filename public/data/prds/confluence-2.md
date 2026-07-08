## Overview
Confluence is a cooperative concurrent-room game where 3–5 casual players collaboratively draw one fantasy map — each phone privately owning a single tile — and take the stitched poster home as a keepsake. No points, no winner: the artifact is the reward, and the joy is rivers and roads that connect (or hilariously fail to) across borders nobody could fully see.

## Problem
Party drawing games are either solo-judged (Drawful) or fully open — and nobody leaves with a *thing they made together*. The fresh itch is blind coordination: continuing a river to meet a neighbor's edge you can only partially sense. That asymmetric per-tile view is impossible with one passed phone; every player must hold a different private slice of the map at the same time.

## How it works
The host shows an empty tiled poster. Each phone is assigned one tile and shows a private canvas with a stamp palette (mountains, forest, river, road, town) plus a landmark name field. Critically, each phone sees only faint 'border stubs': arrows at its edges marking where a river or road enters from a neighbor, at a specific position — computed live by the server from that neighbor's edge commitments. Players work simultaneously, trying to continue those rivers/roads to meet the stubs and naming one landmark. On a timer, the host stitches all tiles into one poster and a 'confluence meter' celebrates how many features actually connected across the seams. The finished map is the keepsake (screenshot/export).

Private (phone): your tile, your live border stubs, your palette. Shared (host): the assembled map — revealed only at the end — and the confluence celebration.

The border-stub propagation is the interesting mechanic: place a river reaching your right edge at position y, and your right-neighbor's phone privately gets a left-edge stub at y in real time — both can aim to meet, neither sees the other's full tile.

## Technical approach
Host tab + phone PWA + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Map {tiles:[{id, ownerId, stamps[], edges:{N,S,E,W:[{type,pos}]}}], adjacency}`. Sync: whenever a client places an edge-touching stamp, it sends an edge commitment; the server updates the adjacent tile's stub list and pushes it *only* to that one neighbor phone (targeted private messages). The genuinely hard part is exactly this — real-time, correctly-targeted edge-state propagation plus computing 'connected' matches across seams with position tolerance, all in a shared coordinate space that renders identically on phone and host.

## v1 scope
- 3 players in a 1×3 horizontal strip (only left/right borders — no corners)
- Stamp-only (no freehand); rivers + roads as the only connectable types
- One landmark name per tile, 3-minute timer
- Host stitches the strip and reports connection count
- Export via screenshot; join by room code

## Out of scope
- Freehand drawing, 2D grids / corner adjacency
- Multiple rounds, biomes, any scoring
- Printing or mailing the map, undo-history sync
- More than 5 tiles

## Risks & unknowns
- Coordinate mismatch could make 'connections' feel unfair
- Stamp UX cramped on small phones
- Players ignoring borders (still fine — a messy map is still a keepsake)
- Unknown: right connection tolerance; whether a strip or a grid is more fun

## Done means
Three phones each receive a private tile with live border stubs from their neighbors; players place stamps simultaneously; the host stitches one map and reports how many rivers/roads connected across the seams; the finished map is exportable as a keepsake — with no points scoreboard anywhere.
