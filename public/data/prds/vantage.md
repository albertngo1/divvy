## Overview
Vantage steals **fog of war** from real-time strategy and makes it the whole game. A competitive buried-cache race for 3–4 players. Its inversion of the Jackbox formula is the point: normally the TV is shared truth and phones are inputs — here the TV is *dark* and each phone is the only source of vision.

## Problem
Fog of war is RTS's richest mechanic — asymmetric knowledge, scouting, bluffing — and it's almost never social. Party deduction games usually hand everyone the same board. Vantage gives each player a genuinely *different, privately accumulated* picture, which is exactly what one-phone-passed-around can't reproduce.

## How it works
An 8×8 grid hides a single buried **cache**. The shared TV shows only the grid outline, every player's scout **dot** (positions are public), and a running count of flags planted — nothing else. All terrain is fogged on the TV.

Each player's **phone privately** shows only the tiles their own scout has stepped on. Every stepped tile reveals a **heat value** (distance to the cache, RTS-minimap style). Over a real-time 60-second round you tap to move your scout one adjacent tile at a time, building a private heat trail you triangulate from. When you're sure, you plant a **flag** on a tile. First correct flag wins; if the timer expires, the closest flag wins.

The mind-game is the private/public split: rivals see your dot moving but not your readings, so a confident straight-line march invites shadowing — and a feint away from the cache can misdirect them. Private accumulated vision is your entire edge, and it accrues on every phone simultaneously, which is why one shared phone breaks the game completely.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Durable Object / PartyKit or Socket.IO over Tailscale Serve). The server holds the true grid, the cache location, and each player's revealed-tile set. Phones send `move` intents; the server validates adjacency, computes the heat value, and returns the reveal **only to that player's socket**. Public dot positions and flag counts broadcast to everyone + the TV.

Data model: `Room{grid, cacheXY, phase, endsAt}`, `Player{id, pos, revealed:Set<tile>, flag}`. Sync: per-socket filtered state — the cache location and any player's private reveals must **never** be serialized to the wrong client. Hard part: authoritative private fog with no leakage; the wire to each client carries only that client's legal knowledge plus public dots.

## v1 scope
- One 8×8 grid, one cache, 3 players
- Real-time 60-second round, tap-to-move adjacent
- Heat value shown on each stepped tile (Manhattan distance)
- One flag per player; first correct flag wins, else closest at timeout
- TV: grid outline, live dots, flag count

## Out of scope
- Multiple caches, obstacles, fog-clearing items
- Scout vision radius >1, tilt/compass movement
- Multi-round matches, scoring history

## Risks & unknowns
- Is triangulation from bare distance readings fun or fiddly? May need a directional "ping" instead of a scalar.
- Snowball risk: an early lucky heat drop could decide it — tune grid size / heat granularity.
- Reading a tiny fogged map on a phone must stay legible.

## Done means
3 phones join, the TV shows a fogged grid with three moving dots, each phone shows only its own heat trail, a player plants a flag on the true cache tile, the server declares the winner, and one full 60-second round plays end-to-end without leaking the cache or anyone's private reveals.
