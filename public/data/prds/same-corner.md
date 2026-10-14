## Overview
Same Corner is a silent co-op game for 3-5 people in one room. It is built on the rendezvous problem from math: two parties in a symmetric world have to meet without any shared sense of direction. Everyone gets the same small graph (about 12 dots and some lines). Each phone draws it with a different random layout, rotation and reflection. Players walk their tokens and have to end up on the same dot. The only usable landmarks are structural: the one dead end, the only triangle, the dot with five lines.

## Problem
Schelling-point games ("pick the same thing as everyone") usually fall back on shared labels: same words, same colors, same screen positions. Once labels are shared, the focal point is obvious or arbitrary. Here every label and position is taken away, so players have to reason about what is *intrinsically* special and guess what the others find special.

## How it works
- **Phone (private):** your own drawing of the graph, a private random embedding. You see only your own token. Tap an adjacent dot to move there, at most one move every 1.2 s. The phone never shows other tokens.
- **Host screen (shared):** no graph at all. It shows a 90 s timer and one live readout: **largest group, e.g. "3 of 4 together"**, plus a pulse whenever that number changes. It never says where the group is.
- **Win:** all tokens on one dot for 3 continuous seconds. **Lose:** the timer runs out.
- No talking, no pointing. Peeking at a neighbor's phone barely helps, because their drawing is permuted and you can't see your own token on it.
- Each graph is hand-built with 2-3 *competing* focal points (a unique hub vs. a unique leaf vs. a unique cycle). The tension is which kind of special the room picks, and the group meter is the only feedback.

## Technical approach
- **Server:** an authoritative room (PartyKit or Durable Object). State: `graph {nodes, edges}`, `players[id] {node, lastMoveAt, perm, layoutSeed}`, `largestGroup`, `holdStart`.
- Each client gets the graph *with node IDs replaced by a per-player permutation*, plus its own coordinates. Clients send `move(localNodeId)`. The server maps it back, checks adjacency and the rate limit, then recomputes group sizes.
- **Hard part:** stopping leaks. Node IDs, ordering in the payload and edge-list ordering must all be shuffled per player, or a curious player could match screens by DOM order. The layout generator must also avoid embeddings that reveal symmetry, so it uses force-directed layout plus random rotation and reflection.
- Latency barely matters (moves are rate-limited), but the 3 s hold timer runs on the server only.

## v1 scope (humiliatingly small)
- One hand-authored 12-node graph.
- One round, 90 s, 3-4 players.
- Tap-to-move, group meter, win/lose screen.
- Start positions spread so no two players start adjacent.

## Out of scope (for now)
- Procedural graphs, difficulty tiers, multiple rounds, scoring history.
- Directed edges, moving obstacles, a hidden traitor who wants to stay apart.

## Risks & unknowns
- If one focal point dominates, the game is solved in 10 s. Graph authoring is the whole design.
- If no focal point exists, the game turns into a random walk, which feels bad.
- The group meter could be too informative (hill-climbing) or too little. It might need to update only every 3 s.

## Done means
Four people on four phones, with a laptop as host, play one 90 s round of a hand-built graph. Screenshots show each phone drawing the same graph differently. The host meter matches the server's true largest group. Out of 5 playtest rounds, at least one is won and at least one is lost, and testers can explain afterward *which* special dot they were aiming for.
