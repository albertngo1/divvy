## Overview
Overrun steals the *creep-sending* half of tower defense — the part where you pick which monsters to throw at a maze — and turns it into a 3-5 player hidden-information duel. The shared TV is a fixed 3-lane tower map. Every player is an attacker trying to leak the most monsters through to the exit.

## Problem
Tower-defense games are single-player and the towers do the interesting work. The genuinely social decision — 'which creep type, down which lane, right now?' — is buried in co-op modes. Party games rarely give you a rock-paper-scissors economy with simultaneous blind commits and a live board to react to.

## How it works
The **host TV** shows one map: three lanes, each pre-seeded with fixed towers of a visible element (fire towers melt swarms, frost towers slow armor, arrow towers shred flyers). Over one round there are three waves.

Each **phone privately** holds a hand of 5 creep cards (Swarm / Armored / Flyer / Runner / Brute), a private coin balance, and a secret one-time 'Contract' card naming a lane that scores double for that player only. Each wave, every player simultaneously and blindly drags 1-2 creeps onto a chosen lane and locks in. When the timer fires, the TV resolves all committed creeps at once: towers fire in element order, survivors race to the exit, and each leaked creep scores for whoever sent it. Because sends are simultaneous and hands/contracts are secret, you can't just counter the obvious play — you're betting on where the crowd *won't* pile.

The per-phone privacy is load-bearing: if hands, coin, and contract lanes were public (one phone passed around), the game collapses into solved rock-paper-scissors. Hidden divergent incentives are the whole tension.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room{mapSeed, waveIndex, towers[]}`, `Player{hand[], coins, contractLane, committedThisWave[]}`, `Wave{commits: Map<playerId, {creep,lane}[]>}`. Phones send `commit` events; server validates coin cost and hand ownership, holds commits hidden until all-locked-or-timeout, then runs a **deterministic resolver** (fixed tick loop: tower targeting, damage, movement) server-side and streams a compact event log to the TV to animate. Phones only ever receive their own private state plus public wave results. Hard part: the deterministic combat resolver must be authoritative and reproducible so the TV animation and the scoring never disagree — all randomness seeded server-side.

## v1 scope
- 3 players, one round of exactly 3 waves
- 3 lanes, fixed tower layout (no upgrades)
- 5-card hand, 3 creep types only (Swarm/Armored/Flyer)
- One secret Contract lane per player
- TV shows leak counter + winner

## Out of scope
- Tower upgrades, buying/placing towers, coin economy depth
- More than 3 waves, more than 3 creep types
- Persistent progression, rematches, animations beyond dots-on-lanes

## Risks & unknowns
- Resolver legibility: players must *understand why* their creeps died in a 4-second animation, or the strategy feels random
- Balance of the type-vs-tower triangle with only 3 types
- Simultaneous-commit timeout griefing (AFK player stalls the wave)

## Done means
3 phones join a room, each sees a private hand + secret contract, all commit one blind wave, the TV resolves it deterministically and awards leaks correctly to the right players — and a player who screenshots another's phone gains an unfair, provable advantage (proving privacy is load-bearing).
