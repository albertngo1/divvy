## Overview
Undercard steals the auto-battler (Teamfight Tactics / Super Auto Pets) genre and squeezes it onto phones. Each player privately drafts a small team from a shared shop and arranges it on a hidden bench; combat then auto-resolves on the TV with zero live input. It's for 3-4 friends who love the tension of committing to a build blind and cackling when the dice fall. No twitch skill — pure economy, synergy, and reading the room.

## Problem
Auto-battlers are the best downtime-killer in modern gaming because everyone plans simultaneously, but tabletop versions collapse into one shared board everyone can see. The itch: the whole thrill is that opponents' boards are HIDDEN until they smash into yours. That secrecy is impossible with one passed device — it demands a private screen per player.

## How it works
Each round has two synchronized phases. **Shop phase (30s):** the host TV shows a shared shop row of 5 units (each a type — Brawler/Archer/Healer — with a cost). Every phone privately shows the same row plus YOUR gold, YOUR bench, and YOUR unit pool. You tap to buy; buying decrements shared stock (last-copy contested by a simultaneous high-count tiebreak). **Position phase (20s):** privately drag your bought units onto a 3x3 grid — front row tanks, back row shoots. Opponents cannot see your board. On lock, the server pairs players and deterministically simulates each combat (initiative → target → damage) and the **TV plays the fight replay** so the room sees the collision for the first time. Losers take life damage. Three rounds, last standing wins.

## Technical approach
PartyKit Durable Object per lobby is authoritative. Data model: `shop[]` (shared stock), `players{id → {gold, life, bench[9], pool}}`. Phones send `buy(unitId)` and `commit(placement)` intents; the server validates gold/stock and rejects illegal buys. The genuinely hard part is **deterministic, seeded combat resolution that both feels fair and is reproducible for the replay** — the server runs the sim once, emits an event log, and the TV animates from that log (phones never simulate). Sync is coarse (phase transitions on a shared countdown), so no sub-100ms real-time needed — only atomic last-copy buy arbitration.

## v1 scope
- 3 players, one lobby, no accounts
- Exactly 3 unit types with one hard synergy each
- Fixed 4-unit shop, 3 combat rounds, then a winner
- Text/emoji units; combat replay is a simple lane animation

## Out of scope
- Items, leveling, unit tiers, economy interest
- Reconnection, spectators, matchmaking beyond the room
- Fancy combat art or sound

## Risks & unknowns
- Is 3-type synergy deep enough to make positioning matter? May need a 4th type.
- Last-copy contention feels bad if silent — needs a clear "outbid" toast.
- Deterministic sim bugs = unfair replays; must fuzz-test resolution order.

## Done means
Three phones join, each privately buys and positions unseen by others, the server resolves paired combat deterministically, the TV replays every fight, life totals update, and after 3 rounds one player is crowned — with no two players ever having seen each other's board before the clash.
