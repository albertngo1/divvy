## Overview

A 3–4 player cooperative navigation game for a living room. One randomly chosen player becomes the **Holder**: their phone, and only their phone, displays the map of a small dark house. The other players are **Pieces**, each controlling one body in that house. The Holder cannot talk, type, or point. They have four unlabeled colored buttons. That's the entire communication channel.

## Problem

"One player knows, everyone else guesses" games usually degrade into the knower narrating out loud, which makes the private screen decorative. The itch: build a game where the map-holder is *genuinely* the map — a device the others operate — and where the bandwidth between them is so thin the room has to invent a language in the first ninety seconds.

## How it works

**Holder's phone (private):** a 6×6 grid top-down map of the house. Walls, one exit, one hazard tile, and live dots for each Piece, updating in real time as they move. Below the map: four large buttons — RED, BLUE, GOLD, GREEN. Tapping one fires a pulse to *all* Pieces simultaneously. The Holder cannot send to individuals.

**Each Piece's phone (private):** no map. A black screen with a directional pad (N/E/S/W), plus the last three color pulses received as a little stack of colored dots. Crucially, each Piece's screen shows only *their own* position notion — a breadcrumb trail of where they personally have been, drawn as they walk. Nobody sees anyone else's trail. Two Pieces standing on the same tile don't know it.

**Host TV (shared):** the fog. Black grid, no walls drawn. Only revealed: tiles that some Piece has already stood on, rendered as dim gray, unattributed. Plus the pulse history as a scrolling ribbon of colors, and a timer. The TV never shows walls, the exit, or who is where.

**The round:** 4 minutes. Pieces move freely and simultaneously — bumping a wall costs 3 seconds of frozen input, which is the Holder's punishment too. The room wins when *all* Pieces are standing on the exit tile at the same moment. Talking is legal among Pieces; the Holder must stay silent. So the Pieces negotiate out loud — "gold means stop, right? gold means stop" — while the Holder watches them get it wrong and can only spam gold.

The joy is that the color grammar is emergent and unshared. The Holder decides gold means stop; the Pieces decide gold means north. Both parties are internally consistent and mutually catastrophic, and the correction happens live.

## Technical approach

PartyKit Durable Object per room, authoritative. State: `{ map: Cell[36], pieces: {id, pos, trail[]}, pulses: [{color, t}], phase }`. Phones are PWA clients over WebSocket; the host tab is a read-only subscriber with a fog-filtered projection.

Server holds the single truth of positions. Piece move requests are validated against walls server-side — the client never knows the wall exists until the server rejects and returns a 3-second freeze. This matters: wall knowledge must not leak into any client bundle.

Three different views are derived from one state on the server and pushed as three distinct payload shapes: `holder_view` (full), `piece_view` (own trail + pulses only), `tv_view` (union of visited tiles, unattributed). No client ever receives data it isn't allowed to render.

Hard part: pulse simultaneity. A color pulse must land on all Piece phones within ~80ms of each other, or the room's ad-hoc grammar ("two golds fast means turn") falls apart. Server timestamps each pulse and phones render on a shared scheduled tick rather than on arrival.

## v1 scope

- 4 players exactly: 1 Holder, 3 Pieces
- One hand-authored 6×6 map, no generator
- Four colors, one exit tile, no hazards
- One 4-minute round, then reveal the map on the TV
- Win/lose screen, no scoring, no rematch flow

## Out of scope

Multiple rounds, map generator, hazards, Holder rotation, per-Piece targeted pulses, spectators, any audio.

## Risks & unknowns

The grammar may never converge and the round dies in frustration — mitigated by the map being tiny and the exit reachable in ~10 correct moves. Holder may cheat by talking; social enforcement only in v1. Fog on the TV may be too sparse to feel like progress.

## Done means

Four phones join a room code. The Holder sees a map no other device has ever received (verifiable in network inspector). Three Pieces move dots the Holder watches live. Pulses land within 80ms across all three. A room reaches the exit at least once in playtesting, and at least one group audibly argues about what gold means.
