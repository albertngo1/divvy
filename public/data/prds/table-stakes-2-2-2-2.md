## Overview
A hidden-agenda betting game for 3-5 people 'ordering for the table' from a menu shown on the host TV. Each player secretly owns a stake in one dish and bets, round by round, to push the table's final order toward it — while staying unmade.

## Problem
Group ordering is the ur-example of passively consuming a menu wrapped around invisible politics: everyone quietly lobbies for what they want and pretends they don't care. No party game turns that covert steering into an actual betting competition with hidden stakes and live reads.

## How it works
The host shows a fixed menu of 6 dishes (emoji + names). Each phone is privately dealt ONE secret dish it's a 'shareholder' of — you score big only if that dish lands in the table's final 3-dish order. Across 3 fast rounds, each player privately places a small budget of 'recommendation' tokens onto dishes. The host TV renders the result as anonymous token stacks per dish — you see the totals, never who placed what.

Each round you also get one private 'read': secretly guess another player's dish. A correct read privately hands you a veto chip that suppresses one token from that dish next round; a wrong read is wasted and (optionally) costs you. After 3 rounds the top-3 dishes by net tokens are 'ordered,' shareholders reveal, and payouts scale up for a dish that was hotly contested and DOWN for a shareholder who got correctly read — rewarding subtle steering over brute-forcing.

PRIVATE on each phone: your secret dish, remaining tokens and vetoes, your read guesses and their results. PUBLIC on the host TV: the menu, the anonymous stacks, a round countdown, and the final reveal.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object). Model: Room{menu[6], round, phase}; Player{id, secretDish, tokens, vetoes, reads[]}. Rounds are simultaneous-commit: phones buffer placements locally and submit on a countdown; the server resolves the whole round at a barrier and broadcasts ONLY the aggregate stack deltas — never per-player attribution. Reads resolve privately: only the reader learns the result; the target's dish is never exposed to the room. Hard part: leak-proofing. Submission timing, message ordering, or a stack that only ever moves when one specific phone acts can all de-anonymize placements with few players — so the server must batch-resolve and emit deltas exclusively at the barrier.

## v1 scope
- 3 players, one fixed 6-dish menu
- 3 rounds, 3 tokens each, one read per round
- top-3 order → shareholder reveal → payout

## Out of scope
- Real menus or dish photos (emoji only)
- More rounds, cross-game chip economy, spectators, accounts
- Tie-break nuance beyond a coin flip

## Risks & unknowns
- With 3 players and 6 dishes the deduction may be thin, and stack anonymity is fragile (inference by elimination)
- The read/veto mechanic could feel swingy
- Payout balance (subtle-steer beats brute-force) needs real playtesting

## Done means
Three phones each receive a distinct secret dish, place hidden tokens across 3 simultaneous rounds shown only as anonymous stacks, and the reveal correctly computes the top-3 order and pays out shareholders per a hand-verified calculation — with no phone ever having seen another's secret dish or placements.
