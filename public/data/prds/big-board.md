## Overview
Big Board is a snake-draft party game for 3-5 players who love the pick-and-pass of Sushi Go or a fantasy-sports draft but hate the physical shuffling, waiting, and secret-scoring bookkeeping. The host TV is the shared draft board; each phone is a private appraiser who values the loot differently than everyone else.

## Problem
Drafting in person means physical cards, slow one-at-a-time passing, and — the moment you add hidden scoring objectives — constant "wait, what's that worth to you?" bookkeeping. Worse, you can't actually keep valuations secret when cards sit face-up on the table. The tension of drafting *against unknown valuations* is impossible to run by hand.

## How it works
The host shows a board of 9 goofy lots (Rubber Duck, Haunted Lamp, Half a Sandwich…), each stamped with a PUBLIC baseline market price everyone sees. Each phone PRIVATELY overlays *your* personal premium/discount on every lot: the Duck reads "3" on the TV but "+5 → worth 8 to YOU" only on your screen. Snake order (A-B-C-C-B-A…). On your turn you tap a lot to claim it; the host removes it and everyone sees WHAT you took — but never WHY, your values stay hidden. Off-turn your phone shows your private running total and the personal value of every lot still on the board, so you scheme and try to read opponents from what they grab. After 9 picks the host tallies each player's private valuations of their own haul and crowns the highest. Bonus reveal: a heatmap of everyone's secret values exposes the steals and the blunders.

**Private (phone):** your value overlay on every lot, your running total, remaining-lot personal values. **Shared (TV):** the board, baseline prices, who-took-what, turn order, final scores + reveal heatmap.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `Lot{id,name,basePrice}`, `Player{id, valuationMap: lotId→premium, drafted[]}`, `GameState{order,currentPick,board}`. At start the server seeds each player a random, roughly zero-sum premium vector so totals stay comparable. On a claim it validates turn + availability, moves the lot, broadcasts the public delta, and pushes the new total ONLY to its owner. The genuinely hard part isn't latency (it's turn-gated, not twitch) — it's fairness and secrecy: balancing random valuation vectors so nobody is handed a runaway board, and guaranteeing a client never receives another player's vector until the final reveal.

## v1 scope
- Exactly 3 players, 9 text-only lots, one snake draft (3 picks each)
- Random balanced private value vectors, room-code join
- Single end-of-game tally + reveal heatmap

## Out of scope
- Multiple rounds, item synergies/set bonuses, explicit denial bonuses, animations, 4-5 player tuning, reconnection grace

## Risks & unknowns
- With fully hidden values, denial play can feel like blind luck for first-timers — the "you stole X from me" reveal must carry the payoff.
- 3 players may not create enough contention; 4 might be the real floor.
- Auto-balancing random vectors to avoid a lopsided board.

## Done means
3 phones join via room code, each sees a *different* private overlay on the same 9 lots, the snake draft completes with correct turn gating, no client ever receives another's valuations before reveal, and the host shows correct per-player totals plus a winner.
