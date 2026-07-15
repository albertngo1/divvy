## Overview
Going Twice is a 3–6 player concurrent-room party game about spreading a fixed budget across several simultaneous blind auctions. The host TV is the auction house; each phone is your private paddle and your private wallet. It's for people who love the mind-game of an auction but hate the tedium of chanting bids, tracking who's tapped out, and doing arithmetic in their heads.

## Problem
Blotto-style "split your money across the lots" auctions are delicious in theory and miserable at a real table: you need a trusted banker, everyone has to write bids on scraps and reveal at once without peeking, and someone always miscounts. The hidden-simultaneous-allocation core — the whole point — is exactly what humans are bad at administering.

## How it works
The host TV shows THREE lots (e.g. Lot A, B, C) with public art/labels and a shared budget of $100. Crucially, each phone PRIVATELY shows how many victory points each lot is worth **to that player** — asymmetric valuations, so Lot B might be worth 9 to you and 2 to your neighbor. Nobody sees anyone else's valuations.

Each phone privately drags three sliders to split its $100 across the lots (must total ≤ $100). One synchronized 30-second timer. On reveal, the host resolves each lot: highest bidder wins it and scores their private value; the money is spent regardless (all-pay per lot burns the tension). **Ties win nothing** — both bidders overpaid for zero, the signature sting. The TV animates the reveal lot by lot, dramatically flipping paddles. Highest total score wins the single round.

What's private (phone): your per-lot valuations, your live slider allocation until lock. What's shared (TV): the lots, the reveal, running scores.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ code, phase, lots[3], budget }`, `Player{ id, name, valuations[3], allocation[3], locked, score }`. Sync: phones send throttled `allocation` updates (server clamps to ≤budget) but the host only renders lock状态, never amounts. On timer end or all-locked, server computes winners deterministically and streams a reveal script. The genuinely hard part is trust/simultaneity: allocations must be server-held and never broadcast to other clients until the reveal barrier, or a sniffing player wins. Server is the single source of truth; clients get only their own state plus public phase.

## v1 scope
- 3 players, exactly 3 lots, one round.
- Fixed $100 budget, random integer valuations per player.
- 30s timer, tie = no winner, all-pay burn.
- TV reveal animation + final score screen.

## Out of scope
- Multiple rounds / campaign scoring.
- Reserve prices, minimum bids, proxy bidding.
- Custom art assets; use colored placeholder cards.
- Reconnection grace / mid-round join.

## Risks & unknowns
- Does 3 lots give enough bluff depth, or feel like a coin flip? Needs playtest.
- All-pay may feel punishing to casual players; a "losers get money back" toggle is a fallback.
- Asymmetric valuations could make outcomes feel arbitrary if variance is too high; tune the value range.

## Done means
Three phones join via room code, each sees different private valuations, all secretly allocate, the server resolves ties/winners correctly with no allocation ever leaking pre-reveal, and the TV shows a correct final score.
