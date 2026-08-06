## Overview

**Unit B** is a 4–6 player hidden-role game about testimony. The group is collectively describing one apartment — each player's phone holds a handful of private zoomed-in crops of the floor plan, and together they reconstruct it on the TV. One player's crops come from the neighbouring unit: same building, same architect, 90% identical. That player is not confused and not lying. They are describing a real apartment. It's just the wrong one.

## Problem

Most "one of you got different information" games make the odd view *obviously* different, so the imposter knows within four seconds and spends the rest of the round bluffing. The interesting state is the one where you can't tell — where your information is genuine, corroborates the group nine times out of ten, and diverges only on the details nobody has gotten to yet. **Unit B** lives entirely in that state, for the innocents *and* the imposter.

## Problem restated as design constraint

Every false statement the imposter makes must be a true statement about somewhere.

## How it works

The server generates two floor plans from one seed: Unit A, then Unit B as a small mutation of it (a door moved to the other wall, a window count changed 2→3, a closet flipped, an appliance swapped). Roughly four differences, none structural.

Host screen (TV), public and shared: an empty schematic grid of the apartment and a growing **claims board** — every claim anyone submits, attributed, e.g. *"MAYA: the kitchen has three windows."* Contradictions are highlighted in red automatically. The TV never shows the actual plan until reveal.

Each phone, private: three or four tight crops of *their* plan — a corner, a wall segment, one room. **No two players share a crop**, so nobody can hold their phone next to yours and compare; the only channel between views is speech. Each phone also has a claim composer: pick a room, pick a feature, pick a value, submit.

Flow: 3 minutes of open talking while everyone submits at least three claims. Contradictions surface on the TV as they land. Then 90 seconds of argument, then a simultaneous private vote. Innocents win by majority-voting the Unit B player. The Unit B player wins by surviving — and can survive by noticing which of their claims went red and quietly conceding those rooms.

## Technical approach

Socket.IO server behind Tailscale Serve (or a PartyKit room; either works — the state is small).

```
Room { code, seed, planA: Plan, planB: Plan, phase, claims: Claim[] }
Plan { rooms: {id, rect, features: {windows, doors[], fixtures[]}}[] }
Player { id, name, planRef: 'A'|'B', cropIds: string[] }
Claim { playerId, roomId, feature, value, t }
```

Crops are rendered **server-side to SVG** and pushed per socket — a phone receives only its own crop payloads, never a plan object, so there is nothing to inspect. Claims are broadcast to everyone; contradiction detection is a plain group-by on `(roomId, feature)`.

The hard part isn't real-time sync (a dozen claims a minute over one room). It's the **mutation generator**: the differences must be visible in *some* crop, reachable by the claim vocabulary, and non-obvious — a mutation nobody's crop covers makes the imposter undetectable, and a mutation that lands in three people's crops outs them immediately. The generator has to assign crops and mutations together, guaranteeing exactly two or three of the four differences are witnessed by at least one innocent *and* by the Unit B player.

## v1 scope

- One room, one round, 5 players.
- Three hand-authored plan pairs, no generator — picked at random. The generator is v2.
- Four crops per phone, rendered as static SVG at room creation.
- Claim vocabulary of exactly three features: window count, door wall, one fixture per room.
- One vote, one reveal showing both plans side by side with the four differences ringed.

## Out of scope

Procedural plan generation, photos or 3D, more than one imposter, free-text claims, scoring across rounds, reconnection, real estate data of any kind.

## Risks & unknowns

- Floor plans may read as dry to a party audience; the fix is probably naming the rooms absurdly rather than making them prettier.
- The claim composer could feel like data entry. It must be three taps, max.
- With hand-authored pairs, the same three plans get memorized after four games — acceptable for v1, fatal by v3.

## Done means

Five phones join, each receives four distinct SVG crops, and a server log confirms exactly one player's crops came from plan B. Fifteen or more claims land on the TV, at least two contradictions highlight automatically, all five vote, and the reveal ringed the four real differences. In three playtests, the Unit B player makes at least four claims that are *not* contradicted before their first red one.
