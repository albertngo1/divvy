## Overview
Two-Top turns the most passive object at any table — the menu — into a live parimutuel betting floor. It's a 4–6 player game where one person is the secret **Diner** who privately locks an order, and everyone else is a **Bettor** wagering chips on what the Diner chose. The catch: each Bettor holds a *different* private clue about the Diner's tastes, so nobody has the full picture. It's for groups who like a little cutthroat guessing between courses.

## Problem
Staring at a menu is dead time. Ordering is a group ritual with zero stakes. Two-Top injects hidden information and money into that ritual: reading a person is the game, and the menu is the board you already know how to read.

## How it works
The host TV shows a fixed 8-item menu (name, price, a one-line description) and the pot size. Nothing on the TV is secret — it's the shared board.

**Diner phone (private):** sees the same menu plus a prompt: "Order exactly 2 dishes." They tap two, then it locks and shows only "Order locked — sit tight."

**Each Bettor phone (private):** shows the menu, a chip stack (say 10 chips), and ONE asymmetric clue unique to that phone — e.g. "They're vegetarian tonight," "They're broke — nothing over $18," "They always get the thing they can't pronounce." Bettors privately drag chips onto menu items (any spread) and lock. No phone sees another's clue or bets.

**Reveal (host TV):** the Diner's two dishes flip face-up with a flourish. Payout is parimutuel: for each correct dish, everyone who put chips on it splits the losers' chips on that dish proportionally. TV shows the leaderboard; each phone privately shows its own take.

The per-phone architecture is load-bearing three ways: the Diner's order is hidden on their own device, every Bettor's clue is private (pooling them would trivially solve it), and bets are simultaneous and concealed. Passing one phone around leaks all three and kills the game.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `Room{ menu[8], phase, pot }`, `Player{ id, role, clueId?, order?, bets:{itemId:chips}, locked }`. Host tab is a read-only subscriber rendering board + reveal. Phases: LOBBY → DINER_PICK → BETTING(timer) → REVEAL → PAYOUT, server-driven. Sync is trivial (a handful of small messages); the only real-time need is the betting countdown and a synchronized reveal frame. Hard part is *content*: authoring clue sets that are each individually ambiguous but collectively solvable, and a menu whose items are distinguishable along clue axes (price, diet, adventurousness). Payout math is a simple pooled split.

## v1 scope
- 4 players: 1 Diner, 3 Bettors, host on a laptop.
- One hardcoded 8-item menu, one clue set of 3.
- One order, one betting window (45s), one parimutuel payout, one winner.
- Chips as integers; no login, 4-letter room code.

## Out of scope
- Multiple rounds / rotating the Diner role.
- Real menu import (photo/OCR), custom menus.
- Bluffing mechanics, side bets, chip persistence across games.

## Risks & unknowns
- Clue balance: too strong and it's solved, too weak and it's a coin flip.
- Parimutuel can feel swingy with only 3 bettors — may need a house baseline.
- Diner may pick "unreadable" orders to grief; a 2-of-8 constraint limits this.

## Done means
Four phones join via code; one locks a hidden 2-dish order; three bettors each see a distinct clue and privately allocate chips; on the host's reveal the correct dishes flip and chips redistribute parimutuel-style with a per-phone take shown and a winner named — all without any phone ever seeing another's clue or bets.
