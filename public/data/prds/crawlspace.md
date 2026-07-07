## Overview
Crawlspace steals the asymmetric survival-horror loop (Dead by Daylight / Pac-Man in the dark) for a 4-player party format: one Monster vs. three Survivors moving on a shared node-graph 'house.' It's for groups who want a tense, shrieky co-op-vs-one round in five minutes flat, no minis, no manual.

## Problem
Hidden-movement games (Scotland Yard, Nyctophobia) are brilliant but need a referee, blindfolds, or an honor system, and the hunted players can always glimpse the board. A phone-per-player rig makes *genuinely private, simultaneous* vision trivial — the exact thing those games contort themselves to fake. This is the purest possible case for per-phone architecture.

## How it works
The house is a 6-node graph. Three fuses are hidden in nodes; one exit node is locked until all fuses are collected.

The game ticks every ~6 seconds. During a tick, everyone secretly picks a move on their phone:
- **Survivor phone (private):** shows ONLY your current node, its exits, and whether a fuse is here. You tap an adjacent node to move, or 'grab' a fuse. You cannot see other survivors or the Monster unless one shares your node next tick.
- **Monster phone (private):** shows the full map with faint 'noise' pings — a heat blip on any node a survivor moved *into* last tick — but not who or how many. The Monster moves one node per tick; landing on a survivor's node downs them.

All moves resolve simultaneously each tick. The **shared TV** shows a dramatic redacted view: fog everywhere, the fuse counter, occasional stingers ('a floorboard creaks in the west'), and a heartbeat that quickens as the Monster nears *anyone*. Survivors win by banking 3 fuses and reaching the exit; the Monster wins by downing two survivors first.

Because every player's vision is different and moves are simultaneous, a single passed-around phone cannot exist — the whole game is the asymmetry of what each screen hides.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object; Socket.IO over Tailscale Serve fallback). Data model: `Graph{nodes,edges}`, `Room{tick, fuses:[nodeId], exit, phase}`, per-player `{nodeId, role, downed, committedMove}`. Sync: a tick barrier collects all secret moves (or auto-holds on timeout), then the server resolves movement, collisions (Monster∩Survivor = down), fuse grabs, and noise-ping generation atomically, then pushes each phone a *view* computed for its role — survivors get a fog-clipped payload, the Monster gets the ping map. The hard part is the per-role redaction: the server must never send a survivor any state outside their node, and must derive noise pings without leaking identity.

## v1 scope
- Exactly 4 players: 1 Monster, 3 Survivors.
- Fixed 6-node map, 3 fuses, 1 exit, one round.
- 6-second ticks, simultaneous secret moves.
- Win/lose: 3 fuses + exit vs. 2 downs.
- TV shows fog map + fuse counter + heartbeat only.

## Out of scope
- Perks, items, multiple monsters, map generation, reconnect.
- Real-time analog movement (v1 is tick-based).
- Voice suppression rules — survivors *may* talk; that's part of the tension.

## Risks & unknowns
- 6-node map may resolve too fast or feel claustrophobic — needs size tuning.
- Noise pings must be informative enough to hunt but vague enough to scare; balance is delicate.
- Simultaneous ticks can create ambiguous swap-collisions (two units crossing an edge) needing a clear rule.

## Done means
Four phones join with correct roles, six ticks resolve with each survivor seeing only their own node and the Monster seeing only noise pings, fuses bank, and the round ends in a correct win/loss on the TV — with no phone ever receiving state it should not see.
