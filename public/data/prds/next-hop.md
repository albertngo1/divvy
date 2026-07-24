## Overview
Next Hop turns a computer-networking routing algorithm into a chaotic voice party game for 3-4 players. The room *is* a network; each player is a node that can only see its own links. To deliver a packet you must verbally gossip your connections until a path emerges — before the hop counter runs out.

## Problem
Distributed systems have a gorgeous property no party game exploits: no single node knows the whole graph, yet packets still find their way by everyone shouting local knowledge. That 'partial-view coordination under a deadline' feeling is exactly the Spaceteam itch, but framed around topology instead of buttons.

## How it works
At setup the server generates a random directed graph over the players. Each phone privately shows ONLY its own outgoing neighbors: "You can reach: ANA, BO." Nobody sees the full map — this asymmetry is the whole game.

A PACKET card spawns on one random phone: "Deliver to PRIYA — TTL 5." The holder sees they're holding it and a big FORWARD panel listing only their own neighbors as tap targets. But their neighbors probably aren't Priya, so they must shout: "I've got a packet for PRIYA — who can reach her?" Other players answer aloud with their own links ("I can reach Priya!" / "I reach Bo and Cy!"). The holder taps the neighbor they judge best; the packet instantly appears on that phone, TTL decrements by 1, and now THAT player is holding it and must forward. The host TV shows only an anonymized breadcrumb trail (hops taken, TTL remaining) and a HOP LOG — never the graph.

Deliver to Priya before TTL hits 0 to win the round. Dead ends (forwarding into someone who can't progress) burn TTL, so the room must genuinely reason about the topology out loud. Per-phone privacy is load-bearing: if the graph were visible on one shared screen it's a trivial pathfinding puzzle; the fun is that the map only exists in fragments across separate phones and voices.

## Technical approach
Authoritative WebSocket server. Data model: `Graph{adj: {playerId: [neighborIds]}}`, `Packet{holderId, destId, ttl}`. Sync is simple and low-frequency — the only mutating event is FORWARD (holder taps neighbor); server validates the tap is a legal edge, moves `holderId`, decrements `ttl`, broadcasts updated holder/TTL to all phones and the TV. Each phone only ever receives its own `adj[me]`, never the full graph. The genuinely hard part isn't real-time sync (forwards are human-paced) — it's *graph generation*: guaranteeing at least one path within TTL while inserting tempting dead-ends and cycles, so the puzzle is solvable but not obvious, and no single player's local view trivially reveals the whole route.

## v1 scope
- 4 players, one packet, one round, TTL 5
- Fixed graph difficulty (guaranteed 2-3 hop solution, 1-2 dead ends)
- Phones show: my neighbors, holding indicator, forward taps; TV shows hop log + TTL

## Out of scope
- Multiple concurrent packets / congestion
- Weighted edges, latency costs, scoring across rounds
- Any visualization of the full graph, ever

## Risks & unknowns
- Might resolve too fast to feel like a game — needs TTL/dead-end tuning.
- Talkative players could dominate; quiet players' links stay hidden. Consider forcing each phone to broadcast its links once.
- With only 4 nodes the graph may be too small to be interesting; sweet spot for player count is unknown.

## Done means
4 phones + a TV connect; each phone sees only its own neighbor list; a packet spawns with TTL 5; players shout reachability, the holder taps a legal neighbor, the packet hops (TTL decrements) across phones, and the round ends WIN when it reaches the destination in time or LOSE when TTL hits 0 — with the TV showing the anonymized hop trail throughout.
