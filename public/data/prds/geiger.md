## Overview
Geiger is a fast, physical race for 4–6 players. One phone is the **Operator's** board — it shows a hidden grid with a single buried prize and every detector's live position. Every other phone is a **Detector**: a blank screen that does nothing but *vibrate*, faster the closer its holder is to the prize. Nobody sees the map. Nobody sees anyone else's buzz. It's Marco Polo rebuilt as a silent, haptic metal-detector sweep.

## Problem
'Blind maze' party games lean on the map-holder narrating aloud, which turns everyone into passive listeners waiting for their name. The itch: give each blind player a *continuous private sense* they read with their thumb, so the whole room is heads-down, feeling their way, converging on the same spot without a single spoken word.

## How it works
The Operator's phone (shared conceptually, but held privately) renders a 6×6 grid: prize tile hidden, plus colored dots for each Detector's current tile. The **host screen** (TV) shows only theatre — a fog-of-war grid, a rising tension meter, and detectors as anonymized blips with no proximity data. Each Detector's phone shows a big colored panel and NOTHING else; it pulses haptics at a rate mapped to Manhattan distance to the prize (adjacent = frantic machine-gun buzz, far = one slow thud every 2s). To move, a Detector swipes a direction; moves resolve on a shared 3-second tick so everyone advances simultaneously. First Detector to step onto the prize tile wins the round; the Operator scores on how many ticks it took (fewer = better showmanship of a well-hidden prize).

Private-per-phone is the entire point: if one phone were passed around, you'd feel everyone's proximity and instantly triangulate. Because each buzz is felt only by its holder, nobody can tell if a rival is hot or cold — you commit blind.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room) holds `{prizeTile, detectors:{id,tile}, tick}`. Host and Operator subscribe to full state; Detector clients receive ONLY their own `distance` scalar each tick — the server never sends the grid or others' positions to a Detector, so proximity can't leak by inspecting traffic. Detector PWAs call `navigator.vibrate([...])` with a pattern whose period is a function of distance. The genuinely hard part is haptic honesty across a shared tick: buzz patterns must restart cleanly each 3s window so a player can compare 'this tick vs. last tick' without stale vibration bleed, and iOS Safari's flaky `vibrate` support needs a visual fallback (a pulsing brightness ramp).

## v1 scope
- One 6×6 grid, one prize, one round.
- 1 Operator + 3 Detectors.
- Swipe-to-move on 3s ticks; distance→buzz mapping.
- Win screen: who found it, in how many ticks.

## Out of scope
- Multiple prizes, walls/obstacles, Operator sabotage.
- Reconnect grace, spectators, scoring across rounds.

## Risks & unknowns
- iOS haptics are unreliable; the brightness fallback may feel worse. Prototype the *feel* of distance→buzz FIRST.
- Tuning the buzz curve so 'warmer/colder' is legible without a display.

## Done means
4 phones join via room code; 3 blind players feel their buzz ramp as they swipe toward a prize only the Operator can see; the first to the tile triggers a win screen — with no player ever seeing the map or another player's proximity.
