## Overview
A cooperative turn-based tactics game — the XCOM genre — squeezed onto four phones. Each player commands exactly one soldier and sees ONLY their own soldier's vision. The fog of war isn't a screen effect; it's literally distributed across four devices, and the fantasy is a squad calling out contacts and coordinating a flank.

## Problem
Tactics games are solo, slow, single-screen affairs. The social dream of a fireteam radioing 'contact, two east, behind cover' and syncing a pincer has no party-game home. The itch: a shared-map tactics game where fog is REAL because no one holds the whole board — it's split across the players' phones, forcing talk.

## How it works
The TV shows the shared floor plan, but an enemy renders on it ONLY while at least one soldier currently has line-of-sight; walls and explored tiles persist. Each phone PRIVATELY shows: your soldier's position, your 2 action points, your vision cone, any enemy YOU personally see (with range and cover), and a private 'you are flanked' warning. Each turn all four plan simultaneously — move (spend AP), shoot, or set Overwatch (a reaction shot into your cone). The server resolves moves, then reaction shots, then the enemy turn. Because no single view contains the whole board, you coordinate by voice: 'alien behind the crates two tiles east of me — someone push north and I'll overwatch.' One round = clear 3 aliens from a small room in ~3 turns; a soldier downed or an alien reaching a soldier = loss.

Private (phone): your position, AP, cone, visible enemies, flank warning. Shared (TV): explored map, all four soldiers, and only currently-seen enemies — never another player's private threat view.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: Game{grid, enemies[], turn, phase}, Soldier{pos, ap, facing, seenEnemyIds}. The server owns truth: it computes per-soldier visibility via grid raycast and sends each phone ONLY its own soldier state plus that soldier's visible enemies; it sends the TV the union of currently-seen enemies. Sync strategy: a simultaneous planning phase gated by a 'ready' barrier (or timer), then deterministic server resolution broadcast as an animation script both TV and phones replay. The genuinely hard part is correct, cheap per-soldier line-of-sight/fog computed server-side and fanned out privately without leaking a single tile of another player's view — plus a clean simultaneous-plan → sequential-resolve pipeline with conflict rules for two soldiers targeting the same tile.

## v1 scope
- Exactly 4 soldiers, one room code
- One handcrafted ~10×10 room
- 3 aliens with simple aggro AI
- 2 AP; actions = move / shoot / overwatch
- ~3 turns, win/lose screen

## Out of scope
Cover destruction, soldier classes/abilities, multiple or procedural maps, reinforcements, reconnection, >4 players, deep hit-chance modeling.

## Risks & unknowns
Is verbal fog-coordination fun or frustrating in one room where players can peek at each other's screens? Simultaneous planning can produce conflicting moves — needs clear resolution rules. Any fog-leak bug kills the whole tension. AI must be simple yet threatening. Turn pacing risks feeling slow.

## Done means
Four phones join via code; each sees only its own soldier plus personally-visible aliens; the TV shows an alien only while someone holds line-of-sight; in a playtest a coordinated flank downs all 3 aliens within the turn limit; no phone ever receives another soldier's private view.
