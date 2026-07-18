## Overview
Squall is a 3–4 player real-time cooperative party game about *complementary blindness*. One player is the Weather Deck: their phone IS the board — a dark grid crawling with a moving storm and a hidden safe harbor. The other players are boats. Here's the twist that makes it sing: the boats are **invisible on the Weather Deck's map**, and the storm is **invisible on the boats' phones**. Nobody sees the whole picture. It's for groups who like frantic verbal coordination (Keep Talking / Spaceteam energy) but with the information split spatially instead of by manual.

## Problem
Most 'one player has the map' games collapse into one omniscient navigator barking orders while everyone else obeys like drones — boring for the pieces. The itch: make the *pieces* hold real, unique knowledge the map-holder desperately needs, so every phone matters and nobody is a passenger.

## How it works
Grid is 6×6. A 'squall' — a highlighted row or column — telegraphs on the Weather Deck's phone one beat before it sweeps, then strikes. Any boat caught in a struck cell is flung back to a corner.

- **Weather Deck phone (private):** the full grid, the safe harbor cell, and the incoming squall lines — but only faint ripples where boats *might* be, never their real positions. They must shout weather: "Storm hitting the whole left edge in three… TWO…"
- **Each boat phone (private):** a blank grid showing ONLY its own dot, which it steers continuously by tilt (accelerometer). No storm, no harbor, no other boats. The boat must announce itself — "I'm dead center, second from bottom" — for the Weather Deck to route it.
- **Host TV (shared):** an abstract barometer and a strike counter for spectators; the actual map is revealed only at the end.

Win: all boats sitting on the harbor cell simultaneously for 2 seconds, before 8 strikes land. The fun is the crosstalk — boats calling coordinates, the Weather Deck triaging who's about to die versus who's nearly home.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `{ grid, harbor:{r,c}, squallQueue:[{axis,index,fireAt}], boats:{ id:{r,c,vx,vy} } }`. Boats stream tilt as velocity at ~15Hz; server integrates positions and is the single source of truth for collisions and harbor-lock. Each client gets a **filtered projection**: boats receive only their own dot; the Weather Deck receives storm + harbor + jittered decoys. The genuinely hard part is tuning the storm telegraph window and tilt sensitivity so the game is tense but winnable — too fast and it's luck, too slow and there's no urgency. Compass-free (tilt only) to skip calibration.

## v1 scope
- 3 boats + 1 Weather Deck, one 6×6 grid, one round (~4 min).
- Tilt steering, one sweeping squall type, one fixed harbor.
- TV shows only strike count + win/lose.

## Out of scope
- Multiple storm types, rounds, scoring/leaderboards.
- Rotating roles, obstacles, currents, spectator map view.

## Risks & unknowns
- Tilt drift/dead-zones across phones; may need a per-device recenter tap.
- Verbal chaos could be noise not fun; grid labeling (columns A–F) may be needed so callouts are crisp.
- Latency on knock-backs feeling unfair.

## Done means
Three phones steer three dots the map-holder cannot see; the map-holder calls a squall; a boat that ignores the warning gets flung to a corner; and a playtest group wins or loses purely on how well they talked — with no single phone ever showing both storm and boats.
