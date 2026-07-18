## Overview
Dowser is a 3-player cooperative deduction game. One player is the **Diviner**, whose phone is the board — a grid with two diggers on it. The other two are **Moles** whose phones are blind D-pads. The catch: the Diviner doesn't see the treasure either. They see only a distance reading for each Mole and must *triangulate* the buried cell from how the readings change as the Moles move — then walk a Mole onto it and call the dig.

## Problem
The usual 'one sees the map, others are blind pieces' setup makes the map-holder an omniscient tour guide reading directions off a screen — the blind players are just hands. The itch: make the map-holder *also* solve a puzzle. Give them distances, not the answer, so guidance becomes real reasoning, and make that reasoning physically require two pieces in two places at the same moment.

## How it works
A 6×6 grid hides one treasure cell (server-chosen). Two Moles sit on distinct cells.

**Mole phone (private):** a 4-way D-pad and a DIG button. Nothing else — no grid, no heat, no position. Pure blind, moves only on the Diviner's word.

**Diviner phone (the board):** the grid, both Moles as tokens, and for each Mole a live **heat band** (Cold / Warm / Hot / Burning = Manhattan distance). The treasure cell is NOT marked. Two heat readings from two known cells collapse the treasure to a handful of candidates; the Diviner orders a Mole to step somewhere to disambiguate, then routes a Mole onto the deduced cell and says 'DIG.'

**Host TV (shared, ambient):** the grid with treasure hidden, two blank tokens shuffling around, a move counter, and a gold burst on a correct dig — the room watches the fumbling and the payoff.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object). Data model: `treasure:{r,c}`, `moles:{id:{r,c}}`, `movesUsed`. Mole clients send discrete step intents; server validates bounds/occupancy and updates positions. Server computes each Mole's Manhattan distance and pushes **only the band** to the Diviner (never coordinates of treasure), and pushes token positions to Diviner + host. DIG resolves server-side. Sync is trivial (turn-ish, low-frequency) — the genuinely hard part is *tuning the deduction*: grid size, band granularity, and move budget so triangulation is satisfying but a lone Mole wandering can't stumble on it. Coarser bands = more reasoning; too coarse = luck.

## v1 scope
- 1 Diviner + 2 Moles, one round, one treasure.
- 6×6 grid, 4 heat bands, ~20-move budget.
- D-pad + DIG on Moles; grid + per-Mole heat on Diviner; counter + gold burst on host.
- Correct dig within budget = win.

## Out of scope
- Multiple treasures, obstacles, fog, scoring across rounds.
- Adversarial/hidden-role variants.
- Reconnect, accounts, matchmaking.

## Risks & unknowns
- Band granularity is the whole game — needs playtesting to avoid trivial or impossible.
- With one Mole, triangulation collapses; two simultaneous positions are mandatory (this is the load-bearing constraint, not a bug).
- Diviner may just brute-force with the move budget; budget must bite.

## Done means
Three people, one round: the Diviner never sees the treasure marked, each Mole sees only a blind D-pad, and the team wins by the Diviner triangulating from two simultaneous distance readings and guiding a dig. If a single Mole can find it alone, or if the Diviner is handed the answer cell, it fails.
