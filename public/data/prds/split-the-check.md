## Overview
Split the Check is a 3–6 player party game that turns the most passive group ritual — reading a menu together — into a private prop-betting competition. Shared host screen shows a curated themed menu; every phone is a sealed order pad and betting slip. For friend groups who love the 'what's everyone getting?' moment at a restaurant and want to weaponize it.

## Problem
Menus are consumed identically by everyone and then discussed out loud, which leaks everything. There's a delicious hidden-information game buried in it — you always know one thing nobody else does: what YOU'RE ordering — but nothing makes you bet on it. The itch: exploit your own secret order to read (or bluff) the table's aggregate.

## How it works
The host TV displays a menu of ~8 dishes, each with a price and a silly description (a fixed themed set, e.g. 'Divorce Diner'). Two simultaneous private phases, all on-phone:

1. **Order (secret).** Each phone privately taps exactly one dish to order. Locked, hidden from everyone including the TV.
2. **Bet (secret).** Each phone is dealt 3 prop bets from a deck and privately stakes chips on ONE: e.g. 'Table total is OVER $X', 'At least two people ordered the same dish', 'I have the single most expensive order', 'Nobody ordered dessert'. You bet knowing only your own order — a private data point that shifts the odds.

The bluff: knowing you've secretly ordered the $42 steak, do you bet the total goes OVER — or bet UNDER and hope everyone else went cheap? On reveal, the host TV flips every order face-up at once, tallies the bill, and settles bets. Chips scored; highest chip count wins.

The host screen NEVER shows individual orders or bets until the simultaneous reveal — it only shows the menu and a running 'X of Y locked' counter.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object; Socket.IO over Tailscale Serve for homelab). Data model: `Room{code, menu[], phase, players[]}`, `Player{id, orderDishId|null, betPropId|null, stake, chips}`. Phones send `lockOrder` and `lockBet`; server holds them opaquely and broadcasts only aggregate lock-counts. On all-locked, server computes bill + settles props deterministically and pushes a single `reveal` event. Sync is easy (turn-based lock/reveal, no real-time positions); the genuinely hard part is **bet fairness** — the prop deck must be balanced so no bet is auto-win given typical menus, and the settlement logic for ambiguous props ('most expensive order' with ties) must be pinned down and identical across clients.

## v1 scope
- 3 players, one fixed 8-dish menu, one round.
- Exactly 4 prop types, flat stake (no variable chips).
- Reveal + winner banner. That's the whole game.

## Out of scope
- Multiple rounds / running bankroll, custom menus, variable staking, chat.

## Risks & unknowns
- Prop balance: a dominant always-true bet kills it — needs playtest tuning.
- Small tables make 'same dish' props swingy; may need menu size vs player-count scaling.
- Reveal drama depends on synchronized flip; a laggy phone dulls the moment.

## Done means
Three phones join via room code, each secretly locks one order and one prop bet, the host TV reveals all orders simultaneously, correctly tallies the bill, settles every bet, and declares a winner by chip count — with no phone ever seeing another's order or bet before reveal.
