## Overview
A hidden-role spatial deduction game for 4 players. Everyone privately holds the *same* little metro map on their phone and works together to route a train from the green pin to the red pin — except one player's map has a single connection added or removed, and they don't know it's them.

## Problem
Most 'spot the odd one out' party games run on wording or trivia. There's no good social deduction game built on *spatial* reasoning — where the tell is a route that doesn't quite connect, and the argument is over geometry everyone swears they can see.

## How it works
There is **no public map**. Each phone privately renders an identical 8-station metro map with an Origin (green) and Destination (red) pinned. One randomly chosen player — the **Stray**, not told they're it — gets a map with exactly one edge mutated: a phantom connection that doesn't exist for the others, or a real connection deleted.

Players take turns naming the *next station* on the route out loud. The **host screen** shows only the growing route as a text list of station names (e.g. Airport → Elm → Harbor…) — never the map itself. Because station names travel by voice, everyone can follow the route on their own private map and check whether each hop actually connects for *them*.

The tells emerge naturally: the Stray occasionally proposes a hop that's legal on their map but impossible on everyone else's ('you can go Elm straight to Harbor!' — 'no you can't!'), or vetoes a perfectly valid hop because their map is missing that edge. Both are deniable and argument-rich. After the route reaches the destination or a 90s timer expires, every phone privately votes **whose map is different**. Honest players win by fingering the Stray; the Stray wins by escaping the vote.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `mapGraph {nodes[], edges[]}`, plus per-player `mapView = baseGraph + optional single mutation`; `route = ordered stationIds`, `turnPointer`, `votes{}`. Each phone renders its private `mapView`; proposed hops are appended server-side and broadcast to the host as labels only. Sync is turn-based so real-time contention is trivial. The genuinely hard part is **content, not networking**: tuning the map topology and the single mutation so the divergence is subtle enough to be deniable yet detectable within a handful of hops — too central an edge and it's instant, too peripheral and it never surfaces.

## v1 scope
- Exactly 4 players, one round.
- One hand-authored 8-station map, one mutation type (single missing edge).
- Turn-based station naming, host shows route text list.
- One private vote, reveal screen.

## Out of scope
- Multiple map packs, generated maps, difficulty tiers.
- Scoring across rounds, imposter-team variants.
- Any on-screen map rendering on the host.

## Risks & unknowns
- Divergence calibration (above) is the whole game.
- Players may argue about a hop for reasons unrelated to the mutation (noise vs signal).
- 4 honest-identical maps means limited private variety — needs the mutation to carry all the tension.

## Done means
Four phones join, three show an identical map and one shows a one-edge-mutated map; players build a route by voice, the host lists it live, and a private vote correctly surfaces the Stray more often than chance in playtests.
