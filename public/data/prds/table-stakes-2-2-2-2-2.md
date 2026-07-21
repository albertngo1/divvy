## Overview
A private-betting game you play in the ninety seconds a group spends staring at a takeout menu. 3-6 players. The menu everyone passively scans becomes a prediction market about the people holding the phones: you bet on what the table will order.

## Problem
Deciding what to order is dead air — everyone silently reads the same laminated card. Meanwhile the actual fun of a group is that you *know* these people: you know Sam always gets the spiciest thing and Dana can't resist the special. That social knowledge is currently worthless. Table Stakes prices it.

## How it works
The host TV displays a shared menu (a curated 12-item pack for v1 — dishes, categories, prices). Two things happen simultaneously on every phone, both hidden:
1. **Your real order.** You privately lock the one dish you'd genuinely eat tonight. Nobody sees it until reveal.
2. **Your bets.** For each *other* player, you stake chips from a private bankroll predicting their pick — exact dish (big payout) or just the category (small payout).

The TV shows only an anonymized **pot**: total chips wagered and a live heat-map of which dishes are drawing money — never who bet what. When everyone locks (or the timer expires), orders flip face-up on the TV. Payouts are parimutuel-flavored: the fewer players who backed a correct call, the bigger it pays, so nailing someone's weird contrarian pick is worth more than the obvious one. Most chips wins; the loser buys the appetizer.

The phone is load-bearing because orders must be locked *secretly and simultaneously* — one passed phone would leak every real pick and collapse the market.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room{code, menu, phase, pot}`; `player{id, name, order:secret, bets:{targetId:{dish,stake}}, chips}`. Single simultaneous **order+bet** phase gated by a lock-count or countdown; server withholds all slips until the gate closes, then computes parimutuel payouts (weight each correct call by inverse of how many backed it) and broadcasts the reveal atomically. Genuinely hard part: fair, legible odds — the live heat-map must aggregate hidden money without ever letting a client infer an individual's bet, and payout math must feel intuitive at reveal.

## v1 scope
- 3 players, one round, one built-in menu
- One real order + bets on the other two players
- Exact-dish and category payouts, parimutuel weighting
- Anonymized pot heat-map on TV; reveal + chip tally

## Out of scope
- Real menu import / OCR of a photographed menu
- Multi-round bankroll persistence, side bets, bluff/hedge phases
- Splitting real bills, delivery integration

## Risks & unknowns
- With 3 players the market is thin; parimutuel swings may feel random
- Players may collude verbally about orders — needs a no-talking norm
- Category-vs-exact payout balance needs playtest tuning

## Done means
Three phones lock secret orders and bets simultaneously; the TV shows an anonymized pot during betting and never leaks an individual bet; at reveal orders flip, parimutuel payouts resolve correctly, and a single chip leader is declared.
