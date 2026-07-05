## Overview
A private-betting party game about the most passive thing a group does: staring at a menu. The shared TV shows a menu grid; each phone is a secret betting slip. It's for friend groups who think they know each other's taste — and want to cash in on it. 4-8 players, one host screen, one round to prove the fun.

## Problem
Handing a menu around a table is dead air — everyone reads silently, mumbles, and defers. Meanwhile the actual game ("I *knew* you'd get the fried chicken") happens in people's heads and never gets scored. There's a private prediction market hiding inside every group order, and nobody's cashing the ticket.

## How it works
The host TV shows a 9-item menu grid (real photos/prices from a delivery menu). One player is chosen as the **Diner** for the round. 

- **Diner's phone (private):** shows the same 9 items and asks "What would you *actually* order right now?" They tap one and lock. Their pick is invisible to everyone until reveal.
- **Every other phone (private):** each gets 10 chips and privately spreads them across the 9 items — a hidden pari-mutuel bet on the Diner's pick. You can shove all 10 on one item or hedge across three.
- **Host TV (shared):** shows only the menu and a countdown, plus who's still betting. It never shows anyone's chips or the Diner's choice.

On lock, the TV flips the Diner's real order face-up. Payout is **contrarian pari-mutuel**: winners split the pot in proportion to their stake, but the fewer people who also backed that item, the bigger each winner's multiplier. Nailing a friend's oddball order (the anchovy pizza nobody else saw coming) pays huge; piling onto the "safe" burger everyone bet pays pennies.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). 

Data model: `Room { code, menu[9], dinerId, phase }`, `Bet { playerId, allocation[9], locked }`, `DinerPick { itemIndex, locked }`. Server holds all bets and the pick as authoritative hidden state; broadcasts only phase + "locked" flags. Sync is turn-gated, not real-time frame-critical: the hard part is the **simultaneous reveal** — the server must accept all locks, close betting, and compute the contrarian pari-mutuel payout server-side before broadcasting a single atomic reveal so nobody can peek or late-edit. Menu data is a static JSON blob for v1.

## v1 scope
- 4 players, one hard-coded menu, exactly one round (one Diner)
- 10 chips, spread-and-lock, contrarian pari-mutuel payout
- TV: menu grid + reveal animation + one payout scoreboard

## Out of scope
- Rotating every player through Diner; multi-round match scoring
- Custom/scraped menus, images, dietary filters
- Odds display, live line movement, side bets

## Risks & unknowns
- Does a menu carry enough "readable personality" per person, or is it random? (Pick opinionated menus.)
- Contrarian payout math must feel fair, not swingy-random.
- Diner has no real decision tension — may need a small "be honest" nudge.

## Done means
Four phones join via room code, one is Diner, three place hidden chip bets, all lock, and the TV reveals the Diner's real order plus a correct contrarian pari-mutuel payout — with no phone ever able to see another's bet or the pick before reveal.
