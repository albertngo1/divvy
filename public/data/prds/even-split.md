## Overview
Even Split is a 3–5 player fair-division party game — the "I cut, you choose" mechanic that gives the app Divvy its name. A pile of items must be split among the room; one player (the Divider) partitions them, everyone else claims a share, and private valuations turn a tedious haggle into a squirming social reveal. For groups that like negotiation games but hate the twenty-minute argument over who values what.

## Problem
Dividing loot at a table is the slowest, most argument-prone mechanic in tabletop gaming, because the whole thing hinges on information you refuse to say out loud: *how much do I actually want the clock vs. the cash?* Spoken valuations are lies; silent ones are un-adjudicable by hand. Private per-phone state is the only clean way to run true fair division at a party.

## How it works
The TV shows 6 quirky items ("the good parking spot," "grandma's clock," "a jar of buttons"). Each PHONE privately receives a different secret valuation sheet — 100 points spread across the 6 items, unique per player, seen only by that player. Phase 1: the rotating Divider, on their phone, drags the 6 items into N bundles (one per player), trying to make them equal *by their own secret prices* — which are nothing like anyone else's. Phase 2: every non-Divider privately taps their single favorite bundle. Resolution: unclaimed-collision bundles go to whoever valued them highest (server-computed from hidden sheets); the Divider takes the leftover. The shared screen shows only the item pile and the bundle outlines during play — never anyone's numbers. The finale is the payoff: the TV reveals each player's secret valuation of what they got, computes an "envy score" (how much more they'd have valued someone else's bundle), and crowns the most-robbed player.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{items[], divider, valuations{playerId:{itemId:int}}, bundles[{itemIds[]}], claims{playerId:bundleIdx}}`. Sync is turn-gated, not real-time, so it's forgiving: the server broadcasts phase transitions and the Divider's committed bundle layout; claims are submitted simultaneously and revealed only after all are in. The genuinely hard part isn't sync — it's the resolution rule feeling *fair and legible*: v1 uses "highest hidden valuation wins a contested bundle, Divider gets the remainder," which is simple and defensible, with envy-scoring purely for laughs, not for balancing.

## v1 scope
- 3 players, 6 items, one round, one Divider
- Seeded fixed items + fixed distinct valuation sheets (no generation)
- Divider partitions into 3 bundles; others claim; collision-by-valuation resolution
- Reveal screen with per-player value + envy score + "Most Robbed"

## Out of scope
- Multi-round rotation of the Divider role
- Envy-free optimal algorithms (adjusted winner, etc.)
- Generated items/valuations, accounts, rematch

## Risks & unknowns
- Fair division can feel abstract/dry; the reveal must land as comedy, not spreadsheet.
- Divider agency must feel meaningful even blind to others' values — needs playtest tuning of item count vs. bundle count.

## Done means
Three phones join, each sees a distinct private valuation sheet, the Divider drags 6 items into 3 bundles on their phone, the other two privately claim bundles, the server resolves ownership and the TV reveals each player's hidden valuation of their share plus an envy score naming the most-robbed player.
