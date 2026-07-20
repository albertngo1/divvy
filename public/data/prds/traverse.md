## Overview
Traverse is a cooperative spatial puzzle for 3 players standing spread across a room. Each phone is a surveyor's transit: it measures the ANGLE you turn between two sightings. The crew wins by physically arranging their bodies until the angles they each measure add up to a valid closed triangle on the host's map. No one phone knows the whole shape.

## Problem
Compass party games usually reduce to 'hold a bearing in your sector.' That's a solo task glued to a screen. Traverse instead makes the *relationship between where people physically stand* the puzzle: the interior angles of a triangle must sum to 180°, and the only way to hit that is to move real bodies around a real room while each phone measures its own corner. The room is literally the board, and geometry does the refereeing.

## How it works
Three players stand at the three corners of a loose triangle. Each phone PRIVATELY instructs its player: 'Sight the TV (backsight) to zero your bearing, then turn and sight the player wearing GREEN (foresight).' Holding the phone flat and pointing it, the player faces the TV to zero, then rotates to aim at the named teammate; the phone records the magnitude of that turn as its measured corner angle, shown privately as a single number with a hotter/colder nudge toward the crew's target.

The host TV shows the SHARED map: a triangle whose three corners fill in as each surveyor locks a reading, plus a single 'closure error' meter (how far the three angles are from summing to 180°). Crucially, the TV shows the assembled shape and the error, but each phone shows only its own angle and who to sight — so players must talk ('I'm at 80, we're over, someone widen out') and physically walk to reshape the triangle until all three lock simultaneously and closure error drops under threshold for 3 seconds.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve). Phones use `deviceorientation` (`webkitCompassHeading` on iOS) sampled at ~30Hz. Calibration: facing-the-TV zeroes each device's heading, absorbing per-device magnetometer offset. Data model: `players[{id, sightTargetId, zeroedHeading, cornerAngle, locked}]`; host derives `sum` and `closureError`. Sync strategy: phones stream deltas, server holds authoritative angles and broadcasts the map + error at ~10Hz. The genuinely hard part is compass reliability — indoor metal deflection and drift corrupt bearings, so the design leans on RELATIVE turn magnitude (foresight minus backsight) rather than absolute north, re-zeroing on every measurement, and requiring a brief stable hold to reject jitter.

## v1 scope
- Exactly 3 players, one fixed triangle target (equilateral-ish, 180° total)
- Fixed sight assignments (each sights the next player)
- One round; win when closure error < threshold held 3s
- Host = triangle + single error meter

## Out of scope
- Quadrilaterals/polygons, multiple rounds, scoring/leaderboard
- Absolute-position mapping, distance measurement

## Risks & unknowns
- Indoor compass deflection near metal furniture may break readings
- Players may not reliably sight a person accurately with a flat phone
- Whether re-zeroing per sight adequately cancels drift over a 60s round

## Done means
With 3 phones, a crew that physically forms a near-equilateral triangle and each correctly sights TV-then-teammate drives the host closure error under threshold and triggers a win, while a bad arrangement keeps the error visibly high — reproduced in two different rooms.
