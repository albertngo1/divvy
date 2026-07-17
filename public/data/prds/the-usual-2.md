## Overview
The Usual is a 3-5 player social-prediction game that turns the most passive ritual at any dinner — reading a menu together — into a private betting market on your own friends. It's for a group that already knows each other well enough to argue about it. The menu is the board; the wagers are on human nature.

## Problem
"What are you getting?" is idle table chatter with zero stakes. You privately think you know exactly what your sister will order — but you never get to prove it, and being right feels like nothing. The Usual makes reading the table a competitive, secret, scored act.

## How it works
The host TV shows a themed menu of ~8 dishes (bundled). Three phases:

1. **Order (private, simultaneous):** every phone privately picks your OWN dream order — one dish. Locked and hidden. Nobody sees it.
2. **Bet (private, simultaneous):** your phone now shows the other players' names and a budget of 10 chips. You drag chips onto the dish you predict each friend ordered — betting more where you're confident, spreading thin where you're unsure. All simultaneous, all hidden.
3. **Reveal:** the host flips each person's real order one at a time. For every correct prediction you split a parimutuel pot with the other players who also nailed that person — so a correct read that NOBODY else saw pays big, while betting the obvious pick everyone predicted pays little. A running scoreboard fills the host screen.

Private per phone: your own order and your entire prediction sheet. Public: only the reveals and the scores.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit). Data model: `menu {dishes[]}`, `player {id, name, order, bets:{targetId:{dishId:chips}}}`. The flow is phase-gated and turn-based, not latency-sensitive: phones submit a locked order, then a bet sheet; the server validates each budget (≤10 chips) and computes parimutuel payouts per target (for each person, everyone who bet the correct dish splits that target's pot proportionally).

The hard part isn't sync — it's (a) a payoff formula that reads as fair and legible at reveal, and (b) airtight locking so no phone can see others' orders before the reveal. Enforce server-side locks; never broadcast any `order` field until the reveal phase.

## v1 scope
- 3 players, one 8-dish bundled menu
- Pick own order + predict the 2 others, 10-chip budget
- Parimutuel payout, single reveal, scoreboard
- One round, no persistence

## Out of scope
- Photographed or user-uploaded real menus, multi-round play, hidden "diner persona" cards, over/under betting on the total bill.

## Risks & unknowns
- Could collapse into flat trivia if chip allocation feels trivial — the confidence-spread must matter.
- Requires players who genuinely know each other; falls flat with strangers.
- The menu needs enough appealing spread that picks aren't all obvious.

## Done means
Three phones lock private orders, allocate prediction chips within budget, the host reveals each order and computes payouts where a correct-but-unpredicted read pays more than the obvious one, and the scoreboard displays.
