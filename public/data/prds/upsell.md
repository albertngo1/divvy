## Overview

A betting layer that runs on top of a real meal. A laptop or TV shows the restaurant/takeout menu; every diner's phone is a private betting slip. For 3–4 people who are already going to order dinner and would like that dinner to be an adversarial market.

## Problem

Ordering from a menu is the most passively consumed group ritual there is: everyone reads the same laminated card in silence, mumbles a choice, and the bill arrives as a fact of nature. Meanwhile the one number everybody privately cares about — the total — is the one nobody is allowed to talk about. Upsell makes the total the ball.

## How it works

The host screen shows a fixed 12-item menu with prices and, in huge type, a single threshold **T** (server-computed from the menu's median basket, e.g. **$48.00**).

Each phone privately receives two cards nobody else ever sees:
- **Line:** OVER or UNDER T. Dealt in opposing halves (4 players → 2/2; 3 players → 2/1, with the lone side paid double).
- **Appetite:** a mandatory constraint on your own order, e.g. *"at least one fried thing"* or *"you must order a drink."* Server-enforced at lock.

Ninety seconds. Every phone privately builds its own order (1–3 items, at least one entrée). This is your real dinner — you will be handed this food. So sabotage has a price: the OVER player who pads the bill with a $16 guac is eating $16 of guac.

The host screen during ordering shows only **how many players have locked** and a deliberately coarse thermometer of the locked subtotal — *"somewhere in the $40s"* — never a figure. Each phone holds one single-use **Peek** that privately reveals the exact committed subtotal so far; spending it costs 1 point and tells you nothing about who ordered what.

On the last lock the TV reveals the itemized bill, the total, T, and every player's Line. Winners score; the room learns exactly who was pushing which way, which is the actual payoff of the evening.

## Technical approach

PartyKit Durable Object per room, authoritative for menu JSON, deals, carts, and the clock. Data model: `Room {menuId, T, phase, lockedCount, lockedSubtotal, players: {id, name, line, appetiteId, cart[], locked, peekUsed}}`.

Sync is coarse-by-design: the only broadcast state is `lockedCount` and a **band** derived from `lockedSubtotal` (floor to nearest $10, rendered as a decade phrase). Carts in progress are never included in any broadcast — an in-progress cart is a live leak, and the whole game dies if the band twitches when someone taps guacamole.

The hard part is honest coarse state: the band must be truthful (never a lie the reveal contradicts) yet non-invertible. With 3 locked orders a $10 band plus known menu prices can be brute-forced, so the server also withholds the band until ≥2 players have locked, and Peek is the sanctioned escape hatch rather than an information exploit.

## v1 scope

- One hardcoded 12-item taqueria menu, one round, one threshold.
- 3–4 players, no accounts, room code only.
- Two private cards per phone; server validates the Appetite constraint at lock.
- One coarse public band, one Peek per phone.
- Reveal screen: itemized bill, total vs T, each player's Line.

## Out of scope

Multiple rounds, menu import/OCR, real payment or bill splitting, tipping, dietary filters, spectators, persistent scores.

## Risks & unknowns

Someone orders food they hate to win — capped by Appetite plus the fact that they eat it, but needs playtesting. T may land far from the natural basket, making one side trivially dominant; v1 should recompute T from the actual menu, not a constant. Group may just say their lines out loud.

## Done means

Four phones join by code, each shows a different Line/Appetite pair, all four build orders simultaneously without any cart data reaching another client, the TV band never contradicts the final bill, and the reveal correctly names winners — verified by reading the WebSocket frames and confirming no per-player cart or line appears before reveal.
