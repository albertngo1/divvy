## Overview
Family Style turns a shared menu — the thing every group passively skims before a meal — into a private prediction market on each other. 3–5 players see the same menu on the host TV and, on their own phones, secretly (a) lock in what *they* will order and (b) bet on what each other player will order. You win by reading the table and by being unreadable yourself.

## Problem
Group ordering is a small ritual of deliberation — "what are you getting?" — that's social but stakes-free, and the moment someone announces out loud, everyone anchors. The itch: capture the private, pre-announcement moment where you already have a hunch about what everyone wants, and score it.

## How it works
The TV shows a menu of ~8 dishes and the list of players. Each phone PRIVATELY shows the same menu twice: first "Your order — pick one" (locked, hidden from all), then "Predict the others" — one dish guess per opponent. Everything is simultaneous and secret; nobody sees anyone's picks or predictions until reveal. When all phones lock in, the TV flips card-by-card: each player's real order revealed one at a time. Scoring is a double incentive — you earn a point for each opponent whose order you predicted correctly (reward for reading people), AND you earn a point for each opponent who *failed* to predict yours (reward for being surprising). So the optimal play is to read others sharply while ordering against your own type. A "table read" bonus goes to whoever nailed the most predictions.

A single passed-around phone is impossible: every player must privately and simultaneously commit both a hidden order and hidden predictions about everyone else — the asymmetry and secrecy are the whole game.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit). Data model: `room{menu[], phase}`, `player{id, name, order, predictions:{opponentId→dishId}, locked}`. Sync: phones send `lockOrder` then `lockPredictions`; server never rebroadcasts any player's choices until all `locked===true`, then emits a single reveal payload it walks through card-by-card on the TV. The hard part isn't real-time throughput (it's turn-gated) but airtight secrecy: the server must withhold all order/prediction data until the barrier is met, and clients must never receive another player's pick early — a classic hidden-simultaneous-commit barrier with a late-join / drop-out guard so one stalled phone can't freeze the reveal.

## v1 scope
- 3 players, one bundled fixed menu of 8 dishes
- One round: lock your order, predict two opponents
- Reveal walk-through on TV + simple point tally

## Out of scope
- Real menu OCR / photo upload, multiple courses, betting chips/odds, rematch scoring, dietary filters, more than one round.

## Risks & unknowns
- With only 8 dishes and 3 players, prediction may be too easy — menu size and player count need tuning so reads aren't trivial.
- The "be surprising" incentive could push everyone to order the weirdest dish, collapsing variety; may need a soft cap or category constraint.

## Done means
Three phones join, each privately locks an order and predictions with nothing leaking early, the TV reveals orders card-by-card, and the tally correctly awards both prediction hits and surprise points.
