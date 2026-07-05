## Overview
A simultaneous, same-seed roguelike race for 3-6 friends. Everyone plays the *identical* procedurally-generated dungeon on their own phone at the same moment, with permadeath — and every death cross-pollinates the other runs. It's the Spelunky-daily trash-talk ("you died *there*?") turned into a live, shared-room event.

## Problem
Roguelikes are solo and asynchronous. The most social thing about them — comparing deaths on the same seed — always happens second-hand, hours later on a leaderboard. Put everyone on one seed at one time, live, and let deaths physically litter each other's runs.

## How it works
The host rolls **one seed** → one single-floor dungeon layout. Every phone runs that exact dungeon privately and simultaneously: tap an adjacent tile to move, grab loot, dodge the one enemy type, reach the exit. Permadeath: touch the enemy or let the 45-second timer expire and you're dead.

The twist: when you die, your position and carried loot drop as a **corpse cache** that appears in *everyone else's still-running dungeon* at that same tile — a juicy, risky detour tagged with your name. **Private on your phone:** your actual dungeon, your inventory, your fog of war. **Shared on the TV:** a spoiler-free race view — one dot per player showing depth/score, plus a live kill-feed ("Alex died to the Wight on the east door"). No map spoilers on the TV.

Per-phone is load-bearing twice over: everyone needs their *own private live view* of the same dungeon at once (one passed phone makes simultaneous racing impossible), and corpse-drops only bite because each run is private, live, and yours.

## Technical approach
Authoritative server holds the seed and deterministic dungeon-gen; **phones render locally from the seed**, so no per-tile streaming. Data model: `room {seed, players[]}`, `player {pos, hp, inv, alive}`. The only cross-phone traffic is events: `pickup`, and `death → corpseDrop{tile, loot, name}` broadcast to all live clients, who inject it into their local map. Sync is a low-rate event bus, not frame sync — deaths and drops are the only messages, so latency is forgiving. The hard part is **deterministic generation** that's byte-identical across every phone from one seed, and injecting corpse caches instantly without any client desyncing ("that wasn't in my dungeon").

## v1 scope
- Single floor, one enemy type, 45-second timer
- Tap-to-move on an ~8×8 grid, one loot type
- Permadeath + corpse-drop cross-injection
- Host kill-feed + depth dots
- 3-4 players

## Out of scope
- Multiple floors, character classes
- Combat beyond touch-death
- Meta-progression, movement-replay ghosts

## Risks & unknowns
- Is a 45-second tap-move micro-roguelike actually fun?
- Deterministic-gen bugs breaking the shared-seed promise
- Corpse-injection timing edge cases
- Could feel like parallel solo games if the kill-feed is weak

## Done means
One seed spins up identical dungeons on 3+ phones; everyone plays at once; a death broadcasts a corpse cache that *visibly appears* in the survivors' dungeons; and the TV shows a live depth race + kill-feed that resolves to a survivor (or last-to-die) winner.
