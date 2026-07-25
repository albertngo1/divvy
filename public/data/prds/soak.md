## Overview

A 90-second cooperative raid-mechanic simulator for 3-4 people in one room. The TV is the boss encounter; the room's physical corners are the arena zones; each phone is one raider's private debuff. It steals exactly one thing from WoW/FFXIV raiding — the *mechanic resolution* moment, where a cast bar fills and everyone frantically yells "I'm CHAIN, who's got EMBER?!" — and throws away combat, gear, classes, and DPS entirely.

## Problem

Raid mechanics are the best thing in MMOs and the worst thing to get into: forty hours of gearing before you feel the eight seconds that actually matter. Meanwhile party games rarely produce genuine *urgent coordination* — most are take-turns-and-be-clever. Soak delivers the raid callout with zero onboarding.

## How it works

The host screen names three zones (NORTH / EAST / WEST) mapped to three corners of the actual room, and starts a boss cast: **VORLOK CASTS MECHANIC — 20s**.

Each phone privately shows one debuff card, e.g.:
- **EMBER** — "Resolve: be alone in your zone."
- **CHAIN** — "Resolve: share your zone with exactly one other raider."
- **MARK** — "Resolve: be in a different zone from every EMBER."
- **SOAK** — "Resolve: stand in the highlighted zone."

Predicates reference other players' debuff *names*, which are never public. The game therefore manufactures callouts: you have to say your card out loud, and trust what you hear.

Positions are public — people are physically standing in corners, and each phone taps which zone it's in. Privacy lives entirely in the rules. Each phone also shows a live personal light: **GREEN when your own predicate is currently satisfied, RED when it isn't**, so the room becomes four people shuffling between corners watching three lights go green and one stay stubbornly red.

When the bar fills, the server freezes state, evaluates every predicate, and the TV plays KILL or WIPE — then flips every debuff card face-up so the room can relitigate who lied about being CHAIN.

Shared screen: cast bar, zone labels, highlighted zone, count of unresolved debuffs (number only, no names). Phones: your card, your zone taps, your green/red light.

## Technical approach

PartyKit / Cloudflare Durable Object as authoritative room. Model: `Room {phase, castEndsAt, highlightZone}`, `Player {id, name, debuffId, zone}`, `DebuffSpec {label, predicateKey, params}`. Predicates are server-side pure functions over the full occupancy map; each socket receives a filtered view containing only its own `{card, satisfied}` plus public occupancy counts, pushed at ~10Hz on state change. Cast timing is server-owned (`castEndsAt` as server epoch, clients render against a measured offset) so nobody's laggy phone changes the deadline.

Hard parts: (1) the *dealer* must guarantee at least one valid arrangement exists while ruling out arrangements findable by silent trial-and-error — a solver enumerating all zone assignments, keeping only deals with exactly 1-2 solutions out of 27+; (2) the last-second zone tap landing on the right side of the freeze.

## v1 scope

- 3 players, 3 zones, one 20-second cast, one round, then a restart button
- 4 debuff types total, dealt from a solver-verified set
- Zone selection = three big phone buttons, no sensors
- TV: cast bar, zone labels, unresolved count, KILL/WIPE + card reveal
- No lobby polish, no accounts, no art beyond type and a red bar

## Out of scope

Multiple cast phases, healing/damage numbers, boss HP, enrage timers, roles, tank swaps, compass/position sensors, 5+ players, scoring across rounds, spectators.

## Risks & unknowns

Jargon predicates may read as homework — wording must be scannable in two seconds. Small combinatorics could make brute-force shuffling beat talking; mitigations are more zones or hiding the green light until cast end. Everyone talking at once may be noise rather than fun.

## Done means

Three phones plus a TV: the room is dealt a solver-verified set, players call out cards, physically reposition, all three lights turn green before the bar fills, and the TV shows KILL with all cards revealed. A control playtest where talking is banned fails the same deal more often than not.
