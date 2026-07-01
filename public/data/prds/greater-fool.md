## Overview
An online social-deduction party game (3–8 players) built on a live economic bubble. Everyone trades one silly worthless asset; secretly one or two players are Insiders who know exactly when it crashes. For game nights and anyone who read *Memoirs of Extraordinary Popular Delusions* and smugly thought "I'd have sold in time."

## Problem
Every mania story ends with "how did they not see it?" — but you only understand a bubble from inside the FOMO. No game makes you *feel* the greater-fool dynamic socially, the way Among Us makes you feel suspicion.

## How it works
A shared round-based market for one asset ("Dutch Tulip #7"). Each round the price ticks up along a hidden curve. You profit only by selling to another player before the crash — it's zero-sum among the fools. Insiders secretly know the crash round; they win by dumping at the top while talking their book in open chat ("it's different this time, don't sell"). Non-insiders win by smelling the top and exiting first. When the crash lands, everyone still holding is wiped and scores tally. It's Among Us where the task is greed management and the impostor is the one who knows when the music stops.

## Technical approach
Node + WebSocket (or Colyseus) authoritative server holding the true curve and each player's holdings; thin web client (canvas price chart, trade buttons, chat). Data model: `Room {curve:number[], crashRound, players:{cash,holdings,role}}`. Core mechanic simplifies a double auction to instant player-to-player sales at current price, plus a per-game sampled `crashRound`. The genuinely hard part is **balance**: Insiders must not auto-win, and non-insiders need real signal to read — a slow-leaking confidence meter, volume tells, a widening bid-ask as the top nears. Curves seeded from real bubble shapes (South Sea, tulip, dot-com) for flavor.

## v1 scope
- One room, one asset, text chat
- Fixed 8-round curve, 1 Insider
- Buy / sell-to-pool, crash + score screen
- Single shared join link

## Out of scope
- Matchmaking, accounts, voice
- Multiple assets, real order-book depth
- Mobile layout

## Risks & unknowns
Economic balance is fiddly and easy to make one-sided. Needs 4+ humans to sing (cold-start) — mitigate with fast 8-minute rounds and bot fools to fill seats. Chat toxicity risk in open lobbies.

## Done means
Four players in a browser can play a full game to a crash, the Insider's incentives measurably diverge from the fools', and in playtests at least one non-insider wins purely by exiting before the crash.
