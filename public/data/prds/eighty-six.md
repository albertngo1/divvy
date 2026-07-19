## Overview
Eighty-Six turns the most passive thing a table does — staring at a menu deciding what to eat — into a live prediction market. For 3–6 friends at a restaurant (or a couch with a takeout menu), each dish becomes a tradeable stock, and the fun is that everyone has one piece of guaranteed insider information: their own craving.

## Problem
"What are you getting?" is dead air. Menus are consumed in silence, then everyone orders and forgets it. There's latent drama — who's predictable, who's contrarian, who caves to the specials — that never gets played. Eighty-Six mines it.

## How it works
The host screen loads a menu (paste a URL, or the table photographs it → OCR into 6–10 item cards) and displays it as a market board: each dish with a live price and a sparkline. This board is the ONLY public artifact.

Each phone privately shows two things nobody else sees: (1) a secret **order pad** where you lock in what you will genuinely order tonight, and (2) a **portfolio** of chips to buy shares in whichever dishes you predict the *table* will collectively order. Over a 90-second window you buy simultaneously and secretly. Buys push a dish's public price up — but the board shows only aggregate movement, never who bought. So you have inside knowledge (you KNOW your own order pays out) and a bluffing lever (pump the risotto's price, then order the burger to fake out readers).

At the bell, everyone reveals their real order. Dishes that got ordered by anyone "pay out" to shareholders; contrarian-but-correct shares (few buyers, dish ordered) pay more. Highest closing net worth wins. It doubles as actually deciding dinner.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{menu:Item[], phase}`, `Item{id,name,price,shares:{playerId:qty}}`, `Player{chips, order:itemId[], portfolio}`. The server is the only writer of prices: each buy is a message `{itemId, qty}`; server applies a bonding-curve bump (`price += k*qty`) and broadcasts only the new aggregate price + sparkline point — never per-player positions. Order pads are stored server-side and withheld until reveal. Sync strategy: server-authoritative tick loop at ~4Hz for price broadcasts; buys are optimistic on the phone with server reconciliation. The genuinely hard part is a price curve that feels alive and gameable in 90 seconds without runaway pumps — needs a damping/liquidity constant tuned so a lone buyer can move a price but not dominate, and payout math that rewards contrarian correctness without punishing obvious picks into uselessness.

## v1 scope
- 3 players, one round, one hard-coded 6-item menu (skip OCR — type items).
- One 90-second buy window, then reveal.
- Flat linear price bump; simple payout (ordered = pays face value + contrarian bonus).
- Host board shows price + one sparkline per item.

## Out of scope
- OCR / URL menu import.
- Multiple trading windows, short-selling, cash-out.
- Persistent leaderboards across meals.

## Risks & unknowns
- Does hidden-price-movement bluffing actually read as fun, or just noise with 3 players? Needs playtest.
- Payout tuning: obvious dishes shouldn't be worthless, contrarian shouldn't be a coin flip.
- Restaurants: people may just want to order — game can't slow dinner.

## Done means
Three phones join a room, each privately locks an order and secretly buys shares over 90s while the host board shows only aggregate prices moving; at the bell all orders reveal, the server computes net worth, and a winner is declared — with at least one dish whose price moved without any player being identifiable as the buyer.
