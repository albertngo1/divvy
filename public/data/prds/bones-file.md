## Overview
A simultaneous, phone-per-player roguelike for 3–5 people in one room, built around NetHack's oldest social mechanic: the *bones file*. When you die, your level gets saved, and another player can find it later. Here 'later' means about 40 seconds from now, and the other player is sitting on the couch next to you.

## Problem
Roguelikes are solitary, and their best feeling is hard-won private knowledge: *the murky potion is poison*. Party versions usually turn into hot-seat spectating. The interesting thing to steal is the knowledge economy, not the dungeon.

## How it works
- **Shared secret table:** at game start the server randomizes a potion color→effect map (6 colors: heal, poison, blind, teleport-down, strength, nothing). It is the same for everyone, and nobody is told it.
- **Phone (private):** your own grid dungeon, 5 floors of one small room each, tap-to-move, bump-to-fight. You find unidentified potions shown only by color. Quaffing one identifies it *for you only*. You can attach a free-text **label** to any potion color ('DON'T — poison'). Labels may be lies.
- **Death:** your floor freezes with your ghost (a tougher monster), your inventory scattered as loot, and **your labels attached to those potions**. The server splices that floor into a random living player's next floor.
- **Host TV:** a depth ladder showing each player's floor and HP bar, plus death announcements ('Mia's bones landed in Sam's run'). Potion knowledge never appears on the TV.
- **Table talk is legal.** You can shout 'green is healing!' The labels make lying cheap and deniable.
- **Scoring:** deepest floor reached, with ties broken by turns. Dead players also score +1 for every player who later dies on a floor containing their bones, which is the reason to lie.

One round runs 4 minutes or until everyone is dead.

## Technical approach
An authoritative PartyKit room (one Durable Object). The data model has `potionMap` (server-only), a per-player `run {floor, x, y, hp, inventory[], knownColors{}}`, `bones[] {fromPlayer, floorGrid, ghostStats, items[{color,label}]}`, and `labels[player][color]`. Movement is turn-based per phone, so there's no real-time physics. Clients send `move`/`quaff`/`label` intents, and the server resolves them and returns the private state diff. The hard part is **fairness of bones assignment**: splice into whoever is at the shallowest pending floor, never into the killer's own victim chain twice, and avoid giving one player all the bones. Floor generation is seeded, and a bones floor replaces the generated room with the stored one.

## v1 scope
- 3–4 players, one 4-minute round
- 5 floors, single 7×7 room each, 2 monster types
- 4 potion colors, 4 effects
- Labels limited to 3 presets: 'good', 'bad', '???'
- Host: depth ladder and death ticker only

## Out of scope (for now)
- Weapons, armor, scrolls, shops
- Free-text labels, meta-progression
- Spectator mode for the dead (they just watch the TV)

## Risks & unknowns
- Early deaths leave people idle. Mitigation: dead players can pick which living run their bones go to.
- If nobody dies early, bones never matter. Tune floor 2 to be lethal.
- Lying may be pointless if people just ignore labels. Watch for this in playtest.

## Done means
Four phones each play a private run. At least one death in a test session produces a bones floor in another player's run with the dead player's labels visible on the potions. The host ladder ends the round with a ranked depth list including bones-kill bonuses.
