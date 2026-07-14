## Overview
A real-time competitive party game for 3-6 players that steals survival-horror inventory management — the attaché case from Resident Evil 4, the grid packing of Backpack Hero — and turns the private, fiddly, secretly-beloved chore of packing into a shared scramble.

## Problem
Everyone who has played a looter knows the dirty secret: rotating a shotgun to save two grid cells is more satisfying than the shooting. But it's a solitary act. Parties want the frantic grab, the 'that was MINE' — Loadout keeps the packing puzzle but wraps it in a contested land-grab.

## How it works
The shared TV shows a communal loot spread: a dozen oddly-shaped items, each with a shape (2x1 pistol, L-shaped ammo belt, 1x1 herb) and a point value, plus a countdown to the crate closing. Each phone PRIVATELY shows only that player's own 5x5 backpack grid and the single item currently in their hand.

The pile mirrors on every phone as a row of tappable chips. Tap to grab (server-authoritative, first-come). If two players tap the same item inside a collision window, exactly one wins and the other's tap bounces with a buzz. The grabbed item drops into your private tray; you drag and rotate it to fit your grid. Doesn't fit? Drop it — it returns to the pile, costing you precious seconds. When the crate closes (60s) or the pile empties, score = total value packed. Highest wins. Because your grid state and your held item are secret, nobody can plan your packing for you, and a single passed-around phone couldn't run six simultaneous private inventories.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `pile[]{id, shape, value, taken}`, `player{grid: bitmask, holding, score}`. Sync: pile membership is server-owned; grabs are `claim(itemId)` events resolved first-valid-wins with a ~150ms debounce so latency doesn't hand it to the fastest connection unfairly. Private grid drag/rotate is fully client-side, only final packed value is reported. The genuinely hard part is fair contested grabs: reconcile near-simultaneous claims deterministically and echo the loser a fast rejection so the pile never desyncs across phones.

## v1 scope
- 3 players, one 60-second round
- 5x5 grid, ~12 items, 3 shape types, no rotation-blocking obstacles
- Grab + drag-to-pack + drop-back only
- Host shows countdown and final score bars

## Out of scope
- Multiple rounds / persistent meta
- Item abilities (weapons, consumables)
- Trading or stealing between packed grids
- Pre-seeded grid obstacles, animations

## Risks & unknowns
- Mobile drag-and-rotate can be fiddly; may need tap-to-rotate + snap.
- Time-pressured packing might read as stressful rather than fun.
- Grab-latency fairness across uneven phone connections.

## Done means
Three phones grab from one synchronized pile; a contested grab resolves to exactly one winner with the loser bounced and the pile consistent everywhere; each player packs privately; the TV shows correct final value bars and a winner.
