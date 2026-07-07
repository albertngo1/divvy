## Overview
Order Up is a warm, social concurrent-room game for 3–5 friends. It takes the classic passive-consume ritual — reading a menu together — and turns it into a private betting market where the horses are your friends' appetites.

## Problem
Groups read menus together all the time and it's pure dead air: everyone silently scrolls their own choice, then announces it. There's a hidden game right there — you *think* you know what your friends will order — but nothing forces you to commit to that guess or pays you for being right. Order Up monetizes 'oh, you're SO getting the fries.'

## How it works
The host TV shows a themed menu — a diner, ~6 lovingly described items — plus the chip standings. Two private phases per phone:

**Phase 1 — Your order (secret):** each phone privately picks the ONE item you'd genuinely order. This is your true, hidden preference; it's never shown until reveal.

**Phase 2 — The book (secret):** for every OTHER player, you privately place chips predicting their pick. Your phone shows the menu with each opponent as a tab; drag chips onto items, spreading a hedge or going all-in. Everyone bets simultaneously; nothing is visible to others.

**Reveal:** the host flips one player's real order at a time. Phones light up payouts — correct predictions cash out, and contrarian correct guesses (few others backed that item) pay more. Highest chips after the last reveal wins.

The per-phone architecture is the whole point: each real order is a simultaneous private secret, and every prediction book is hidden. A single passed-around phone literally cannot collect 4 secret orders without the table seeing them — the asymmetric private state IS the game.

## Technical approach
Authoritative WebSocket server (Socket.IO over Tailscale Serve, or a Durable Object) holds `{ menu[], players[], phase, chips{} }`. Secrets live server-side only: `Order{ playerId, itemId }` and `Bet{ fromPlayer, aboutPlayer, itemId, stake }`. Phones submit and receive only their own private state plus public standings; the server never echoes another player's order or book until the reveal event for that player fires. Sync is phase-gated: server barriers advance only when all phones have submitted (with a timeout auto-locking stragglers). Hard part is leak-proofing — the reveal must be server-driven so no client ever caches an opponent's secret early — plus payout math for multi-item hedged bets and contrarian odds weighting (payout scaled by inverse of chips backing that item).

## v1 scope
- One diner menu, 6 items, 3 players
- One order each, one prediction book, single reveal pass
- Flat + simple contrarian bonus payout, one round
- Host tab + phone PWA, room-code join

## Out of scope
- Multiple menus/cuisines, custom menu upload
- Side bets (who tips most, who splits an app), multi-round nights
- Any real ordering / delivery integration

## Risks & unknowns
- Fun depends on players knowing each other well enough to have a read; strangers just guess randomly.
- With 6 items and flat payouts, luck may dominate skill — contrarian weighting needs tuning.
- Menu writing has to be evocative or the fantasy dies.

## Done means
Three phones join, each secretly picks an order and privately bets chips on the other two, no secret leaks before its reveal, the TV flips orders one by one, payouts (including the contrarian bonus) compute correctly, and a chip leader is crowned.
