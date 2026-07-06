## Overview
Reroll is a per-phone party auto-battler for 3-6 players — the drafting genre of Teamfight Tactics / Hearthstone Battlegrounds squeezed into five minutes. It's for the friend group that loves the blind-economy paranoia ("is someone hoarding my units?") but will never sit through a 35-minute solo grind.

## Problem
The best tension in auto-battlers isn't the fight — it's the shop. You reroll a private, random store, spending gold you could've saved, gambling on units nobody else can see, while a shared pool silently drains around you. That itch is pure hidden-information party fuel, and no couch game captures it. Watching one screen together destroys the whole point: the fun is that YOUR shop is nobody else's.

## How it works
Each phone privately shows three things: your **Shop** (5 random unit cards), your **Gold**, and your **Board** (3 slots). The host TV shows every player's board as face-DOWN card backs plus a shared **Pool Tracker** (e.g. "Knights: 2 left"). Loop: two 10-second buy phases. Buying a unit atomically removes one copy from the global pool, thinning everyone's future shops — that contention is the whole game. Tap **Reroll** (costs 1 gold) to redraw your private shop and chase a unit before a rival grabs the last copy. Everyone locks; the TV flips all boards and runs a fast round-robin auto-battle, showing damage numbers. Private = shop, gold, board contents. Shared = pool tracker, phase timer, final results.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit Durable Object per room). Data model: `room { pool: {unitType: count}, players: {id: {gold, shop[], board[], locked}} }`. The server owns the pool: a buy is an atomic decrement + reissue of that phone's shop. Sync: server pushes private shop/gold deltas to each phone's socket, broadcasts only the pool tracker + timer to the host. Hard part: **atomic pool contention** — two players hit the last Knight in the same tick, so the server must serialize buys and instantly invalidate the loser's card — plus a deterministic auto-battle resolver quick and legible enough to read on TV in under 15 seconds.

## v1 scope
- 3 players
- Pool of 4 unit types, 6 copies each
- 3 board slots, start 5 gold
- 2 buy phases (10s each), reroll = 1 gold
- One auto-battle; win = most survivors

## Out of scope
Unit tiers/upgrades, class synergies, gold interest, multiple rounds, spectators, reconnection.

## Risks & unknowns
Auto-battle math may read as opaque or arbitrary; with only 3 players contention might rarely bite; blind drafting without synergies could feel random; balancing 4 units by feel.

## Done means
3 phones join via code; each sees a distinct private shop; buying the last copy of a unit removes it from every other phone's shop within 300ms; boards lock, the TV plays a legible auto-battle and declares a winner; a full round finishes under 3 minutes.
