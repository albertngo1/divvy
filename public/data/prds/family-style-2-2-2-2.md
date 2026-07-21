## Overview
Family Style turns reading a menu — pure passive scrolling — into a futures market on your own group's appetite. For 3–6 people deciding where/what to eat: each phone secretly picks the dish it craves AND bets chips on which dishes the whole table will pick, then the market settles against the group's real hunger.

## Problem
Ordering for a table is a decision, not a game. Somebody scrolls the menu aloud, everyone half-listens, and the actual craving each person has stays invisible until food arrives wrong. There's no stakes, no reading-the-room, no reward for the person who nails what everyone secretly wants.

## How it works
The host TV displays a single menu (~12 dishes with prices/photos). Every phone privately does two things simultaneously: (1) CRAVE — tap the one dish you actually most want (hidden from everyone, including which dishes others crave), and (2) BET — split a small chip stack across the dishes you predict will be the table's most-craved "house favorites." The host screen shows only the menu and a total-pool ticker — never individual craves or bets. The tension is that you control exactly one crave-vote, so you can vote your true hunger or throw it strategically to swing your own bet — but so is everyone else, blindly. On a server timer, submissions lock; the host tallies the secret craves into a live-building bar chart, and the chip pool pays out pari-mutuel to whoever backed the top dishes. Reveal shows each dish's crave-count and who bet on what.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve, or a Durable Object). Data model: `Room{menu[], phase, deadline}`, `Player{id, chips, crave:dishId, bets[dishId]->stake}`. Both crave and bets are held only on the owning socket until lock — the host receives nothing but the running pool total, so no client can leak another's craving. Sync: single `submit` event per phone carrying crave+slip; server validates one crave and total stake ≤ bankroll, timestamps against its own deadline, rejects late arrivals. Hard part: fair pari-mutuel settlement when the outcome being bet on IS the aggregate of the hidden inputs — the server must freeze all craves atomically at lock, tally, then pay before any crave data is broadcast, so nobody can bet after seeing the count.

## v1 scope
- 3 players, ONE fixed 12-dish menu, ONE round
- Exactly one crave-tap + a 6-chip betting slip per phone
- Pari-mutuel payout to the single top-craved dish
- Reveal: crave bar chart + per-player bets

## Out of scope
- Real menu import / restaurant data
- Multiple rounds, persistent bankroll, ties beyond simple split
- Actually placing an order or bill-splitting

## Risks & unknowns
- With 3 players the crave tally is tiny and noisy — may need 4–5 minimum
- Strategic-vs-honest craving may collapse to everyone betting their own craving
- Menu must have real spread of tempting options or the market is obvious

## Done means
Three phones join, each privately submits one crave and a hidden bet, the server locks on a timer, the host reveals a crave bar chart, and the chip pool pays out correctly to bettors who backed the top dish.
