## Overview
Sweep is a 3-5 player cooperative party game (shared host screen + phone controllers) built on a supermarket-dash fantasy. One player is the **Storekeeper**, whose phone is the store map. Everyone else is a **Shopper** who can't see the map but privately holds their own shopping list. For groups who like warm, loud, overlapping-voices co-op where one overloaded person tries to serve everyone at once.

## Problem
The theme's failure mode is a map-holder who just reads coordinates aloud — flat and solvable. Sweep's itch is *divergent private demand*: the map-holder doesn't know what anyone needs, and every blind shopper needs something different, so the round is a frantic verbal triage — 'okay milk person, hold; egg person, go left' — that no single passed-around phone could ever hold.

## How it works
Host TV shows only a store clock counting down to close and a filled/total items tally — never the map, never the lists.

**Storekeeper's phone (private):** a top-down store grid — labeled aisles, item icons in their cells, and every Shopper's live dot. The Storekeeper sees *where things are* and *where people are*, but **not what anyone is shopping for**.

**Each Shopper's phone (private):** a move-pad plus their own secret list of 3 items (e.g. 'bread, tuna, batteries') and a 'grab' button that only works when standing on the right cell. No map. Shoppers move **simultaneously**. Midway, one random Shopper gets a private **impulse-buy** popup (a 4th item) only they see — forcing a re-route and fresh negotiation. Win = every Shopper's full list grabbed before close. The Storekeeper must ask what each person needs and thread three blind bodies through narrow aisles (two Shoppers can't occupy the same cell — congestion is real).

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object per room; Socket.IO over Tailscale Serve fallback). Data model: `Room { grid, items: {cell, sku}[], players: {id, role, pos}, lists: {shopperId: sku[]}, filled }`. Lists live server-side and are pushed only to their owner — the Storekeeper's socket never receives them. Movement is server-authoritative intents at ~8Hz; 'grab' validates position+sku on the server and marks the item filled, broadcasting a tally delta. The genuinely hard part is **consistent real-time positions plus private-channel fan-out**: the same room state must render three different privileged views (full map / own-list-only x N) with no leakage, so the server filters per-socket rather than broadcasting one blob. Small 10x10 grid keeps packets tiny; interpolate dots on the Storekeeper phone.

## v1 scope
- 1 Storekeeper + 2 Shoppers, one 10x10 store, one round.
- 3 items per list, one impulse-buy event, fixed 3-minute clock.
- Room-code join only; refresh rejoins seat; one win/lose screen.

## Out of scope
- Multiple rounds, competitive scoring between shoppers, leaderboards.
- Moving obstacles, cart capacity, checkout minigame.
- Custom stores, item art beyond simple icons.

## Risks & unknowns
- With 2 shoppers the Storekeeper may not be overloaded enough — tune list length / aisle congestion / clock.
- Aisle-collision rules could frustrate more than delight; may soften to soft-block.
- Keeping voices from becoming pure chaos — impulse-buy timing must land as a spike, not constant noise.

## Done means
Three phones join by code; two Shoppers each fill a private 3-item list they can see and the Storekeeper cannot, guided only by voice over a map only the Storekeeper sees, including one mid-round private impulse-buy re-route; round ends in a clear win (all lists filled) or loss (clock out) with per-socket views showing no list leakage and no console errors.
