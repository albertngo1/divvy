## Overview
House Line is a 3-6 player concurrent-room game that turns the dead time of reading a menu and waiting for someone to order into a private prediction market. One player is the **Diner**; the rest are **Regulars** wagering on what the Diner will choose. It's for a group at a table (or couch) who'd otherwise be passively scrolling a menu.

## Problem
Watching a friend agonize over a menu is pure downtime. Everyone secretly thinks they know what their friend will order — House Line makes them put a (fake) bankroll where their mouth is, and rewards actually knowing your people.

## How it works
The **host TV** shows a curated ~8-item menu (quirky dish names + descriptions) and, later, live payouts. Nothing secret lives on the TV.

Each **phone** is fully private and asymmetric:
- The **Diner's** phone shows the same menu with a *Lock Order* button. Their pick is the ground-truth outcome, hidden until reveal.
- Each **Regular's** phone shows: (a) a private bankroll (say 100 chips), (b) **personalized odds** on each dish that differ per player — the "house" whispers a different line to everyone, so long odds on the salad might be a trap only you took, and (c) **one secret insider tip** — a true constraint about the Diner tonight ("they're skipping red meat," "they always copy whoever ordered last time," "they hate cilantro"). Regulars place simultaneous blind bets across dishes.

On reveal, the TV flips the Diner's pick face-up and animates payouts = stake × your private odds for winning bets. The tension: your tip narrows the field, but your odds tempt you off it — and you never know how many others share your read.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). **Data model:** `Room{code, phase, menu[8], dinerId}`, `Player{id, role, bankroll, oddsTable[8], tip, bets[8], locked}`. Odds tables and tips are generated server-side from a hidden fairness model so payouts across the room roughly net to zero. **Sync:** phases (`lobby → betting → locked → reveal`) broadcast from the server; only aggregate/nothing is pushed to the TV during betting to preserve secrecy. **Hard part:** generating per-player odds + tips that are genuinely divergent yet fair (no player is structurally doomed), and settling payouts atomically at reveal.

## v1 scope
- Exactly 4 players (1 Diner, 3 Regulars), one hand-authored menu, one round.
- Fixed hand-tuned per-player odds + tips (no live model).
- One bet lock, one reveal, chip payout leaderboard.

## Out of scope
- Multiple courses/rounds, real restaurant menu import, persistent bankrolls, a live odds engine, animations beyond a payout tick.

## Risks & unknowns
- Divergent odds may feel arbitrary rather than clever without good tuning.
- The Diner might pick perversely to spite bettors (feature or bug?).
- Fairness of asymmetric lines is easy to get subtly wrong.

## Done means
4 phones join, 3 Regulars each see distinct odds + a distinct tip and lock blind bets, the Diner's hidden pick reveals on the TV, and payouts settle correctly per each bettor's private odds.
