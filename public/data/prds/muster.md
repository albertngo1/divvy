## Overview
Muster steals the Teamfight-Tactics / Hearthstone-Battlegrounds autobattler loop — draft from a shared shop, build a hidden board, watch it auto-fight — and squeezes it into a 3-5 player phone party game. Each phone is your private bench; the TV is the arena. It's for people who love the buy-and-arrange dopamine of autobattlers but have never played one because they're 40-minute solo grinds.

## Problem
Autobattlers are the most social-feeling genre nobody plays socially: you're theoretically sharing a shop pool with seven strangers, but you never see their boards until you die to them. Muster makes that hidden-information contention the whole point and compresses the run to five minutes in a living room.

## How it works
The host TV shows one rotating **shop row of 5 unit cards** (a knight, an archer, a slime, etc.), each with a cost and a synergy tag. Crucially, **each card is a single physical copy**: the first phone to tap it claims it and it disappears from everyone's shop simultaneously. Players tap-grab in real time with a shared gold budget, so there's a genuine scramble for the one Assassin left.

Each PHONE shows PRIVATELY: your gold, your claimed units, and a 3x2 board where you drag units into formation. Your phone also shows your live synergy bonuses ("3 Beasts: +armor") — nobody else can see what you're building. The shared TV shows ONLY the shop, everyone's gold, and a face-down card count per player.

After a 90-second buy-and-arrange timer, the TV runs a **deterministic auto-battle**: each player's hidden board is revealed and fights every other board round-robin, animated on the big screen. Positioning and synergies you chose in private decide it. One winner per round.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object) holds the shop pool, each player's board, and gold. **Data model:** `shop: Card[]` with `claimedBy`, `players: {id, gold, board: (Card|null)[6], bench: Card[]}`. Tap-claims are server-arbitrated — first message to arrive wins the card, losers get an instant "snatched!" bounce. Board drags are optimistic locally, confirmed server-side. The genuinely hard part is the **auto-battle**: it must be a pure deterministic function of all boards + a seed, computed once on the server, then streamed as a keyframe list the TV replays — so the animation matches the outcome exactly and no client can desync or peek early. Phones never receive opponents' boards until reveal.

## v1 scope
- 3 players, ONE round (one shop phase + one auto-battle).
- 6 unit types, 2 synergy tags total.
- Fixed 90s buy timer, 5-card shop, one refresh.
- Deterministic battle resolved server-side, replayed on TV.

## Out of scope
- Multiple rounds / economy scaling / interest.
- Unit leveling, items, star-ups.
- Reconnect mid-battle, spectators.

## Risks & unknowns
- Tap-race fairness over variable phone latency — needs a visible "claiming…" state.
- Is one round enough drama, or does the fun require an economy arc?
- Auto-battle legibility on TV with 3 tiny boards at once.

## Done means
3 phones join, scramble for a shared 5-card shop where claimed cards vanish everywhere, each secretly arranges a board, and the TV plays one deterministic auto-battle that names a winner — with no phone ever having seen another's board before reveal.
