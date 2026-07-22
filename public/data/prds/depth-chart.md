## Overview
Depth Chart steals the autobattler (TFT, Super Auto Pets) and makes it a 3-player couch game. Everyone drafts a tiny secret squad from one shared shop, then the TV auto-resolves the fights. It's for people who love comp-building and reveal moments but have no way to share that at a party.

## Problem
Autobattlers are matchmade solo grinds. The genuinely social joy — building a hidden comp, then the schadenfreude reveal of whose squad was cooked — never gets to happen in a living room. And it can't be faked by passing one phone: the whole point is that lineups are simultaneous and secret.

## How it works
3 players. The host TV shows a **market river** of 6 unit tiles (public), a 45s draft timer, and per-player lock lights — nothing else. Units are a rock-paper-scissors triangle (Pike > Cavalry > Archer > Pike) each with a power stat.

Each phone PRIVATELY shows: your gold (10), the buyable market, your 3-slot lineup with front/back positioning, and one **scout token** (peek at one opponent's front unit, once). You buy from the shared river, so contention is real — if two players grab the last Cavalry, first-lock wins and the loser is refunded. You arrange front/back secretly.

On lock, the TV auto-resolves deterministic round-robin battles (RPS + power + position) and crowns the most-wins squad. The private lineup is the entire game.

## Technical approach
PartyKit / Cloudflare Durable Object room. Data model: `room {players, marketRiver:[unitId], phase, timerEndsAt}`; per-player `{gold, lineup:[{unitId,slot}], locked, scoutUsed}`. Sync: `BUY(unitId)` is authoritative — the single-threaded DO validates gold + availability, atomically claims the unit, and broadcasts a market delta to everyone (contention is visible) while keeping each lineup private to its owner. Combat is a pure function `resolve(lineupA, lineupB, seed) -> log`, so the TV animates a replay that provably matches the server. Hard part: atomic per-unit claim under simultaneous buys (trivial in the DO's serial loop, easy to get wrong elsewhere) and a fully deterministic, seeded combat sim.

## v1 scope
- 3 players, exactly one draft phase (45s), one round-robin auto-resolve
- 6 unit types: RPS triangle + a single power stat
- 3-slot front/back lineups, 10 gold
- One scout peek per player
- Most head-to-head wins takes it

## Out of scope
- Multiple rounds, gold interest/carryover, items, abilities
- More than 3 players, reconnection, spectators

## Risks & unknowns
- Combat must read clearly in ~15s on TV
- Balancing 6 units so no dominant pick
- Frequent refunds from contention could feel punishing
- Is 3 units of depth enough to be interesting for adults

## Done means
3 phones join; each privately drafts from a shared, contested market within 45s without seeing others' lineups; the TV deterministically resolves all three head-to-heads and declares a winner; two players racing for the same last unit always resolve to exactly one owner with the other refunded.
