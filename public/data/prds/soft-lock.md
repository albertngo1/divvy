## Overview
Soft Lock is a 3-player cooperative party game that steals the metroidvania — gated doors, permanent abilities, backtracking — and splinters its power set across phones. One explorer token moves through one map on the shared screen, but no single person can drive it: each locked door only opens for the player who privately holds the matching ability.

## Problem
Metroidvanias are solo, slow, and about *route knowledge you hold in your head*. That knowledge is the fun — 'oh, I can reach that old door now.' Party games rarely capture route-planning tension. And most co-op phone games devolve into one loud person. Soft Lock forces distributed knowledge: nobody holds the whole key ring, so the route has to be talked into existence.

## How it works
The host TV shows a node-graph map: ~6 rooms connected by icon-coded doors (Dash / Grapple / Phase), a single explorer token, and a move counter. When the explorer sits adjacent to a door, the group wants to move through it — but a door only opens when the player who *owns that ability* taps OPEN.

Privately, each phone shows: (1) the one or two ability icons that player owns, and (2) a glowing 'YOU CAN OPEN THIS' prompt **only when the explorer is currently adjacent to a door that phone can open**. Your phone stays dark next to a door you can't help with. So players must narrate: 'I've got Grapple — is the token near a grapple door?' One mid-map pickup grants a *second* ability to whoever grabs it, unlocking a previously-impassable branch and enabling real backtracking. Wrong turns and dead ends burn moves; run out of moves before reaching the artifact room and the run soft-locks (loss).

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Map { rooms[], doors[{from,to,ability}] }`, `Explorer { roomId }`, `Players[{ id, abilities:Set }]`, `moves:int`. Host subscribes to full state; each phone subscribes to a *filtered* view — its own abilities plus a derived `canOpenNow` boolean recomputed server-side whenever the explorer moves. Movement is a single authoritative reducer: any OPEN tap is validated (does that player own the ability, is the door adjacent?) before advancing the token and decrementing moves. Sync is trivial (turn-paced, no real-time deadline); the genuinely hard part is *information design* — tuning exactly how little each phone reveals so the room is forced to talk without anyone feeling blind, plus generating maps that are solvable but not obvious.

## v1 scope
- Exactly 3 players, one hand-authored 6-room map.
- 3 abilities, 1 mid-map pickup granting a 2nd ability.
- Move budget of 12; single artifact room = win.
- Host screen + phone PWA; no accounts, room code join.

## Out of scope
- Enemies, combat, HP, timers.
- Procedural maps, multiple levels, campaigns.
- Reconnect/spectator flows, animations beyond token-slide.

## Risks & unknowns
- A single dominant talker could solve it alone — mitigate by giving each player a genuinely private 'canOpen' signal so intel must flow both ways.
- Balancing 'stuck and stumped' vs 'obvious' is a knife-edge in one hand-made map.
- 3 abilities may be too few for real backtracking payoff.

## Done means
Three phones join a room code; each sees only its own abilities and lights up only when adjacent to a door it can open; the group verbally routes the token, grabs the pickup, backtracks through a newly-openable door, and reaches the artifact within 12 moves — with a losing run when they waste moves — all state authoritative on the server.
