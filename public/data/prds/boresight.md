## Overview
Boresight is a cooperative compass puzzle for 4–5 players seated in a circle plus a host screen. Each phone is secretly told to AIM at one other player; together the assignments form a single hidden cycle. The group must discover who points at whom and hold every beam locked simultaneously.

## Problem
Compass party games so far claim static sectors or aim-to-vote-then-reveal. None make the live ACT of aiming at a specific person into a network you complete in real time. Here the circle of seats is the board and every bearing is an edge you have to find with your body.

## How it works
Players sit in a circle in a known order — each confirms a seat number on their phone, then a "point at the TV" step zeroes every compass to a shared reference. Each phone is secretly assigned ONE other seat to aim at (a permutation forming one cycle).

Privately, each phone shows ONLY a compass ring and a LOCKED / not-locked light that turns green when you're currently pointing (within ±20°, computed from seat geometry) at your assigned target — it never names who. The TV shows the circle of seats and, as edges lock, draws the beam segment between those two seats. So everyone sees which links are live, but no one sees the assignments.

You rotate your whole body to sweep the room; when your light greens, you've found your target. But the beam only COMPLETES (win) when all edges are locked at once and held 2s — which forces the group to reconstruct the order and coordinate so nobody drops their aim while coaching a neighbor.

Private vs shared: phone = own compass + own lock light; TV = seat circle + live beam graph + a countdown when all edges are green.

## Technical approach
Host + phone PWAs + WS server. Sensor: `deviceorientation` alpha (`webkitCompassHeading` on iOS). Calibration: each phone records alpha while pointing at the TV → per-device offset. Seat geometry: assume even spacing on a circle, precompute bearing from seat i to seat j on the server; a phone is "aimed" when `(heading − offset) ≈ bearing(mySeat→myTarget)` within tolerance.

Data model: `Room{ seats:[{id,angle,offset}], assignment: cyclePerm, locks:{edge:bool} }`. Sync: phones stream heading ~15Hz; server evaluates each lock, broadcasts the lock set; on all-locked it starts a 2s timer and cancels if any edge drops.

Genuinely hard part: (1) compass drift/tilt error and per-device inconsistency — mitigated by ±20° tolerance and TV-zeroing; (2) deriving inter-seat bearings with no real positions — approximate via even circular spacing and accept the slop; (3) the coordination bottleneck is intended difficulty, not a bug.

## v1 scope
- 4 players in a rough circle
- One hidden 4-cycle assignment
- ±20° tolerance, hold-all-4 for 2s to win
- One round

## Out of scope
- Multiple/branching cycles, real position tracking
- Competitive or timed scoring
- Non-circular seating, saboteur variants

## Risks & unknowns
Indoor magnetic interference degrades compass badly. The even-spacing assumption breaks with lopsided seating. iOS compass permission + calibration adds friction. A degenerate cycle can put two targets at nearly the same bearing, making a seat ambiguous.

## Done means
Four players seated in a rough circle can, from a cold start, discover their hidden targets and hold all four beams locked for 2s within ~3 minutes, in ≥3 of 5 test rounds.
