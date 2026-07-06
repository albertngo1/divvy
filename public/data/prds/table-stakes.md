## Overview
Table Stakes is a 3–5 player party game that turns reading a menu — the most universal passive-consume-in-a-group ritual — into a private prediction market on your friends' appetites. Shared TV shows the menu; each phone is a sealed order pad and betting slip.

## Problem
Handing a menu around a table is dead time: everyone quietly reads, mutters "ooh," and eventually someone orders. There's latent social knowledge in it — you *think* you know what your friends will pick — but nothing ever tests it. Betting does: it forces you to commit a private read on the room and rewards you for knowing your table better than they know themselves.

## How it works
**Shared host screen:** one generated themed menu — say ~9 dishes for a fake diner or an unhinged fusion spot, each with a silly name, a one-line description, and a price. It just sits there, lean-back, like a real menu. No orders, no bets, no player state shown until reveal.
**Each phone, PRIVATELY and simultaneously (60s timer):**
1. **Your order** — tap the ONE dish you'd genuinely order tonight. This is your honest vote and it's hidden.
2. **Your bet** — drag chips onto the dish you think the *table* will order most. Also hidden.
Both are locked when the timer ends. Nobody sees anybody's order or bet — the whole game is the asymmetry between what you'd eat and what you think everyone else will.
**Reveal (host screen):** dishes light up with their real order counts, the "table favorite" is crowned, and bettors who backed it get paid — with contrarian-correct bets (you called the sleeper dish the crowd actually piled onto) paying bigger odds than the obvious pick. The comedy is in the gaps: the person who swore everyone would get the burger, the dish nobody ordered but three people bet on.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{phase, menu:[Dish], deadlineTs}`, `Player{id, chips, order:dishId|null, bet:{dishId, amount}}`. Sync is simple relative to real-time games: phones submit two write-once payloads before the server deadline; the server withholds all orders/bets until phase flips to `reveal`, then computes counts and payouts and broadcasts once. The genuinely hard part is trust and simultaneity, not throughput — orders/bets must be un-leakable pre-reveal (kept server-side, never echoed), and the server clock, not any phone, owns the lock deadline so a slow phone can't peek-then-submit. Menu generation in v1 is a hardcoded JSON blob.

## v1 scope
- 3 players, one hardcoded menu of ~9 dishes, one round.
- One order + one flat-stake bet per player.
- Simple payout: back the top dish, win; ties split.

## Out of scope
- Menu generation / packs / camera-scan a real menu.
- Odds curves, multi-round tournaments, dietary filters, drinks.

## Risks & unknowns
- With very few players the "table favorite" can be a coin flip; needs enough dishes that betting has real spread.
- Fun depends entirely on menu writing — bland dishes kill it.
- Balancing obvious-pick vs. contrarian payout so hedging isn't dominant.

## Done means
3 phones join via room code, the TV shows one menu, each phone privately locks one order and one bet before a server-owned deadline, and the host reveals correct order counts and pays the winning bettors — with no order or bet ever visible to another player before reveal.
