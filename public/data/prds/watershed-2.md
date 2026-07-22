## Overview
Watershed is a 3-player cooperative convergence game for a phones-plus-TV party. The host TV shows a stylized river delta — one spring at the top branching down through a handful of forks to several sea-mouths at the bottom. Each player privately guides a single raindrop from the spring to the sea, choosing a direction at every fork. The room wins only if all three raindrops took the *identical* path. It's for people who like Schelling-point games and the quiet thrill of discovering everyone's brain took the same turn.

## Problem
Most "match the group" games converge on a single flat choice (a word, a tile, a tap). They lack a sense of a shared *journey*. Watershed makes convergence a route through a branching structure — the fun is realizing at fork three that you all instinctively went the same way at forks one and two.

## How it works
The host generates a small binary-ish tree: 1 spring, 3 tiers of forks, ~5 leaf mouths, each fork and mouth given an evocative flavor label ("the Reeds," "Otter Bend," "the Shallows"). 

PRIVATE (each phone): the full delta rendered on the player's screen with their own blue raindrop at the spring. At each fork they tap the branch they believe everyone else will also take; the drop slides down and the next fork lights up. They can back up and re-route freely until they lock. No player ever sees another's drop or choices.

SHARED (host TV): the same delta but with only a per-junction *heat* overlay — at each fork, how many of the three drops have currently flowed left vs. right (e.g. a thickening/thinning channel), never *who*. Leaf mouths glow by how many drops have pooled there. It shows convergence pressure without revealing any single route.

When all three lock, the server compares the full fork-sequences. Identical → the TV animates all three drops streaming down the shared channel into one mouth, which "floods" as the win. Any divergence → the earliest fork where they split is highlighted and the round resets with a fresh delta.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `Room { treeSeed, players: {id, path:[L/R,...], locked} }`. Tree is deterministic from `treeSeed` so every client renders identically. Phones send incremental `fork_choice` events; server keeps each private path server-side and broadcasts only aggregated per-junction counts to the host. Sync is trivially easy (turn-based, no real-time timing) — the genuinely hard part is *heat-map design*: showing enough convergence signal to keep it tense without leaking a full route (which would collapse it into copying). Tune by showing counts only at forks where ≥2 drops have already passed.

## v1 scope
- Exactly 3 players, 1 delta, 1 round.
- Fixed 3-tier tree, 5 mouths, hand-authored labels.
- Lock-in + identical-path check + flood/win animation.
- Host heat overlay = channel thickness per fork.

## Out of scope
- Scoring, multiple rounds, variable player counts.
- Procedurally pretty water rendering; a schematic tree is fine.
- Reconnect handling beyond a naive rejoin.

## Risks & unknowns
- Too-obvious trees have a single dominant path (boring); too-symmetric trees never converge. Needs label-authoring to seed one "gravitational" route among near-ties.
- Heat overlay could leak enough to make it a copying exercise.

## Done means
Three phones on a laptop join a room, each privately routes a raindrop through the same 3-tier delta, and when (and only when) all three fork-sequences match, the host TV floods the shared mouth and declares the win.
