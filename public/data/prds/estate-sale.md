## Overview

Estate Sale is a 4-player game of a floor plan that only one person can see. One player is the Realtor, holding a private map of a six-room house on their phone. The other three are Buyers, each independently touring the house room by room, seeing only what the Realtor *describes* — and the Realtor has been secretly instructed to misrepresent exactly one room. It's for groups that enjoy the slow, dinner-party-shaped tension of trusting a narrator too long.

## Problem

Social deduction usually asks "who is lying?" as an abstract vote. The lie has no geometry. The itch here: make the lie *spatial and load-bearing* — a false claim about where a door goes strands a specific person in a specific room, and the wrongness surfaces as a physical contradiction between two Buyers' experiences rather than as a hunch.

## How it works

The host TV shows six blank room cards (Foyer, Kitchen, Study, Cellar, Nursery, Attic), the round clock, and — as Buyers move — a growing list of *public rumors* the Realtor has broadcast. It never shows the true floor plan.

The **Realtor's phone** privately shows the true adjacency graph: which rooms connect, which doors are one-way, and three hidden VALUE tokens sitting in rooms. It also shows a live dot for each Buyer. Their sole action: tap a room and send that Buyer a one-line description drawn from a fixed menu — "two doors, one leads down", "dead end, smells of damp", "this room adjoins the Kitchen". Menu-only, so the lie is structured, not improvised prose. Their phone also shows their secret assignment: one specific room they must misdescribe every single time it comes up.

Each **Buyer's phone** privately shows only their current room name, the descriptions the Realtor has sent *them* (nobody else's), and a set of unlabeled exit buttons. Buyers move simultaneously and independently — three parallel tours through one house, none aware of the others' position. Stepping into a room holding a VALUE token banks it publicly on the TV.

Endgame: after 4 minutes, each Buyer privately sketches the adjacency they believe exists by dragging the six room cards into a graph on their own phone. Scoring is Buyers' collective map accuracy versus the truth, minus a bonus the Realtor earns for every wrong edge that touches their assigned lie room. Then the true map is revealed on the TV, side by side with all three Buyer sketches, which is the actual payoff moment.

The per-phone requirement is total: three simultaneous private tours, three divergent private description logs, one private truth. Pass a single phone around and there is no game — the whole point is that Buyer A heard "dead end" about the room Buyer B is currently standing in.

## Technical approach

Host tab + phone PWAs + one Durable Object per room over PartyKit. Data model: `House { rooms[6], edges: [{a, b, oneWay}], tokens }` (server-authoritative, never sent to Buyers), `Buyer { id, roomId, log[] }`, `Realtor { lieRoomId }`. Messages: `DESCRIBE {buyerId, roomId, phraseId}`, `MOVE {exitIndex}`, `SUBMIT_SKETCH {edges}`.

Hard part is fan-out correctness, not throughput: every description must go to exactly one Buyer and be echoed as a *rumor* on the TV without revealing which Buyer received it. That means two serializations of the same event with different redaction levels — the classic place these games leak. The exit buttons must be labeled by index, not destination, and the server must resolve `exitIndex` against the true graph, so the client never holds enough state to reconstruct the map.

## v1 scope

- Exactly 4 players, 6 rooms, one 4-minute round
- Fixed hand-authored floor plan; no generation
- 8-phrase fixed description menu
- One assigned lie room, three VALUE tokens
- Sketch phase, reveal screen, single score line

## Out of scope

- Free-text descriptions, voice, multiple lies, Realtor-innocent variant
- More than one house, replay variety, player counts other than 4
- Buyers seeing or messaging each other

## Risks & unknowns

- Six rooms may be too small a graph — the lie could be trivially triangulated in 90 seconds, or the game may be over before the clock
- Menu-only descriptions may feel flat compared to letting the Realtor talk; the whole design bets structure beats freedom here
- The sketch UI on a phone is fiddly; drag-a-graph on a 375px screen is a real risk
- Realtor may have too little to do between description taps

## Done means

Four phones join. The Realtor's phone shows a floor plan; the three Buyers' phones provably do not. A description sent to Buyer 1 appears on Buyer 1's phone and on the TV rumor feed, and appears on no other Buyer's phone. Three Buyers move independently and can occupy different rooms simultaneously. At time-up, all three submit sketches and the TV renders true map + three sketches with an accuracy count. One group plays start to finish and correctly identifies the lie room at least once out of three test sessions.
