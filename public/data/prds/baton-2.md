## Overview
Baton is a cooperative voice race for 3-5 players on a shared host screen plus one phone each. A single glowing "baton" has to be passed around the room so that it touches every player exactly once and returns to the start — a Hamiltonian path the group can only discover by talking, because no single phone can see the whole route.

## Problem
Most voice party games devolve into one loud person steering. Baton hard-forces distributed information: nobody can win by shouting the answer because nobody HAS the answer. The itch it scratches is the Spaceteam scramble of "wait — can I even pass to you?" under a countdown.

## How it works
At setup the server builds a directed graph over the players with exactly one Hamiltonian cycle plus a few dead-end edges as bait. Each phone privately shows only its OWN out-edges: e.g. your screen says "You may pass to: MAYA, or LEO." It does NOT show who can pass to you, nor anyone else's edges.

One random player starts holding the baton (their phone glows gold, big CATCH button dark). To pass, the holder shouts a name from their private list — "Maya, catch!" — and Maya, if the baton is live and she's a legal target, sees her CATCH button light and taps it within a 2s window. The baton moves; her phone now shows HER out-edges. If the holder names someone not on their list, the server buzzes and the baton stays (a wasted second). If they name someone already visited, it's a dead branch — they have to back out verbally. The host screen shows only an anonymous ring with the baton's current position and a shrinking timer; it never reveals edges. Win when all players are lit "visited" and the baton returns to start before time runs out.

The fun is the table cross-talk: "who can reach Sam? nobody's saying they can — Leo, is Sam on your list?"

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object; Socket.IO over Tailscale Serve for the homelab). Data model: `players[]`, `adjacency{playerId: [targetIds]}` (server-only truth; each client receives only its own slice), `baton{holderId, visited[Set], startId}`, `deadline`. Sync: passes are server-validated events — client taps CATCH, server checks (baton live? edge legal? within window?) and broadcasts the new holder. The genuinely hard part is graph generation: guarantee exactly one Hamiltonian cycle, tune bait edges so the puzzle is solvable-but-tangled at 3-5 nodes, and keep it winnable given human voice latency (name-shout → hear → tap is ~1.5s, so windows and total clock must budget for it).

## v1 scope
- 3-4 players, one round, one graph, ~75s clock.
- Text names only (no mic/ASR — passing is a shout + manual CATCH tap).
- Host ring + timer; win/lose screen.
- Server-generated graph with one valid cycle + 1-2 bait edges.

## Out of scope
- Speech recognition / auto-detecting the shouted name.
- 5+ players, multiple batons, scoring/leaderboards.
- Reconnect handling mid-round.

## Risks & unknowns
- Is it solvable without ASR, or does manual CATCH feel clunky? Playtest.
- Graph difficulty tuning — trivial at 3, maybe frustrating at 5.
- Latency on the 2s catch window over real phones.

## Done means
4 phones join, each sees only its own out-edges, a shouted-name + CATCH relay routes the baton through all four and back inside the clock, illegal passes buzz, and the host correctly declares win when the cycle closes.
