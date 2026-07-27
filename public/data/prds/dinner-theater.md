## Overview

Dinner Theater turns a menu — the most passively-consumed shared document in existence — into a private prediction market on your own friends. The host screen shows one restaurant menu, twelve dishes, big and legible. Every phone privately receives a *diner card*: a hidden appetite that constrains what that player is allowed to order. Then everybody bets on what everyone else will order. For 4-6 players, one round, ten minutes.

## Problem

Groups stare at menus together constantly and the only game is "what are you getting?" There's a real hidden-information game buried in that moment — you *think* you know what your friends will order, and you're wrong more often than you'd admit. Nobody has turned the menu itself into the board.

## How it works

**Host screen (public):** the full menu, twelve dishes with prices and florid descriptions, arranged in a grid. Later, a bet board. Later still, the reveal.

**Each phone (private):** the same menu, PLUS a diner card only you see — a constraint like "you are broke: nothing over $18", "you're vegetarian tonight", "you're trying to impress someone: order the most expensive thing you can justify", "you hate seafood", "you always order what sounds weirdest". Cards are drawn from a shared deck so multiple diners may share a constraint, and no player knows anyone else's.

**Phase 1 — Order (60s, simultaneous, private).** Each phone picks one dish. Locked, hidden. The host screen shows only "4 of 5 have ordered."

**Phase 2 — Bet (90s, simultaneous, private).** Each phone shows a betting slip listing every *other* player by name. You distribute 10 chips across guesses: drag chips onto (player, dish) pairs. Concentrate all 10 on one confident call, or hedge across three. Chip placement is fully private — the host board shows only aggregate heat per dish, never who bet what, so the heatmap itself is misinformation you helped create.

**Phase 3 — Service.** Host reveals orders one diner at a time with a plating animation, then flips that diner's hidden card. Payout: 3 points per chip on a correct (player, dish) pair. Bonus "Read the Room": +5 if you correctly guessed someone's *card* — each phone gets one free card-guess during Phase 2, private.

The per-phone architecture is the whole game: simultaneous secret orders, secret constraints, and secret chip allocation cannot survive a passed phone. The moment one screen is shared, everyone's order and every bet leaks.

## Technical approach

PartyKit Durable Object per room. State: `{roomCode, phase, menu[12], players: {id, name, cardId, order|null, bets: [{targetId, dishId, chips}], cardGuess}}`. Phones join via QR → PWA, WebSocket to the room DO. Private state is never broadcast: the server sends each socket a filtered projection (your card, your bets, public aggregates only). Phase transitions are server-authoritative on a timer; the host tab is a *dumb renderer* subscribing to the public projection.

Hard part: the private-projection discipline. One lazy `broadcast(state)` leaks every order. Enforce it with a single `projectFor(playerId, state)` function that all outbound messages route through, and a test that asserts no other player's `order` or `bets` ever appears in a phone's payload.

## v1 scope

- One hardcoded menu (12 dishes), one hardcoded card deck (8 cards)
- 4-5 players, exactly one round, no series
- 10 chips, integer only, drag-or-tap allocation
- One card-guess per player
- Host reveal is a simple sequential list, no animation polish
- Scores shown once at the end; no persistence

## Out of scope

Multiple menus/cuisines, multiple rounds, chip carryover, rejoin after disconnect, audience mode, custom menus, mobile-web sound.

## Risks & unknowns

Cards may be too easy to infer from the order itself, collapsing the bluff — needs cards that overlap plausible dishes. Betting UI on a small screen with 4 targets × 12 dishes is cramped; likely needs a two-tap flow (pick player → pick dish → chips). Unknown whether 90s is enough for the bet phase.

## Done means

Five phones join a room by QR, each sees a different private card, everyone orders and bets simultaneously without any phone ever displaying another player's order or chips, the host reveals all orders and cards, and a correct scoreboard appears — end to end, no reloads.
