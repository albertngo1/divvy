## Overview
Wilt is a 3-5 player real-time Dutch-auction party game. You're wholesale florists at the dawn market; lots come up on the big screen and the price ticks DOWN by the second. Tap BUY to snap the current lot at the current price — but each florist has different secret clients (private valuations) and a different secret budget. For auction-game fans who find hand-raising, number-calling, and hidden-money bookkeeping tedious.

## Problem
Dutch auctions are thrilling but need a live auctioneer chanting descending prices, and they're impossible to run honestly in person with hidden budgets and private valuations — everyone can see your cash, and human price-calling is slow and error-prone. The core tension (snap now or risk a rival sniping?) demands a precise shared clock PLUS private per-player value that only phones can hold at once.

## How it works
Host screen: the current lot ("40 stems, peonies"), a big price counter falling ~1 unit every 0.4s, and a market log of past sales. Each phone privately shows your remaining cash, your secret valuation for THIS lot (worth to your client — different for everyone), and one giant BUY button. As the price falls, each player privately decides the instant to slam BUY. First tap wins the lot at that moment's price; the server timestamps and resolves ties by earliest arrival. You want to buy just above where a rival would — snap too early and you overpay against your private value; wait and someone grabs it first. Profit = your valuation − price paid, hidden until the end. After 3 lots, phones flip up their ledgers; highest total profit wins.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: Room{players:{cash, profit}, lots:[{id, startPrice, rate, valuations: Map<player,int>}], currentLot, startTimestamp}. The clock is server-authoritative: server broadcasts lot start with startPrice, decrement rate, and a synced startTimestamp; each client renders the descending price locally against server time for smoothness, but the BUY decision is resolved server-side. Hard part: fair real-time resolution under variable phone latency — a BUY carries the client's displayed price, but the server recomputes the authoritative price from receipt time (with a small latency-compensation window) and rejects losers, so nobody wins purely on clock skew. Private valuations are pushed only to their owner.

## v1 scope
- 3 players, 3 lots, one market
- Fixed hardcoded valuations + equal starting budgets
- Server-clock price with latency-compensated first-tap resolution
- End reveal of ledgers + winner

## Out of scope
- Selling/reselling, variable budgets, reserve prices, 4-5 players, reconnect, sound, animation beyond the counter.

## Risks & unknowns
- Latency fairness: sub-200ms resolution across phones is make-or-break and needs a clock-sync handshake. Whether one 3-lot market is long enough to build read-your-rivals tension. Fat-finger accidental buys with no undo.

## Done means
3 phones join, each sees only its own budget + private valuation, the host price counter descends in sync across all devices, the first BUY tap wins the lot at the server-authoritative price with ties resolved correctly, and after 3 lots each phone reveals a correct profit ledger with a declared winner.
