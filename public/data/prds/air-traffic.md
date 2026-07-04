## Overview

Cooperative real-time chaos game where one phone is the tower's radar screen and every other phone is a single pilot flying one plane. The tower operator sees all planes converging on an airport and shouts routing calls ("Delta 42, descend to 3000!"); each pilot's phone shows only their own altimeter, heading, and speed. Land every plane before the timer or before two planes collide. Spaceteam DNA but with actual spatial coordination instead of just knob-shouting.

## Problem

Spaceteam-style shouting games are fun but abstract — the "spatial" hook is decorative. Real air traffic control is the Platonic ideal of asymmetric-info coordination: one god's-eye view, many limited local views, urgent communication, obvious failure state. Nobody has translated it into a party form. Per-phone is load-bearing because the map (tower view) MUST be on one screen while each pilot MUST have their own private cockpit — you can't play with one phone passed around.

## How it works

Room code join. First joiner is tower controller (up to them to accept); others are pilots (up to 6). Tower's phone renders a top-down radar with 3-6 plane dots moving toward a single airport; each dot has a call sign, altitude readout, and speed. Pilot phones show ONLY their own plane's altitude/heading/speed dials + big buttons: `climb`, `descend`, `turn L`, `turn R`, `throttle up/down`. Tower shouts "United 118, turn left 20 degrees, descend to 2000"; pilot taps buttons to comply; radar updates. Land = plane crosses runway threshold at correct altitude + heading + speed within tolerance. Score = planes landed; game ends on collision or timeout (3 min).

## Technical approach

Socket.IO on homelab (matches Albert's existing spaceship-crew game architecture, could even share libs). Room state = `{planes: {id: {x, y, alt, hdg, spd, target_pilot_id}}, tower_id, score, elapsed}`. Server ticks at 10Hz, integrates plane physics (simple 2D + altitude), broadcasts full state to tower, subset (just the pilot's own plane state) to each pilot. Pilot buttons send `throttle_delta` / `pitch_delta` events; server applies with rate limits. Collision detection: any two planes within X units horizontally + Y units vertically = game over. Airport render as a small strip; landing check = strip x-range + altitude ≤ 100 + heading within 15° of runway heading.

## v1 scope

1 tower + 3 pilots, 3 planes total (one per pilot; tower doesn't "control" — just directs), 3-min round, single airport with one runway, fixed spawn positions and initial vectors. Score = planes landed (0-3). No difficulty tiers, no weather, no fuel, no comms system beyond IRL shouting.

## Out of scope

In-game text/voice comms (rely on IRL voice), multiple airports, weather effects, fuel management, plane variety (all planes same physics), animated approach cones, VFR/IFR modes, tournament mode, replay, tower-controlled runway direction changes.

## Risks & unknowns

Physics feel is everything — planes need to respond enough to feel controllable but slow enough to give the tower time to route. Collision tolerance windows will need tuning across playtests. Tower screen readability on a phone (not a TV) may be tough with 3 planes and callsigns; may need to shrink UI radically. Real air traffic vocab may be gatekeepy; needs jokey callsigns ("Big Bird 7, Fluffy Cloud 12") to keep the vibe party. iOS Screen Wake Lock reliability for the tower during 3 min of glancing.

## Done means

4 friends open the room. One takes tower; three take pilots. Tower shouts 3-6 routing calls; pilots respond; all three planes land within the 3-min window at least once across a play session. If someone yells "GO AROUND" and it makes sense in context, v1 shipped.
