## Overview
Delve is a cooperative roguelike party game for 3 players, played on a shared host TV plus one PWA per phone. It steals the roguelike's core loop — a procedural dungeon, fog of war, permadeath, and a ticking resource — and shatters the map across three private screens so the dungeon can only be reassembled by talking.

## Problem
Roguelikes are lonely solo pixel-crawls, and co-op ones just put everyone in front of the same screen. There's no reason each player needs their own device. Delve makes private, partial knowledge the entire point: no one can win alone, and no single phone holds the map.

## How it works
One 12x12 dungeon is generated server-side. The three players spawn in separate rooms. Each PHONE shows only its own avatar's 5x5 vision cone — the tiles it can currently see — plus its inventory (its key, whether it holds the torch token). Nothing else. The shared TV shows an abstract "noise map": fuzzy blips for monster movement and rough player pings, but NO walls and NO layout. A single shared torch is a 90-second global countdown on the TV.

Because each phone only sees its own surroundings and the TV deliberately hides the geometry, players must speak to stitch the dungeon together ("I'm in a corridor running north, dead-ends left"). Movement is simultaneous and real-time. Traps are invisible until you're adjacent; step on an unseen one and you die instantly, dropping your key where you fell. All three keys must reach the exit before the torch dies — so the surviving two must retrace a dead teammate's route from memory.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `dungeon` grid (server-only), `players[{pos, key, alive, fogSet}]`, `monsters[{pos, path}]`, `torch` timer. Sync: server ticks ~8Hz and pushes each phone ONLY its visible-tile diff — never the full grid — which both prevents screenshot-cheating and keeps bandwidth tiny. The TV subscribes to a separate low-resolution "noise" stream. The genuinely hard part is per-client fog computation each tick plus tuning the noise map so it's tense and informative without leaking the actual layout.

## v1 scope
- 3 players, exactly one 12x12 dungeon, one exit
- 90-second shared torch, static traps, 2 wandering monsters
- Permadeath + dropped key; all 3 keys required at exit
- One round, then a win/lose card on the TV

## Out of scope
- Multiple floors, combat, items/upgrades, meta-progression
- More than 3 players, matchmaking, spectator polish
- Fancy art beyond a tile grid

## Risks & unknowns
- Real-time movement latency on phones over LAN
- Whether verbal map-stitching is delightful chaos or just confusing
- Tiny 5x5 grids risk disorientation; noise map may leak too much or too little

## Done means
Three phones join over the LAN, each sees only its local fog, all move simultaneously; one player steps on an unseen trap and is eliminated with their key dropped; the survivors verbally reconstruct the route, recover the key, and reach the exit before the torch expires, with the TV correctly showing the win — proving private fog + forced verbal coordination is the fun.
