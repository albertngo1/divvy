## Overview
Sump is a 4-player cooperative panic game. One player is the **Surveyor**, whose phone is the only view of a branching cave system with a rising waterline. The other 2–3 are **Divers**, each stuck at a private node, each seeing only the exits immediately around them — as blank, unlabeled doors. The Surveyor can talk freely; the trap is that no diver sees the map and every diver's local orientation is scrambled, so the Surveyor must convert global directions into each diver's private frame, fast, before the sump floods. For friends who like Keep-Talking-and-Nobody-Explodes tension without a manual.

## Problem
Most 'guide the blind' games collapse to one clear channel: 'go north.' The itch here is that 'north' is meaningless to a diver who is rendered rotated and mirrored relative to the map. The Surveyor holds all the knowledge and none of the hands; the divers hold the hands and none of the knowledge — and even a correct instruction is wrong until it's re-expressed per person.

## How it works
The cave is a small graph of ~12 nodes with a designated dry EXIT. The waterline rises one graph-hop per 12s tick; any diver on a flooded node loses a breath (3 total, shared pool).

Each tick, every diver simultaneously commits one move by tapping a door.

- **Diver phone (private):** their current node drawn egocentrically — 2–4 doors around a center avatar, unlabeled, oriented to a per-diver random rotation/mirror that stays fixed all game. A breath meter. No node names, no neighbors' positions.
- **Surveyor phone (the map):** the full graph, waterline, every diver's dot and — crucially — a little compass badge on each diver showing that diver's personal rotation, so the Surveyor can mentally translate.
- **Host TV (shared):** a dramatic side-cutaway of the flooding cave with anonymized diver bubbles and the rising water — tension theater, no useful routing info.

The Surveyor calls things like 'Ana, your door on the *far right* — take it.' If Ana's frame is mirrored, the Surveyor must say her left. Divers all move at once, so the Surveyor is time-slicing three translations against a countdown. Win: all divers reach EXIT before breaths run out.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) holds `{ graph, waterline, divers:[{node, frame:{rot,mirror}, breaths}] }`. Phones are PWA clients. Divers send `commit(doorIndex)`; server maps door→neighbor using that diver's stored frame, resolves all commits on the tick boundary, advances waterline, broadcasts. The genuinely hard part is **frame consistency**: the door a diver taps must deterministically map to the same edge the Surveyor sees, so the rotation/mirror transform lives server-side and is applied identically to render (diver) and to interpret (commit). Tick sync via server-clock countdown broadcast every 250ms.

## v1 scope
- 1 Surveyor + 3 Divers, single fixed 12-node cave, one EXIT.
- 3 shared breaths, waterline rises every 12s, one round.
- Fixed per-diver rotation/mirror assigned at start.
- Win/lose screen; no accounts, no lobby polish.

## Out of scope
- Multiple caves / procedural graphs, difficulty tiers.
- Traitor Surveyor, hazards beyond water, items.
- Reconnect handling, spectators.

## Risks & unknowns
- Frame translation may be *too* hard and just feel frustrating — needs the compass badge to make it a solvable puzzle, not a coin flip.
- Simultaneous commits + one talker may starve the third diver; tune tick length.
- Egocentric door layout must be legible on small screens.

## Done means
Four phones join, three divers each see a distinct rotated door-view, the Surveyor sees the map with per-diver compass badges, ticks flood the cave on schedule, and a playtest group can either reach EXIT or drown — with at least one moment of 'no, YOUR right' confusion.
