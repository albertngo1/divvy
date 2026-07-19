## Overview
A hidden-role social-deduction game for 4-6 players. Everyone is an office worker memorizing the same building floor plan for an evacuation drill. One player secretly holds a subtly-wrong plan — and, crucially, doesn't know it. The host TV is a neutral coordinator; each phone is a private floor plan.

## Problem
Most hidden-role games hand the imposter a "you are the traitor" card, so they know to lie — the tension is pure acting. The tastier version is when the imposter genuinely believes they're helping and the friction comes from divergent ground truth, not deception. Social deduction is also almost entirely talk; spatial reasoning is an untapped tell.

## How it works
- The server deals a floor plan: rooms, doors, corridors, one marked EXIT. Innocents get identical plans. The imposter's plan is topologically nudged — one door relocated or two rooms' adjacency swapped — enough to change the fastest route, subtle enough to feel plausible.
- Each phone PRIVATELY shows only that player's plan (pannable/zoomable) plus a shared "you are here" start room.
- The host TV shows only the round timer, turn order, and a running text log of the narrated route — never a map.
- Play is collaborative wayfinding. On your turn you narrate one leg aloud ("From Copy Room, north door into the Atrium"); the next player continues from there. The server logs each asserted move to the TV.
- The imposter, faithfully reading their divergent plan, eventually asserts an adjacency that clashes with everyone's mental map ("north door into the Atrium?? that's the Server Room"). Contradictions surface verbally.
- After two laps (or on timer), every phone PRIVATELY shows a vote list; everyone secretly fingers the odd one out. The group wins if the majority nails the imposter. Because even the imposter votes without knowing, they may accuse an honest player whose true description clashed with their wrong plan.

Private phones are load-bearing: divergent maps must be held simultaneously and secretly — a single passed phone can't show five people five maps, and the whole game is the grind between private ground truths.

## Technical approach
- Host tab + phone PWAs + authoritative WebSocket server (one PartyKit Durable Object per room).
- Data model: Room{id,label,x,y}, Door{roomA,roomB}, per-player planId. Server stores the canonical plan plus one mutated variant and assigns the variant to the imposter.
- Plan generation: lay a small grid of 6-8 rooms, spanning-tree doors plus a couple of extras; mutation moves one door edge to a different valid pair, keeping the graph connected.
- Sync: server passes a turn token; narration is done via a room-picker on the phone ("I moved to __") so the TV log is authoritative, not free text. Votes tally on a server tick.
- Hard part: generating a mutation that's subtle — it must change the optimal route without being obviously broken. Tune with a divergence heuristic (1 edge changed, ≥2 rooms' fastest path affected).

## v1 scope
- 4 players, exactly one imposter, one building, one round.
- One hand-authored 7-room plan + one hand-authored mutated variant (skip procgen).
- Room-picker narration (no free text, no voice).
- Single private vote, binary win/lose reveal.

## Out of scope
- Procedural plans, multiple imposters, cross-round scoring, voice input, an animated map on the TV.

## Risks & unknowns
- Mutation too obvious (imposter outed on turn 1) or too subtle (never surfaces) — needs playtest tuning.
- Players with weak spatial memory may look guilty; could be a feature or a frustration.
- Room-picker narration may feel clunky versus just talking.

## Done means
- 4 phones each load a private plan (3 identical, 1 mutated), the TV logs narrated legs, a contradiction is reachable within two laps, all phones cast a private vote, and the server reveals whether the group identified the mutated-plan holder — in one seated playtest.
