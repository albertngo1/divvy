## Overview
Table Stakes weaponizes the most passive thing a group does: staring at a menu. Before a single word is spoken, 3–5 players each privately pick their own 'order' from a shared menu on the host screen and simultaneously wager on what *everyone else* will pick. It's a party game for friends who think they know each other — a restaurant menu turned into a hidden prediction market about the table itself.

## Problem
Groups consume menus in silence and then out loud ('what're you getting?'), which collapses everyone toward the same safe choices. There's a latent game in *predicting* orders, but said out loud it's spoiled instantly — the guesses have to be locked, private, and simultaneous, or there's no bet, just chatter.

## How it works
The **host screen** shows a curated menu (~8 dishes with art) and, later, the reveal board. It never shows anyone's picks until reveal.

Each **phone privately** does two secret things at once: (1) tap your *own* order, and (2) for each other player, tap which dish you think *they'll* order. All locks are simultaneous and hidden. Scoring has two poles of tension: you earn chips for every other player's order you correctly predicted (**read the room**), but you also earn a bonus if *nobody* predicted *your* order (**be a wildcard**). So do you order the obvious crowd-pleaser and get read, or the weird thing to score the wildcard bonus while risking a bad 'meal'? Reveal flips picks one at a time on the host screen with a little payout animation. Per-phone architecture is load-bearing: the moment a phone is passed around, secrecy and simultaneity — the entire bet — evaporate.

## Technical approach
Authoritative WebSocket server (Socket.IO over Tailscale Serve or a Durable Object). Data model: `Room { menu[], players[], phase }`, `Lock { playerId, ownPick, predictions: {targetId: dishId}, locked }`. Sync is a simple lockstep barrier: server accepts locks privately, reveals nothing until all `locked===true`, then broadcasts the full `Lock` set and computes scores server-side (predictions matched against actual `ownPick`s, wildcard bonus = ownPick present in nobody's predictions). No real-time twitch; the hard part is airtight secrecy — the server must never leak a partial state, and reveal ordering is server-driven.

## v1 scope
- One hard-coded 8-dish menu.
- 3 players, one round.
- Each phone: pick own dish + one prediction per other player.
- Host shows menu, then reveals picks with read/wildcard scoring.

## Out of scope
- Multiple rounds, chip banks, drafting real restaurant menus via OCR.
- Categories (appetizer/entrée/drink) or multi-item orders.
- Odds, side bets, or bluffing mechanics beyond wildcard bonus.

## Risks & unknowns
- May feel thin at 3 players; the metagame likely needs 4–5 to sing.
- Wildcard vs read-the-room balance is untuned — one may dominate.
- With a small menu, everyone crowds a few dishes and predictions get trivially easy.

## Done means
Three phones join, each privately locks an order plus predictions, and when all three are locked the host reveals every pick and awards read-the-room and wildcard chips correctly — with no phone able to see another's state before the barrier releases.
