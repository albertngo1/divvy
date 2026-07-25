## Overview

Cursed Item is a 3-4 player co-op roguelike for one shared TV and private phones, built on a single idea: the curse doesn't nerf your character, it nerfs your *interface*. Equip the Blindfold of Alacrity and you move first every turn — but your phone stops rendering enemy positions. Equip the Liar's Compass and you deal double damage — but your phone shows the map mirrored. Every player is looking at a differently-broken version of the same dungeon and has to talk their way to a shared truth.

## Problem

Roguelike loot decisions — "is this cursed item worth it?" — are the genre's best moments and are utterly solitary. Meanwhile, co-op party games fake asymmetry by handing people different *facts*. Nobody makes the asymmetry a consequence of a choice the player made two minutes ago, out loud, for a benefit the whole room saw. The curse being *self-inflicted and public while its effect is private* is the whole design.

## How it works

**Loot phase.** TV shows three items with public power text and a public curse *name* — but not what the curse does. Each player privately picks one on their phone (a player may take an item nobody else took; ties resolve by a coin flip on the TV). Everyone sees who took what.

**Dungeon phase.** One shared 5x5 dungeon, three turns. The TV is deliberately near-useless: it shows only fog, the party token, and an exit marker. The real map lives on phones.

Each phone privately shows *its own corrupted view* of the same grid:
- Uncursed baseline: walls, the two monsters, and the key.
- Blindfold: walls and key only, no monsters.
- Liar's Compass: everything, mirrored left-right.
- Fogged Lantern: only the 3x3 around the party.

Each turn, every phone privately commits a direction. The server applies the *majority* direction. The comedy engine: the mirrored player is confidently, loudly wrong about "left," and nobody knows the compass mirrors — they only know the item was called Liar's Compass. Deducing your own curse from disagreement is the game.

The party needs the key, then the exit, inside three turns.

## Technical approach

PartyKit Durable Object. State: `{grid: Cell[25], party: {pos, hasKey}, players: {id, item: ItemId, commit: Dir|null}, turn}`. The authoritative grid is server-only; each phone receives a **view-transformed projection** computed server-side per connection — `project(grid, item)` — so a curious player who opens devtools still can't see the truth. This is the key architectural commitment: never broadcast the real grid.

Sync: turn-based with a simultaneous-commit barrier. Server holds a 20s turn window, resolves on all-committed or timeout (non-committers abstain). No sub-second timing anywhere.

Hard part: not sync — it's per-connection filtered state. Each socket needs its own serialization of shared state, which breaks the usual "broadcast one room snapshot" PartyKit pattern. Every state mutation must fan out N distinct payloads. Plus the mirror curse means coordinates are transformed, so commits come back in the *player's* frame and must be un-transformed before applying.

## v1 scope

- 3 players, 5x5 grid, three turns, one key, one exit
- Exactly 3 items with 3 curses (Blindfold / Liar's Compass / Fogged Lantern)
- Majority-vote movement, no combat — monsters just end the run on contact
- One loot phase, no re-rolls, no inventory
- TV shows fog + party token + turn counter + a win/lose card

## Out of scope

Multiple floors, combat, item swapping mid-run, curse identification as a scored mechanic, more than 3 items, persistent meta-progression.

## Risks & unknowns

The mirror curse may be genuinely un-fun rather than funny if the mirrored player never figures it out. Majority-vote movement with 3 players means the two uncursed players can steamroll — may need 4 players or weighted votes so the cursed player's power *matters*. Three turns may be too short to produce the deduction; the tuning knob is grid size vs. turn count.

## Done means

Three phones join, each takes a different item, and each phone renders a visibly different map of the same server-side grid — verified by confirming the real grid never leaves the server in any socket payload. The party completes at least one run, and in playtest at least one player says out loud "wait, what do you see?"
