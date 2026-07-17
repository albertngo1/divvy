## Overview
Order Up is a 3–5 player game that turns the most passive group ritual — squinting at a takeout menu — into a private prediction market on one person. Each round a rotating 'Diner' secretly commits a full order off the shared menu; everyone else fills a private prop-bet slip guessing it. For friends, roommates, or a first-date-energy group that thinks they know each other's taste.

## Problem
Deciding what to order is dead time, and 'I know exactly what you'd get' is an untested boast. Menus are shared and public, so any guess made out loud gets anchored by the last person who spoke. The itch: privately prove you can read someone's appetite — no herding, no peeking.

## How it works
The host TV shows a real menu (bundled: a diner menu with appetizers, entrées, a drink, dessert, and price brackets). One player is the **Diner**. On the Diner's phone PRIVATELY: they build a real order — pick an appetizer (or none), an entrée, whether they'd add dessert, and their spend bracket — then lock it. It is never shown on the TV. Simultaneously, every other phone shows the same menu as a PRIVATE bet slip: predict the Diner's appetizer, entrée, dessert-yes/no, and bracket. Nobody sees anyone else's slip; the TV shows only 'N of M slips in.' When all lock, the host reveals the Diner's real order line by line, and each prop resolves: exact entrée = 3 pts, right appetizer = 2, right dessert-yes/no = 1, right bracket = 1. Top reader wins the round; the Diner earns points for every prop that stumped the table (rewarding a surprising-but-honest order).

Per-phone is load-bearing: the Diner's real pick must stay hidden while bettors commit blind and simultaneously. Pass one phone around and the Diner's order leaks, the slips anchor to whoever went first, and the entire read-the-person tension collapses.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve or PartyKit). Data model: `Round{menu, dinerId, dinerOrder, slips{playerId:slip}, phase}`, where `slip = {appetizer, entree, dessert, bracket}`. Sync is turn-phased, not real-time: `COMMIT` (all phones locking privately, server holds each in escrow and reveals nothing) → `RESOLVE` (server scores). The interesting part isn't latency; it's guaranteeing simultaneity-of-hidden-state: the server must accept and store the Diner's order and every slip without echoing any of them to other clients until the phase flips, so no client ever holds enough state to leak a peek. Menu is static JSON keyed by item id so scoring is exact-match.

## v1 scope
- 3 players, ONE bundled menu, one round, one Diner.
- Four prop fields (appetizer, entrée, dessert y/n, bracket).
- Host reveal + single-round scoreboard.

## Out of scope
- Rotating Diner across multiple rounds, custom/photographed menus, real ordering integration.
- Parimutuel odds or stakes; steering the order (that's a different game).
- Modifiers, sides, 'for the table' items.

## Risks & unknowns
- Thin if the Diner is easy to read; needs a menu with genuine ambiguity.
- Balancing Diner points so honest-but-surprising beats deliberately obscure orders.
- Single round may feel slight without the rotate-the-Diner loop (deliberately deferred).

## Done means
Three phones join, the Diner privately locks a four-field order shown nowhere else, the two bettors privately submit slips with no cross-leak, and on reveal the host scores each prop exactly and names the best reader plus any props that stumped the table.
