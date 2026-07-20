## Overview
Wrong Turn is a hidden-role navigation deduction game for 4-6 players. Everyone privately holds what looks like the *same* street map on their phone; the group verbally pilots a courier from START to END. But exactly one player — the imposter, chosen at random — was dealt a map with a single junction altered (a door became a wall, or a wall became a door). Nobody, including the imposter, is told their map differs. The fun is watching the group discover *where* reality forked and then argue about *who* is living in the wrong city.

## Problem
Most hidden-role games hand the imposter a goal ("sabotage," "bluff"). That makes them act shifty. The richest deduction happens when the odd player is arguing in complete good faith — they *are* telling the truth about a world that is subtly not everyone else's. Wrong Turn manufactures exactly that: an honest disagreement with no liar in the room.

## How it works
The shared host screen (TV) shows a fog-of-war grid: only the courier's current tile and the destination marker are visible — never the street layout. Each **phone privately** shows the full map: streets, walls, doors.

Each turn the group proposes one move aloud ("go north"). Every phone privately shows two buttons: **CLEAR** or **WALL** for the proposed direction, resolved against *that phone's* map. Players tap simultaneously. The TV shows only an **anonymized tally**: "4 say clear · 1 says wall." If unanimous-clear, the courier advances. If split, the move is blocked and the group must reroute — and now everyone knows a fork exists nearby, but not who owns it.

After the courier reaches END (or a 6-minute timer expires), every phone privately casts one vote for the suspected imposter. Correct majority vote = group wins; imposter escapes = imposter wins. A short reveal overlays both maps on the TV, highlighting the one swapped edge.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room{ mapId, courierPos, destPos, turnState }`, `Player{ id, mapVariant, isImposter, vote }`. At room start the server picks a base map, clones it, and mutates exactly one edge for the imposter's `mapVariant`. Each phone fetches only its own variant.

Sync strategy: proposals and CLEAR/WALL taps are server-collected per turn; the server computes the tally, decides advance/block, and broadcasts the fogged courier position. Crucially the server never reveals *which* player dissented until the final overlay. The genuinely hard part is **anonymity under a small player count**: with 4 players a lone dissent could be triangulated by tap timing, so taps are buffered and released together, and the tally is order-shuffled. Map generation must also guarantee the swapped edge is actually *reachable and consequential* — a solver checks that the two variants yield different shortest paths, else it re-rolls.

## v1 scope
- 4 players, one 6×6 map, one round
- One pre-authored base map + one hand-authored swapped edge (no procgen yet)
- Anonymized tally, one vote phase, map-overlay reveal

## Out of scope
- Procedural map generation and the reachability solver
- Multiple rounds / scoring across games
- More than one altered edge, or two imposters

## Risks & unknowns
- Timing-based deanonymization at low player counts (mitigated by buffered release)
- A too-subtle swap that never affects the route (mitigated by the solver check)
- Verbal chaos: needs a light turn-order nudge on the TV

## Done means
4 phones on one map, one edge swapped for one player; the group hits a split tally at the fork, reroutes to END, and the vote + overlay correctly reveal whose map lied.
