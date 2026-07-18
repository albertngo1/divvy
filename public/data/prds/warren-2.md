## Overview
Warren is a 4-player asymmetric hunt. One player is the Ferret: their phone IS the map — a full tunnel network with every rabbit's live position glowing on it. The other three are rabbits, each blind in their own burrow, seeing only their current junction and a dial that pulses hotter as the Ferret's paw closes in. It's inverted Pac-Man: *one omniscient hunter, many blind prey*, and it's for groups who love a villain with an unfair advantage.

## Problem
'Map-holder guides blind pieces' is almost always cooperative and one-directional. The unexplored itch: make the map-holder the **enemy**, so their total knowledge is menace, not help — and make the prey's blindness the entire source of dread. Communication becomes a trap, because the one person who can hear you is the one hunting you.

## How it works
The warren is a graph of ~14 nodes; three nodes are exits. Each rabbit starts deep inside.

- **Ferret phone (private):** the entire graph, all three rabbit dots, and a paw token they slide one edge per 2-second tick to chase and corner.
- **Each rabbit phone (private):** ONLY its current node, drawn as a hub with 2–4 unlabeled exits to tap, plus a single **proximity dial** (how near the paw is — magnitude, never direction) and a faint depth number hinting whether they're nearing an exit. They can't see the map, the other rabbits, or where the paw actually is.
- **Host TV (shared):** the warren silhouette filling in as tunnels get explored, plus a caught-count — atmospheric for spectators, but too vague to help rabbits navigate.

The delicious tension: rabbits *want* to shout for help, but the Ferret hears every word and reads it against their omniscient map. Silence is safety; a panicked 'I'm at a three-way split near an exit!' is a death sentence. Rabbits win by getting 2 of 3 to any exit within 90 seconds; the Ferret wins by pawing 2 rabbits first.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object). Data model: `{ graph:{nodes,edges}, exits:[...], rabbits:{id:{node}}, paw:{node} }`. Rabbit moves and the Ferret's paw slides are validated server-side against edges. Each rabbit client receives only its node's local subgraph + a scalar `proximity = f(graphDistance(paw, self))`; it never receives coordinates. The Ferret receives the full state. Genuinely hard part: tuning paw speed and proximity-dial falloff so blind prey have a real but sweaty chance — plus generating warrens that are navigable-by-feel, not mazes of pure luck (bias toward short paths and multiple exits).

## v1 scope
- 1 Ferret + 3 rabbits, one hand-authored 14-node warren, one 90s round.
- Tap-an-exit movement, one proximity dial, three exits.
- TV shows caught-count + win/lose only.

## Out of scope
- Procedural warrens, multiple rounds, role rotation, scoring history.
- Rabbit-to-rabbit private channels, scent trails, power-ups.

## Risks & unknowns
- Pure blind navigation may feel like luck — depth hint and dial tuning are load-bearing.
- The 'talking helps the enemy' dynamic might make rabbits go silent and dull; may need a Ferret taunt obligation to keep it lively.
- Ferret advantage could be crushing; paw speed needs playtesting.

## Done means
The Ferret's phone shows three moving rabbit dots on a map no rabbit can see; a rabbit taps blindly through junctions watching only its heat dial; a rabbit who calls out its position gets intercepted because the Ferret heard it — and a playtest ends with rabbits either sneaking two to the exits in silence or getting cornered.
