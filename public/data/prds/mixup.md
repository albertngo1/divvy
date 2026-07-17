## Overview
A 1v1 fighting-game duel for 2-8 (winner-stays-on) that steals the *yomi* — the read, the guess, the 50/50 "mixup" — from fighting games and drops the execution barrier entirely. Two phones commit moves in secret; the host TV is the arena that resolves the clash.

## Problem
Fighting games are the original couch party game, but they demand two gamepads, shared-screen real estate, and a brutal execution skill gap that benches newcomers. The *actual* fun for most players is the psychological layer: baiting, reading habits, committing to a guess. That layer survives fine as blind simultaneous commits — and it's inherently private, so it can't be a pass-one-phone game.

## How it works
Two players duel; everyone else is on deck. **Pre-fight draft (roguelike):** each phone privately shows 6 random move-cards; you keep 3. Your opponent never sees your kit — deducing it over the match is half the game.

Each **exchange**: both players privately pick one of their 3 moves and secretly lock it. Your intended pick shows only on *your* phone until both are committed. When both lock, the host TV plays a 2-second animated clash and updates the health bars.

Resolution triangle: **Strike beats Throw, Throw beats Block, Block beats Strike.** Strike-vs-Strike: the move with higher startup frames (printed on the card) loses. Because kits are asymmetric and hidden, a "safe" habit becomes readable and punishable over ~5 exchanges.

Private per phone: your drafted kit, your locked pick (pre-reveal). Shared on TV: health bars, the clash animation, the running move log. Load-bearing: simultaneous *secret* commit can't exist on one shared phone, and each player's private kit is hidden information the opponent must read.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object; same-room LAN via Tailscale Serve). Data model: `Match { p1, p2, kits{pid->[moveId]}, hp{}, pending{pid->moveId|null}, log[] }`. Commit-reveal: the server buffers `pending` picks and reveals *only* when both are locked — no client can peek at the opponent's choice. Hardest part: airtight simultaneity and no take-backs (server-timestamped lock; picks freeze the instant the second player commits) plus a TV clash animation cleanly synced to the reveal event.

## v1 scope
- 2 players, one duel.
- Draft 6 → keep 3, no meter/supers.
- Pure Strike/Throw/Block triangle + frame tiebreak.
- 3 HP each, clean hit = 1 damage, first to 2 KOs.

## Out of scope
- Super meter, combos/juggles, movement & spacing.
- Bracket UI, spectator betting, 3+ card kits.
- Internet netcode (same-room only).

## Risks & unknowns
- Does it read as deeper than rock-paper-scissors? The frame tiebreak + hidden asymmetric kits should add texture, but casuals may feel it's pure guessing.
- Animation production cost for readable clashes.
- On-deck spectators getting bored between rotations.

## Done means
Two players each draft a private 3-move kit, play blind-commit exchanges resolved on the TV, one reaches 2 KOs, and at no point could either see the other's pick before the mutual lock.
