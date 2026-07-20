## Overview
A per-phone steal of the auto-battler (TFT / Auto Chess) genre for 3–4 players. Your phone is your private bench and battlefield; the shared TV is the arena where everyone's hidden squads finally fight. It's for a group that wants the secret-teching thrill of auto-chess compressed into a single tense minute.

## Problem
Auto-battlers are wonderful but solitaire-parallel and 30 minutes long. Their actual joy — quietly assembling a busted comp while starving your neighbor of the units they need, then watching boards collide — is *inherently hidden-information*. That makes it a natural fit for private phones and a terrible fit for one passed-around screen: the moment a comp is visible, the whole game dies.

## How it works
The server holds one **shared, limited unit pool** (scarcity is global). Each phone privately shows a **shop of 5 units** rolled from what remains. You spend gold to buy — and buying *removes that unit from the pool for everyone*, so if you grab the last Knight, nobody else can. You drag purchases onto a private **3×2 grid** (front row tanks, back row hits), and three copies of a unit auto-merge into an upgraded one. A 90-second timer runs; everyone shops **simultaneously and blind** to each other's board.

On reveal, the TV pairs players and runs a **deterministic auto-combat**, animating both boards side by side. Positioning and a simple counter-triangle decide it; most survivors wins the round.

Private to each phone: your shop offers and your board layout, hidden until combat. Shared on TV: only the final fights. One phone passed around would leak every comp and destroy the simultaneous scarcity race — the hidden, contested draft *is* the game.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `GameState { pool: {unitId: count}, players: {id, gold, bench[], board[6], hp} }`. Shop rolls happen server-side from the live pool. A purchase is an **atomic server transaction** that decrements the pool — this is the genuinely hard part: when two players grab the last unit within the same tick, the server arbitrates by receipt timestamp and pushes a "sold out" update to the loser. Combat is simulated server-side from a seed and streamed to the TV as a tick log it animates; phones just show "fighting…", so no client ever holds another's board.

## v1 scope
- 3 players, **one** 90-second shop phase, **one** combat round
- 8 unit types, 3×2 grid, one counter-triangle (melee > ranged > mage > melee)
- Combat = attack nearest, hp/atk stats, deterministic

## Out of scope
- Multi-round gold economy, interest, streaks
- Items / augments, more than one triangle, bench management polish, drag-and-drop juice

## Risks & unknowns
- Is the TV combat *legible* enough to feel earned?
- Is 90s enough to draft a satisfying board?
- Drag UX on small screens; balance of 8 units; does a single round land the genre's hook?

## Done means
Three phones privately draft from contested shops, a contested last unit resolves to exactly one buyer, the TV animates two board fights and declares a winner, and no client ever saw another player's board before combat.
