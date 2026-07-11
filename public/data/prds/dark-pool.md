## Overview
Dark Pool is a hidden prediction market layered over the most passive group ritual there is: scrolling a takeout menu and arguing about dinner. For 3–5 friends who are about to order food anyway. The menu stops being dead time and becomes a betting floor where the real dinner vote is the settlement event.

## Problem
"What do you want?" / "I don't know, what do YOU want?" Group food decisions are slow, boring, and dominated by whoever's loudest. Meanwhile everyone's already staring at a menu on a phone. There's latent tension in the room — who actually gets their way — and nothing captures it.

## How it works
The host TV shows a shared menu of 6–8 dishes. Each player starts with 100 chips. A 60-second market opens: on your phone you privately buy shares in whichever dishes you think the table will ACTUALLY order. Odds are parimutuel and shift live as chips flow in — but your phone shows only the current aggregate odds plus YOUR OWN holdings. You never see who bought what. When the bell rings, phones lock. Then the table talks openly and votes for real what to order — the genuine, honest dinner decision. The winning dish pays out; earlier and more-contrarian buyers earn the deepest returns (payout ∝ shares × entry-odds).

Private on each phone: chip balance, your position in each dish, buy buttons, live odds. Public on host: the menu, anonymized aggregate odds bars, countdown, and the final vote + payout ranking.

The engine is the secrecy: you're incentivized to quietly load up on the pad thai while loudly insisting you'd never order it, keeping its odds cheap — then swing the real vote to cash out. Hidden per-phone holdings ARE the bluff. Pass one phone around the room and the market is naked; there's no game.

## Technical approach
A room Durable Object (PartyKit / Cloudflare) holds market state: `{dishes[], odds[], players:{id:{chips, positions:{dish:shares}}}}`. Buys arrive as WebSocket messages; the server is authoritative, recomputes parimutuel odds, and broadcasts ONLY the aggregate odds to everyone while pushing private balance/positions to the buyer alone. Sync strategy: a 250ms server tick coalesces buys and emits an odds delta, plus a private frame per phone. The genuinely hard part is a fair real-time parimutuel that resists last-second sniping — smooth the odds curve, hide exact pool size, and add a 3-second randomized "closing" jitter so no one can perfectly time the bell.

## v1 scope
- One hardcoded 6-dish menu
- 3–4 players
- A single 60-second market
- One "what's for dinner" settlement vote
- Flat parimutuel payout, displayed ranking

## Out of scope
- Menu import/scraping, real delivery API, real money
- Multiple rounds, seasons, persistent bankroll
- Anti-collusion beyond hiding identities

## Risks & unknowns
Does the secret market actually bleed into the dinner vote, or sit beside it as trivia? The payout tension must drive real lobbying. Parimutuel odds may be illegible to non-finance players — needs a dead-simple UI. 60s may be too short or too long.

## Done means
Four phones join a room, each privately buys shares over 60s seeing only their own book plus shared odds, the table votes on real dinner, the host shows a correct payout ranking, and at least one player provably profited by fading the crowd.
