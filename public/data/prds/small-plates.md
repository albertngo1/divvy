## Overview
Small Plates is a Keynesian beauty-contest hiding inside a restaurant menu. The host screen shows a menu; every phone secretly orders a dish and secretly bets on which dish the whole table will order most. Because your own order feeds the tally you're betting on, you can swing the result you wagered on. For 3-6 players who enjoy reading a room and out-thinking it.

## Problem
A menu is the ultimate passive-consume object — you skim it, you pick, done. Small Plates makes the group's *own collective taste* the thing you bet on, and lets you quietly manipulate it, turning a menu into a reflexive market.

## How it works
The host shows ~8 dishes with playful descriptions. Each round, every phone commits two simultaneous secret actions: **ORDER** (the one dish you'd actually eat) and **BET** (stake chips on which dish will be the table's plurality winner). The reflexive twist: your order counts in the tally you're betting on — so you can "cook the books," ordering a dish you don't want to push your wager over the line. When all phones lock, the host reveals the tally and lights up the winning dish. Payout is parimutuel: the pot splits among everyone who bet the winner, weighted by stake — so backing the obvious favorite pays crumbs (everyone shares it) while backing a dark horse you personally swing pays big. Most chips wins.

**Private per phone:** your order, your bet + stake, your bankroll. **Host screen:** the menu, then after lock, the tally, winning dish, and payouts.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object / Socket.IO over Tailscale Serve). Model: `Room{menu[], phase}`, `Player{bankroll, order, bet{dishId, stake}}`. Sync is two-phase commit, not real-time: collect all orders+bets, barrier when everyone is locked, then reveal atomically. The hard part isn't latency — it's designing a menu whose plurality is genuinely swingable at 3-6 votes (avoiding one runaway favorite), a legible parimutuel payout on a small screen, and a fair plurality tie-break rule.

## v1 scope
- 3 players, one static 8-dish menu
- One round: one order + one bet each
- Flat bankroll, simple parimutuel payout

## Out of scope
- Multiple courses/rounds, dynamic or themed menus
- Chat, reconnection polish, animation

## Risks & unknowns
- At 3 players a single vote may swing everything (too volatile)
- Could collapse into "just bet the obvious favorite"
- Parimutuel legibility on phones; tie-break feel

## Done means
Three phones each secretly order and bet, the host reveals the plurality winner and pays out parimutuel, and a player who orders against their real preference specifically to swing their own bet can demonstrably come out ahead.
