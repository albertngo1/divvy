## Overview
Dibs is a simultaneous-claim party game for 3 players on a shared TV plus one phone each. A grid of treasure sits on the host screen. Each round everyone secretly taps the tiles they want. Grab a tile alone and it's yours; grab the same tile as someone else and it detonates — nobody gets it. The twist: every player privately sees a DIFFERENT value on each tile.

## Problem
Greedy grab-fests usually reward whoever's fastest. Dibs makes wanting the same thing the whole risk: the more obviously valuable a tile looks to you, the more likely a rival wants it too and blows it up. Anti-coordination with hidden, asymmetric stakes.

## How it works
The host TV shows a 3×3 grid of tiles, face-up but blank of numbers. Each phone privately overlays that same grid with ITS OWN secret value map — the center tile might be worth 9 to you and 1 to your neighbor. Players get 10 seconds to secretly tap up to two tiles to claim, then lock in.

Reveal: the host lights each tile. Tiles claimed by exactly one player award that player their private value and glow their color. Tiles claimed by two or more players SHATTER on the host screen — nobody scores, and the animation shows only that it was contested, not by whom or for how much. After three rounds (fresh value maps each round), highest total wins. Private phone view (your value map + your taps) vs. shared host view (blank grid, then the reveal of who-got-what and what shattered). Because your value map is yours alone, you can't just pass one phone around — the private, per-player pricing is the engine of the bluff.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model per round: `{ tiles:[9], valueMaps:{playerId:[9 ints]}, claims:{playerId:[tileIdx]} }`. Server generates value maps (each tile's per-player values drawn so there's tension: at least a couple of tiles are high-value to two players). Phones submit locked claims; on the round timer the server resolves: single-claim → award, multi-claim → shatter. It broadcasts the public resolution to the host and each player's private new value map to their phone. Hard part is less real-time sync (claims are turn-batched) and more value-map generation — tuning overlap so collisions feel like a real gamble, not random, plus a clean simultaneous lock-in with a countdown that tolerates a late tap without leaking timing to other phones.

## v1 scope
- 3×3 grid, exactly 3 players
- 3 rounds, up to 2 claims each per round
- Integer value maps, single-claim award / multi-claim shatter
- Running score on host between rounds

## Out of scope
- Variable grid sizes, >3 players
- Negotiation/talking mechanics, alliances
- Partial-credit or splitting contested tiles
- Persistent profiles, matchmaking

## Risks & unknowns
- Value-map generation: too little overlap = no collisions (boring), too much = every tile shatters (frustrating). Needs tuning.
- With no info on rivals' maps, round 1 may feel like a coin flip; the arc across 3 rounds must teach reads.
- Is 3×3 too small to bluff meaningfully?

## Done means
Three phones each show a distinct private value map over the same host grid; players lock secret claims under a timer; the server correctly awards solo tiles and shatters any tile claimed by 2+; scores tally across 3 rounds and a winner is declared, with no phone ever seeing another's values or claims before reveal.
