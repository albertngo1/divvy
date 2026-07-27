## Overview

**Cut Through** is a 3-player silent-convergence game for a living room with a TV and three phones. The room shares one street map. Every player must independently trace the *same* route from START to the DEPOT — but each phone privately overlays that player's own toll charges on a handful of roads, so the cheapest route for you is never the cheapest route for them. Convergence has a price, and only you can see yours.

## Problem

Most "match each other" party games are pure Schelling points: everyone stares at identical information and guesses the obvious answer. That's a coin flip dressed as a game. The itch here is convergence *against a private incentive* — you know something the others don't, it's pulling you off the group line, and you can't say a word about it. The fun is the visible ache of giving up your shortcut.

## How it works

The **host TV** shows a hand-drawn 9-junction street map (~14 roads), START bottom-left, DEPOT top-right, all roads unlabeled and toll-free. That's all it ever shows during planning: no routes, no counts, no names.

Each **phone** shows the same map, plus 3–4 gold coin badges sitting on roads — *your* tolls ($1–$3 each), dealt differently to every player and never transmitted to anyone else. You trace a route by tapping junction to junction, watch your running toll total tick up privately, and hit LOCK.

When all three lock, the host animates a single delivery van. It leaves START and advances one road at a time **only while all three routes agree on the next road**. At the first divergence it stalls: brakes, headlight flicker, that junction gets ringed in red. The room learns exactly *where* they split — never *who* split, and never what the alternatives were. Everyone re-plans from scratch. Four attempts.

Win when the van reaches the DEPOT. Then the reveal: all three toll layers bloom onto the host map at once, each player's total paid is displayed, and the room finally sees whose expensive road everyone else was blithely driving down.

## Technical approach

PartyKit Durable Object per room (or Socket.IO over Tailscale Serve). Model: `room {code, phase, mapId, attempt, players[{id, name, tolls:{edgeId:cost}}], routes:{playerId:[edgeId]}}`. Phones send `LOCK{route}`; the server validates contiguity from START, no repeated edge, ≤8 edges.

The hard part isn't tick-rate sync — it's **reveal discipline**. The server computes the longest common prefix across the three edge lists and pushes the host *only* that prefix plus the stall junction id. Toll maps and full routes are never serialized to any client but their owner until `phase === 'reveal'`. One sloppy broadcast of full room state and the game is over. The van animation on the host is driven purely from the prefix payload, so it's deterministic and replayable.

## v1 scope

- Exactly 3 players, join by 4-letter code, no lobby polish
- One hand-authored map, hard-coded
- Tolls from a fixed dealt table (no randomization)
- 60s planning timer, 4 attempts, then lose
- Win/lose + per-player toll totals at reveal; no scoring model

## Out of scope

Multiple maps, procedural generation, 4+ players, persistent scores, one-way streets, traffic, spectators, reconnect recovery.

## Done means

Three phones on a real Wi-Fi network lock three routes; the host van visibly stalls at the correct divergence junction; no client's network traffic contains another player's tolls or route before reveal; a room that agrees edge-for-edge sees the van reach the DEPOT and all three toll layers appear.
