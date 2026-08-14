## Overview

Four players, one continuous 90-second round. A shared line on the TV is slowly squeezed from both ends. Each player occupies a segment of it, drives their segment with a slider, and cannot see anyone else's position — only a private proximity buzz that rises as a stranger's edge approaches theirs. Overlap bleeds points from both parties. By design, the line ends up shorter than the sum of the segments, so someone must get crushed.

## Problem

Anti-coordination games are almost always discrete and turn-based: pick a number, reveal, laugh, repeat. None of them ever *feel* like crowding — the pressure of an elevator filling, a beach towel creeping onto yours, a merge lane with no shoulder. That feeling is continuous, tactile, and blind, and phones are the only party-game hardware that can deliver it to four people at once, privately.

## How it works

The TV shows a horizontal bar — the curb — spanning 0 to 1000 units, with walls that close in linearly over 90 seconds to about 55% of the sum of all player widths. It shows the walls, a room-wide congestion meter, and nothing else about where anyone is.

Each phone shows one large slider controlling **the center of your own segment**, plus your secretly dealt width (60 / 110 / 160 / 220 units — you know only your own), your live score, and a pressure bar. Your only information about neighbors is a continuous haptic/audio proximity signal that begins at a gap of 120 units and climbs toward contact.

Overlap is a collision: a hard distinct buzz pattern on both phones, and both players bleed 40 points per second for as long as they overlap. Score accrues at width × seconds held clear — so wide segments are worth more per second and are dramatically harder to keep clean. Being pushed off the end of the curb bleeds too.

When a collision starts, the TV sounds a klaxon and flashes the two names for one second. That is the only public information channel, and it is the social engine: the room learns adjacency by hitting each other, then negotiates out loud, then lies. Because the walls keep closing, every verbal deal expires within about fifteen seconds.

The endgame is the point: total width exceeds the final curb length, so the last twenty seconds are four people arguing about who eats the overlap while quietly sliding.

## Technical approach

Authoritative server (PartyKit Durable Object or Socket.IO over Tailscale Serve) ticking at 20Hz.

Data model: `Room { t, curbLeft, curbRight, players: { id, name, center, width, score, overlappingWith[] } }`.

Phones send `center` at 20Hz from throttled pointer position. The server clamps to the curb, computes pairwise overlaps and each player's nearest gap, then sends each phone **only its own** private tuple `{ nearestGap, overlapping, score }`. The host receives full state but renders only walls, congestion, and collision callouts.

Hard part one: the proximity sense must be server truth, never locally predicted — an optimistically rendered gap would give players false safety and make the game feel like a liar. Which means collisions are inherently 40–80ms retroactive; the UI must say "you were overlapping", not pretend to be instantaneous.

Hard part two: iOS Safari has no `navigator.vibrate`, and a PWA can't get around that. So the primary channel is a WebAudio click train whose rate and pitch rise with proximity (works everywhere, felt through the hand at high rates), with real vibration layered on where the platform allows it, plus a full-screen color intensity field as a third redundant carrier.

## v1 scope

- Exactly 4 players, one 90-second round
- Fixed width deal: 60 / 110 / 160 / 220, randomly assigned
- Linear symmetric curb shrink, no obstacles, no powers
- WebAudio proximity click, vibrate where supported
- Final reveal animation showing everyone's true segments

## Out of scope

Two dimensions, teams, multiple rounds, variable shrink curves, reconnection, cosmetics, leaderboards across games.

## Risks & unknowns

The iOS haptic gap is the biggest one — if the audio click train doesn't read as proximity, the game has no sense organ. Second: the room may degenerate into everyone shouting their slider value, though continuous drift, the shrinking walls, and the freedom to lie should decay verbal claims fast enough. Third: whether a single scalar gap is enough to play by, or whether players need direction (left/right) too — v1 ships without direction and measures whether people can still park.

## Done means

Four phones join, the round runs 90 seconds, walls visibly close on the TV. Proximity signal on each phone rises before contact. At least one klaxon collision fires with the correct two names on the TV while both phones bleed. Final scores compute as width × clear-time minus bleed, and the reveal shows the true segment layout so the room can finally see who was next to whom.
