## Overview
A competitive hidden-hunt for 4 players (one Keeper + three Diggers). The Keeper's phone IS the board: a grid with one buried treasure. Diggers are blind pieces racing across that same grid, each guided only by a private hot/cold reading on their own phone. First to stand on the treasure wins — but the Keeper, who profits if no one finds it in time, may relocate it once.

## Problem
Hot-and-cold is ancient, but on one shared phone it's a solo toy. The itch: make the *simultaneity and privacy* of many hunters the game — each digger reading their own warmth, none able to see the others' clues — and add one betrayal beat (the moved treasure) that only makes sense when the board is genuinely hidden.

## How it works
The host TV shows fog: three anonymous crawling dots, a collective 'the room is getting warmer' aura, a timer, and tension music — never the grid. The **Keeper's phone** privately shows the full 7x7 board: treasure cell, all three Digger positions, and a single-use **RELOCATE** button. Each **Digger's phone** shows a d-pad and one private warmth bar reading *their own* Manhattan distance to the treasure, bucketed (freezing→boiling) — no coordinates, no sight of rivals. Every 3s the server resolves all queued moves simultaneously and pushes each Digger their new private warmth. When the Keeper relocates, every Digger's warmth lurches at once, and the pure deduction hook fires: *did I misread, or did the loot just move?* First Digger onto the treasure cell wins; if the timer runs out with no one on it, the Keeper wins.

Per-phone is load-bearing: three Diggers submit *simultaneous secret* moves and each receives a *private, individually-computed* warmth signal, while the Keeper holds the one true board. A single passed phone can't run three private distance oracles at the same instant — the fun is that no hunter can peek at another's heat.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room, or Socket.IO over Tailscale Serve). Data model: `{ board:{w,h}, treasure:{x,y}, diggers:{id,pos}[], relocateUsed, tick }`. Server owns treasure, computes each digger's warmth bucket server-side (never sends the cell), and broadcasts only aggregated aura to the host. Sync: 3s tick; Diggers POST a direction, server resolves collisions, pushes per-phone warmth. Hard part: anti-cheat (warmth is derived server-side so no client ever learns the treasure early) and tuning the bucket curve so hot/cold is legible without giving exact position — plus making the single RELOCATE feel like a fair twist, not a rug-pull.

## v1 scope
- 1 Keeper + 3 Diggers
- One 7x7 board, one treasure, one relocate, one round, 90s
- Warmth = 4 buckets by Manhattan distance
- Host aura + end-of-round path reveal only

## Out of scope
- Multiple treasures, obstacles, digger-vs-digger blocking
- Keeper lying beyond the one relocate, multi-round scoring
- Reconnection, spectators

## Risks & unknowns
- Blind 4-bucket hunting may feel random with no landmarks — bucket tuning is critical.
- The relocate could feel cheap; needs a clear tell or cost.
- Is Keeper-wins-on-timeout a fun incentive or a stall incentive?

## Done means
Four phones join, the Keeper sees the board and three Diggers see only private warmth bars, a full round runs to either a Digger landing on treasure or a Keeper timeout, and the end screen replays all three blind paths on the TV.
