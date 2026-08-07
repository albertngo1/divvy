## Overview
A 60-second, real-time land-grab for 3–6 people in one room. A single circle lives on the TV. Every player drags a wedge of it on their phone. Your score is the arc you claim — but any overlap with another player's wedge zeroes **both** overlapping claims. The catch: your phone's radar of everyone else's claims degrades in proportion to your own greed. Wanting more makes you blind to the neighbours you're about to run into.

## Problem
Most party games reward converging on the same answer. The room's whole social instinct — read the group, land where they land — is a liability here, and there's no existing party game that punishes it *continuously*, in real time, with a dial in your hand.

## How it works
1. TV shows an empty circle, a 60s clock, and a single "pressure ring": a bar showing the total arc claimed by the room, with no positions and no names.
2. Each phone shows the same circle. You drag one finger to set your wedge's **centre**, pinch or drag a second handle to set its **width** (5°–120°).
3. Your phone also renders a *ghost radar*: a heat blur of where other wedges currently sit. Its angular resolution is `blur = base + k × yourWidth`. A 10° claim gives you a near-crisp map. A 100° claim smears the whole ring into fog.
4. Players talk out loud the entire time. Talking is legal and useless — nobody can verify a claimed heading, and the TV never shows one.
5. Lock in any time (locking freezes your wedge; your radar goes crisp but you can no longer move). At 60s everything locks.
6. Reveal: TV draws all wedges at once. Overlapping pairs flash red and both score 0. Clean wedges score their degrees. Biggest total wins.

Private vs shared: the phone holds your position, your width, and *your personally-degraded* view of the world. The TV holds only aggregate pressure. Two players sitting next to each other are looking at genuinely different maps of the same circle.

## Technical approach
Host browser tab + phone PWAs + a PartyKit Durable Object per room.

Data model: `Room { phase, tEnd, players: { id, name, centreDeg, widthDeg, locked } }`. Phones send `{centre, width}` at 15 Hz, throttled and coalesced server-side.

Sync: the server is authoritative and ticks at 10 Hz. Critically it does **not** broadcast the true state — for each player it computes a *personalised* payload: the other wedges quantised into `ceil(360 / blur_i)` buckets with additive noise seeded per-player-per-tick, so blur is stable rather than shimmering. Roughly 6 different worldviews leave the server every tick.

Hard part: making per-client degraded views feel *fair and legible* rather than laggy. Blur must be visibly a consequence of your own greed, not of your wifi. Mitigation: phone-side interpolation between ticks, and an always-crisp on-screen readout of your own blur radius as a shaded arc.

## v1 scope
- One 60-second round, 4 players, no lobby art
- Wedge = centre + width, one finger + one handle
- Fixed blur formula, no tuning UI
- Reveal screen with red overlap flashes and a score list
- Room code join, no accounts, no persistence

## Out of scope
- Multiple rounds, tournaments, elimination
- Obstacles, pre-claimed dead zones, powerups
- Spectators, replays, sound design

## Risks & unknowns
- Blur may read as "broken" instead of "expensive." Needs the shaded-arc affordance from day one.
- Nash-ish equilibrium may be dull (everyone takes a tiny safe sliver). Tune scoring superlinearly in width to force risk.
- 6 personalised streams at 10 Hz is fine; 12 players may not be.

## Done means
Four phones on the same wifi run one round end to end; at least one collision fires and visibly zeroes two players; each player, shown a screenshot of their own radar at t=30s, cannot reconstruct the true wedge positions of the two greediest players.
