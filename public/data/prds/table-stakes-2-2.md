## Overview
Table Stakes turns the dead moment when a group stares at a menu into a hidden betting game. For 3-5 friends deciding what to eat — at a restaurant table or on the couch with a delivery app open.

## Problem
Group ordering is limbo: everyone reads the same menu, hems and haws, and eventually clumps onto the one safe dish. The itch is to reward the person who can READ the table — who calls that Sam will cave on the salad and everyone else will pile onto the pad thai — and to let a good bluffer poison everyone else's read.

## How it works
The host TV shows a menu (a canned 8-item menu in v1) with house "odds": the obvious favorite is short-priced, the oddballs pay long. Each phone runs two SIMULTANEOUS private phases:
1. Secret order — you lock in the dish you'll "order," hidden from everyone.
2. Secret bets — you place chips on (a) which single dish gets the most orders across the table, and (b) a per-player call ("Sam orders the burger"). All hidden.
Because your own order is secret while you bet, you can bluff out loud — announce "I'm 100% getting the curry" and quietly lock the burger, wrecking everyone's per-player calls. On reveal, the TV flips every order at once, tallies the table favorite, and settles bets against the posted odds: nailing the contrarian favorite or a hard per-player call pays big. Most chips wins.

Private per phone: your locked order, your chips and bets. Shared TV: the menu, the odds, and the synchronized reveal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Room state: menu[] {dish, odds}, players[] {id, order, bets:{favorite, perPlayer:{}}}, phase. Both the order and the bets are private commands the server stores but NEVER echoes to others until a single atomic REVEAL transition. Sync is simple lockstep: the server gates until all players are locked, then broadcasts the full reveal in one shot. The hard part isn't latency (turns last seconds) — it's simultaneity integrity: guaranteeing no player can observe another's order or bet before reveal (server-side hidden state, zero leaky broadcasts) and computing parimutuel-style payouts deterministically so the TV and every phone agree on the result.

## v1 scope
- 3 players, one round
- One canned 8-item menu with fixed odds
- One "table favorite" bet + one per-player call each
- Fixed chip budget, integer payouts
- Simultaneous reveal + winner

## Out of scope
- Real menus or delivery-app import
- Multiple rounds, running bankroll
- Live-set / dynamic odds, house-edge tuning
- Extra bet types (spreads, parlays)

## Risks & unknowns
- With only 3 players, is "most-ordered dish" too swingy to bet on? May need a 4-player floor.
- Do people role-play an order or commit to their real craving? The rules must pick one and be explicit.
- Balancing odds so contrarian bets are worth chasing without being pure coin-flips.

## Done means
3 phones, everyone secretly locks an order and places both bets with no one able to see another's, the TV reveals all orders at once, settles payouts correctly against the posted odds, and declares a winner — with at least one successful bluff visible in the reveal.
