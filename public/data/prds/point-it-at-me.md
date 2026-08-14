## Overview
A 4-player cooperative room game for a living room with a TV. One player (the Cartographer) holds the only map of a small dungeon — but the map is not *on* their screen so much as *around the room*. Their phone is a window onto a map that is world-locked to the physical space: to look at the north-west quadrant, they must physically turn and aim the phone at the north-west corner of the actual room. The other three players are blind Pieces.

## Problem
Map-holder games collapse into one person reading a screen aloud in a monotone while everyone waits. The holder has infinite, free, simultaneous access to the whole board, so the only real constraint is their vocabulary. We want the act of *looking* to be physical, public, costly, and legible to the room.

## How it works
At lobby time each player's seat angle is recorded (each Piece taps "I'm here" while the Cartographer aims at them; the server stores a heading per player). The 6×6 dungeon is then affine-mapped onto the room's 360°: heading 0–90° shows the NE quadrant, and so on. Pitch controls zoom — lower the phone to see a wider, blurrier view; raise it to read one tile precisely.

**Cartographer's phone (private):** a live viewport of ~4 tiles, rendered from compass heading + pitch. Walls, the exit, and one moving hazard. Tiles leave a faded "remembered" ghost for 8 seconds after they scroll out of view, then go black.

**The rule that makes it a game:** the Cartographer's speech is only delivered to the Piece currently inside their aiming arc (±25°). Everyone hears the words in the room, but only the addressed Piece's phone unlocks its move pad for 4 seconds. So to move Dana, you must turn to Dana — swinging your window to whatever quadrant Dana happens to be sitting in, which is probably not the quadrant Dana's token is in. You read, you memorize, you turn, you speak, you turn back and find your ghost tiles have gone dark.

**Piece phones (private):** a 4-way pad that is dead unless addressed; their own body-frame bump log ("wall ahead", "floor is warm"); no coordinates, no map, no view of other Pieces. Each Piece feels only their own tile.

**Host TV:** anonymous token dots with no terrain, a 4-minute timer, and a compass needle showing exactly where the Cartographer is aiming — so Pieces can watch which part of the map their guide just abandoned to talk to them.

## Technical approach
PartyKit Durable Object per room. State: `{seats: {playerId: heading}, grid, tokens, hazard, addressee, tick}`. Cartographer's phone streams `deviceorientationabsolute` (webkitCompassHeading fallback on iOS) at 15 Hz; the client renders the viewport locally from a map snapshot it already holds, but the server independently computes `addressee` from the same heading stream so unlock authority is never client-side. Piece move intents are validated against `addressee` and a server clock.

Hard part: compass drift and iOS permission gating. Mitigation — a 5-second calibration spin at round start, plus a manual re-center double-tap; the server smooths headings with a 200 ms median filter so a wobbling hand doesn't flicker the addressee.

## v1 scope
- 4 players, one round, 4 minutes, one 6×6 grid, one exit, one hazard
- Heading only (skip pitch/zoom — fixed 2×2 tile window)
- Addressing arc fixed at ±25°, hard-coded seat calibration flow
- Win/lose screen; no scoring, no persistence

## Out of scope
- Multiple rounds, map generation, hazard AI beyond a fixed patrol loop
- Android/iOS sensor parity beyond "works on one test phone each"
- Cartographer rotation between rounds

## Risks & unknowns
- Compass accuracy indoors near metal/speakers may be ±20°, blurring the addressing arc
- Physically turning while talking may feel silly rather than tense — playtest is the only answer
- Small rooms compress seat angles; may need seats ≥45° apart

## Done means
Four phones + a TV; the Cartographer aims at a player, that player's pad lights up and accepts a move within 4 seconds, and the Cartographer's map visibly scrolls away as they turn. One test group escapes at least once in four minutes, and at least one player says out loud "stop looking at me, look at the map."
