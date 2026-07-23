## Overview
Covers is a private-betting party game played over a menu. 3–6 players stare at a real menu on the TV (dish names and lush descriptions, PRICES HIDDEN). Each player secretly picks the one dish they'd actually order, then privately bets chips on which single dish will be the table's most-ordered — the plurality "cover." You win not by ordering well but by reading the room's collective appetite.

## Problem
Groups passively scroll menus and mumble "ooh that looks good" with zero stakes. Covers converts that shared browsing into a hidden prediction market: you're betting on what everyone else secretly wants, which means second-guessing your friends' cravings — and maybe ordering strategically to steer or fake the outcome.

## How it works
The host TV shows the full menu, always. Nothing about anyone's choices appears until reveal.

Each phone PRIVATELY shows two steps, done simultaneously and blind:
1. **Order** — tap the one dish you'd genuinely order tonight.
2. **Bet** — spread 10 chips across the dishes you think the TABLE will most order (plurality). You can go all-in on one or hedge across three.

When all phones lock, the host animates the reveal: dishes light up as the "table's order" is tallied, crowning the plurality dish (ties broken by lowest menu price — the cheaper crowd-pleaser). Payout: chips you placed on the winning dish return multiplied by how contested it was (a surprise winner pays more than the obvious one). The private layer is load-bearing: because orders AND bets are secret and simultaneous, you can't just watch what others tap — you have to model their taste. A single passed phone destroys the game.

Reveal keepsake: a printed "table's order" ticket showing what the group collectively wanted, plus who nailed the read.

## Technical approach
Host tab + phone PWAs + authoritative WS server (Socket.IO over Tailscale Serve or a Durable Object). Data model: `Menu{dishes:[{id,name,desc,price}]}`, per-phone `Choice{orderId, bets:{dishId:chips}}`. Sync is simple and turn-gated: server waits for all `locked` events, then computes plurality and settles — no real-time streaming needed. Settlement multiplier = totalChipsInPool / chipsOnWinningDish, so betting the consensus pays little and calling a dark-horse dish pays big.

Genuinely hard part is not sync (it's near-trivial here) but FAIRNESS and content: tie-break rules that feel just, and curating a menu with real spread so the plurality isn't a foregone conclusion. Honest assessment: low technical risk, medium design risk.

## v1 scope
- 3 players, ONE hardcoded menu (~8 dishes)
- Private order + private 10-chip plurality bet, simultaneous lock
- Plurality tally + contested-payout settlement + reveal ticket

## Out of scope
- Menu uploads / OCR of real menus
- Multiple rounds, price-guessing side bets, running bankroll
- Dietary filters, personalization

## Risks & unknowns
- With few players the plurality is often obvious → thin drama; needs a menu tuned for genuine disagreement
- Tie-break feel; players may resent price-based resolution
- Whether "order to fake out" strategy emerges or players just order honestly

## Done means
3 phones join, the menu shows on the TV with prices hidden, each player privately locks an order and a 10-chip bet, and on lock the host reveals the plurality dish and correctly pays out chips with the surprise-multiplier, ending on a shareable table-order ticket.
