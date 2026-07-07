## Overview
Portage is a silent cooperative maze game for 3–4 people. One player (the **Guide**) holds a phone that is the only map of a hazard cavern. The other 2–3 (the **Porters**) each move a token across that map — which they cannot see — steering only by private nudges the Guide sends to their individual phones. It's for groups who like tense, wordless coordination.

## Problem
Every 'guide the blind' party game collapses into one person yelling 'no, YOUR left!' across the room. There's no bandwidth limit, no privacy, and the phone is wasted as a lobby. Portage makes the phone a *private per-player output channel* and starves the Guide of words, turning navigation into triage.

## How it works
- **Host TV (shared):** the cavern grid rendered as fog — Porter tokens are visible dots, hazards are hidden. A shared **Lantern** meter and the exit are shown. Everyone watches Porters wander.
- **Guide phone (PRIVATE):** the full grid — safe tiles, pits, the exit, and live Porter positions. The Guide is *muted* (house rule + host mic-check prompt). Each tick they may tap ONE Porter and swipe a direction, lighting that Porter's pad. That's it: one spotlight per tick.
- **Porter phones (PRIVATE):** a big 4-way pad, terrain blank. If the Guide spotlighted you this tick, your chosen direction glows + a haptic buzz confirms 'safe'; otherwise you're guessing. Each Porter commits a move; all moves resolve together on the tick.
- Stepping a Porter onto a pit cracks the shared Lantern meter. Get every Porter to the exit before the Lantern dies.

The fun is the Guide's agony: three tokens creeping toward pits, one spotlight, constantly abandoning someone.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit Durable Object per room, or Socket.IO over Tailscale Serve). Data model: `{ grid:[[tile]], porters:[{id,pos,pendingDir}], lanternHP, tick }`. Guide emits `{porterId,dir}`; Porters emit `pendingDir`; server resolves all pending moves on a fixed ~1.5s tick, checks hazards, broadcasts a redacted state to each role (Porters get only own pos + spotlight flag). Hard part: making the spotlight buzz land on the right phone within the tick window and keeping the Guide's mute honest — the fun evaporates if they just talk. Solve mute socially (host countdown + optional mic-level shame meter) rather than technically for v1.

## v1 scope
- 1 Guide + 2 Porters, exactly.
- One fixed 5×5 grid, ~6 pits, one exit.
- One spotlight per tick, Lantern = 3 HP.
- One round; win = both Porters reach exit with HP > 0.

## Out of scope
- More grids, procedural gen, difficulty tiers.
- Moving hazards, fog-of-war for the Guide.
- Reconnect/rejoin, spectators, scoring history.

## Risks & unknowns
- Guide talking anyway (kills it) — needs strong mute ritual.
- Tick pacing: too fast = chaos, too slow = boredom.
- Two silent-guide feelings may read as 'just Battleship' if triage tension is weak.

## Done means
Three phones join a room; the Guide sees a map two Porters can't; a spotlight buzz reaches exactly one Porter per tick; a mis-step cracks the shared meter; the round ends in a win or a dead Lantern.
