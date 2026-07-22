## Overview
Tavern steals the auto-battler (TFT / Hearthstone Battlegrounds) loop for 4 players. A single shared shop of units scrolls on the TV; everyone races to claim them, builds a PRIVATE board on their phone, and then the boards auto-resolve in a public bracket. For friends who love drafting and the thrill of a hidden comp getting exposed.

## Problem
Auto-battlers are addictive because of hidden information — your opponents can't see your synergy until combat, and there's a frantic economy of grabbing the right unit before someone else does. That's impossible to feel with one passed phone, and no party game has captured the "claim it before they do + hide your build" tension.

## How it works
One round has two phases.

CLAIM (20s): the TV shows a shared shop — a row of 8 units, each with a type icon (Beast/Mage/Guard) and power. All four phones show the same shop, and players tap to CLAIM. First tap wins (server-arbitrated); the unit vanishes from the TV for everyone and lands on the claimer's private bench. You can hold up to 4 units. The race is real — you must watch the TV shop and stab your phone.

BUILD (10s): PRIVATE on each phone — arrange your ≤4 claimed units into a front/back line. Matching types grant a hidden synergy bonus (3 Beasts = +attack). Nobody sees your board.

COMBAT: the TV pairs players (1v1v1v1 round-robin, best record wins) and auto-plays each fight as a simple deterministic sim — units trade blows until one side falls. THIS is the reveal: everyone finally sees the comps they blindly drafted against.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `shop[{id,type,power,claimedBy}]` (shared), `benches{playerId:[unitId]}` (private), `boards{playerId:[{unitId,slot}]}` (private until combat), `results`. Sync: shop broadcast to all; claims are single-writer, first-write-wins on the server with the loser getting an instant "taken" bounce. Benches/boards stream only to their owner. Combat is computed server-side (deterministic seed) and replayed as an animation script pushed to the TV. The genuinely hard part: FAIR simultaneous-claim arbitration under variable phone latency — two players tapping within 50ms must resolve consistently, so claims carry client timestamps but the server orders by receipt with a short debounce and never double-awards.

## v1 scope
- 4 players, ONE shop of 8 units, ONE claim phase, ONE build phase, ONE combat bracket.
- 3 unit types, one synergy rule, deterministic combat sim.
- Win = best combat record.

## Out of scope
- Gold economy, rerolls, unit tiers/upgrades, items, multiple rounds, leveling.

## Risks & unknowns
- Claim fairness feeling unjust under lag; needs a visible "claimed by X" flash.
- Whether one combat round delivers enough reveal payoff.
- Combat sim balance so a claimed board isn't obviously dominant.

## Done means
4 phones race the same TV shop, each ends with a board the others never saw, and the combat animation on the TV surprises the table by exposing who quietly drafted three Beasts.
