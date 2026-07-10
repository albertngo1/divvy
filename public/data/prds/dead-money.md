## Overview
A sealed **all-pay** auction party game for 3-5 players — phones as private bidding paddles. The twist on the standard "highest bid wins" auction is cruelty: every bidder pays what they bid, winner or not. Your bid slider and your budget live only on your phone.

## Problem
Auctions are a great tabletop mechanic ruined by live logistics: scribbling sealed bids on scraps, the reveal ceremony, and a banker manually tracking everyone's dwindling money. And most in-person auctions are the boring kind where only the winner pays. The genuinely thrilling variant — all-pay, where a losing bid is *dead money* gone forever — is unplayable by hand because the bookkeeping and simultaneous secrecy break down. Phones fix exactly that.

## How it works
The host TV shows a lineup of 3 **lots**, each with a printed point value. For each lot, every phone privately shows: your **secret remaining budget**, a **bid slider** (0 to budget), and a **lock** button. Nobody can see anyone else's bid or budget. When all players lock, the host does a synchronized card-flip reveal of every bid at once. The highest bidder gains the lot's value; then **every** player's bid is deducted from their budget — winners and losers alike. Ties split the value. After 3 lots, final score = value won + leftover budget, so every coin bid is an opportunity cost you may never recover.

Privately per phone: budget, slider, lock state. Shared screen: the lots, the dramatic simultaneous reveal, the running standings.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `room {phase, lots:[{value,winnerId}], players:[{id,name,budget,currentBid,locked}]}`. Sync strategy: phones stream slider changes to the server, but the server **withholds** all bids until every player is locked, then flips `phase` to `reveal` and broadcasts the full bid set at once. The genuinely hard part is reveal integrity — guaranteeing no phone can peek another's bid before the lock barrier. The server is the sole authority; it simply never includes others' `currentBid` in any pre-reveal message. A per-lot timer auto-locks a stalling player at their current slider value.

## v1 scope
- 3 players, 3 fixed lots, one game
- Sealed all-pay resolution, simultaneous reveal, final standings
- Fixed starting budget, no accounts

## Out of scope
- Multiple rounds, custom or randomized lots
- Reraise-on-tie mechanics (v1 just splits)
- Fancy animation beyond the flip, reconnection polish

## Risks & unknowns
All-pay can feel punishing or confusing to newcomers — the reveal needs a crisp "everyone pays!" beat to teach the rule viscerally. Silent slider-bidding may lack tension without a live "someone locked" indicator. Budget-vs-value balance needs playtesting so bidding zero is never dominant.

## Done means
Three phones join by room code, each privately bids on 3 lots, all-pay deduction resolves budgets correctly, the TV shows a synchronized reveal and correct final standings — and no phone can see another player's bid before the reveal barrier.
