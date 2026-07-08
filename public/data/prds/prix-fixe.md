## Overview
Prix Fixe turns the passive pleasure of browsing a menu into a Keynesian beauty contest with money on it. The host TV shows a real restaurant menu; each player secretly picks a dish for themselves and privately wagers on what the *table* will collectively order most. For 3-6 hungry friends deciding where the fun (and the funniest predictions) live.

## Problem
Reading a menu together is pleasant but totally inert. "What are you getting?" is small talk that resolves nothing and rewards nothing. Meanwhile the actually-interesting hidden information in the room — what your friends genuinely crave — never gets used. There's a real social-read game buried in a menu and nobody plays it.

## How it works
The host TV shows one menu section — say six mains, with photos and prices. Simultaneously and privately, each phone does two secret things: (1) pick the dish YOU would actually order, and (2) place a variable wager on which dish will be the table's most-ordered pick. Live odds appear on each phone — the more chips pile onto a dish, the lower it pays — but each phone only ever sees the aggregate odds, never who bet what or who ordered what. On lock, the TV reveals the tally of everyone's secret orders. Correctly betting the crowd favorite pays out by its odds; a separate contrarian bonus goes to anyone who turns out to be the LONE orderer of a dish. So the winning move is reading the room's taste, not indulging your own. Per-phone is load-bearing: the secret simultaneous orders and the hidden live wagers cannot survive one phone passed around a table.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO or PartyKit over Tailscale Serve). Data model: Room{menu, phase, oddsBySide, pot}, Ballot{playerId, orderPick, betPick, stake}. Sync strategy: a two-phase flow — an open "betting" phase where stakes stream in and odds recompute pari-mutuel-lite in real time, then a hard lock followed by the reveal. The genuinely hard part is recomputing and broadcasting live odds as bets land WITHOUT leaking any identity, plus a clean simultaneous lock so nobody can front-run the tally by watching odds settle.

## v1 scope
- One 6-dish section, hand-entered
- Exactly 3 players, 100 chips each fixed
- One betting phase, one lock, one reveal
- Odds payout + contrarian lone-orderer bonus

## Out of scope
- Multiple courses / full-meal rounds
- Real menu ingestion or photo scraping (hand-enter dishes)
- Dietary filters, multi-round tournaments, seasons

## Risks & unknowns
- With only 3 players a "crowd favorite" is thin — the game may truly need 4-5 to sing, testing the tiny-v1 constraint
- Live-odds identity leakage from timing side-channels
- Requires genuinely appetizing menu content to feel worth staring at

## Done means
Three phones each secretly submit an order and a wager; the TV reveals the order tally; chips pay out by the final odds with the contrarian lone-orderer bonus correctly applied, and no phone could reconstruct who bet what during the open phase.
