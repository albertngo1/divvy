## Overview

A 4-player cooperative dungeon crawl for a living room, 10 minutes, where the map and the *meaning* of the map live on different phones. One player is the Cartographer: their phone shows the whole grid, drawn entirely in abstract glyphs they cannot interpret. The other three are the Party: their phones show no map at all, only a private fragment of the legend. Nobody can act alone; the Cartographer describes shapes, the Party translates them into consequences.

## Problem

Blind-maze party games always put one omniscient guide against blind followers, which collapses into one person barking left/right while everyone else presses buttons. The guide has all the fun. Splitting *geometry* from *semantics* means the guide is as lost as the pieces — they can see the terrain perfectly and still have no idea whether the party is walking into a door or a pit.

## How it works

The TV shows a 5×5 grid with every tile blank except the party's current position and a breadcrumb trail of tiles already stepped on. No glyphs, ever.

The Cartographer's phone privately shows the same 5×5 grid *filled with glyphs* — ◇ ✳ ⌁ ▤ ● — plus the exit marker. They see terrain and no consequences.

Each Party phone privately shows two legend entries and nothing else, e.g. "⌁ — costs 2 lamp oil to enter" / "▤ — you may only leave the way you came." It also shows that player's own lamp oil (starts at 4, private) and a four-way D-pad.

Each turn: the Cartographer talks — naming glyphs on adjacent tiles, drawing shapes in the air, whatever — but may never show their screen. The three Party members then *simultaneously* commit a direction. Majority wins; a three-way split wastes the turn. The server applies the true glyph effect, deducts oil privately, and the TV announces only the outcome in flavor text ("the floor gives; someone gasps"), never the cause. Because oil is private, a player who is nearly empty must argue for a safe route without being able to prove why — and the legend fragments overlap only partially, so two players can both be honestly certain of opposite things.

Win: reach the exit within 8 moves with no one at 0 oil.

## Technical approach

PartyKit room = one Durable Object holding authoritative state: `grid[25]` of glyph ids, `legend: glyph → effect`, `pos`, `oil[playerId]`, `turn`, `commits[playerId]`. Clients never receive full state — the server derives per-socket projections (`cartographerView`, `partyView(playerId)`) and pushes only those. Phones are a PWA with an add-to-homescreen QR join.

Sync is turn-based, so the hard part isn't latency — it's the commit barrier and leak prevention. Directions are held server-side and only broadcast after all three arrive or a 20s timer fires, so nobody can vote last with information. The second hard part is generation: a seeded generator plus a solver that rejects any board solvable using fewer than two legend fragments, or solvable by ignoring glyphs entirely.

## v1 scope

- Exactly 4 players, 1 fixed hand-authored board, 1 round
- 5 glyphs, 6 legend entries split 2/2/2
- Simultaneous commit + majority resolution + 8-move limit
- TV: grid, breadcrumb, move counter, flavor line
- Win/lose screen, then hard reset

## Out of scope

Random generation, rotating the Cartographer role, more than 4 players, sound, scoring across rounds, reconnect handling, animation.

## Risks & unknowns

The Cartographer may drown in glyph-naming and become a bottleneck; may need a fixed vocabulary card on their screen. Players might trivially pool legends verbally in turn one — the oil economy and the wasted-turn cost are the only pressure against that, and may be too weak. Flavor-text-only feedback risks feeling arbitrary rather than deducible.

## Done means

Four phones join by QR; each shows a demonstrably different screen; the Cartographer's device never receives legend data over the wire (verifiable in devtools); a full 8-move round resolves to a win or a loss with correct private oil accounting; two playtest groups reach the exit at least once and argue out loud about a glyph.
