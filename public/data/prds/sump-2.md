## Overview
Sump is a 3-player cooperative panic game for one game night's worth of friends. One player is the Navigator on the surface; the other two are Divers crossing a flooded cave passage they cannot see. It is a tense, talky, two-way-blind maze where the map lives on exactly one phone and everyone else is a piece groping in the dark.

## Problem
'Guide the blind person through the maze' is a known party bit, but it's usually one-way: the guide sees everything, the mover sees nothing, and the mover has no agency. The itch here is to make BOTH sides partially blind and give the blind pieces a costly way to reveal themselves — so information becomes a resource players fight over, not a firehose the guide sprays.

## How it works
The cave is a small grid with passages, dead ends, and silt-out cells. The **Navigator's phone (the board)** privately shows the full map, the exit, and — crucially — NOTHING about where the divers currently are, except when a diver pings. Each **Diver's phone** privately shows only four direction taps, a personal **air gauge** (depletes each tick), and a **PING** button. It shows no map and no teammate. Ping costs air and lights that diver's cell on the Navigator's board for 2 seconds.
Play runs in ~8-second ticks. During each tick the Navigator talks ('left-diver, I think you're near the west fork — go north, then hold'), while each Diver privately locks one move. On tick end, all divers move simultaneously; hitting a wall wastes the tick, entering silt blacks the Navigator out on that diver for one tick. Divers win by both reaching the exit before either runs out of air. The Navigator never sees air gauges; divers never see the map — so a diver low on air must decide whether to spend a precious ping to correct the Navigator's mental model.

## Technical approach
Host browser tab (fog + tick timer + win/lose) plus phone PWA clients over an authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room{grid, tick, phase}`, `diver{id, pos, air, pendingMove, pingUntil}`, `navigatorView{revealedCells:[{pos, expiresTick}]}`. Sync: server owns positions; phones send `move`/`ping` intents; server resolves on tick boundary and broadcasts role-filtered state (divers get only their own state; Navigator gets map + expiring reveal blips). The genuinely hard part is the filtered fog: the server must NEVER leak diver positions into the Navigator channel except via time-boxed ping reveals, and must resolve simultaneous moves + collisions deterministically each tick.

## v1 scope
- Exactly 3 players: 1 Navigator, 2 Divers.
- One hand-authored 6×6 cave, one exit, one round.
- Fixed air (12 ticks), fixed ping cost (2 air), 8s ticks.
- Text-only Navigator (voice is just the room talking).

## Out of scope
- Multiple caves, procedural generation, difficulty tiers.
- Currents, monsters, tethers, more than 2 divers.
- Reconnect grace, spectators, scoring/leaderboards.

## Risks & unknowns
- Balance: too much air makes pinging pointless; too little makes it hopeless. Needs playtest tuning.
- Whether the two-way blindness is legibly fun or just frustrating.
- Tick length: 8s may feel slow with 2 divers.

## Done means
Three phones join a room; the Navigator sees a map and no diver dots; each diver sees only taps + air + ping; a ping lights one cell on the Navigator's screen for 2s and nowhere else; simultaneous moves resolve per tick; the room can win by both divers exiting and lose by air-out — verifiable in one live session.
