## Overview
Fire Sale is a 3-5 player concurrent-room party game built on the Dutch (descending-price) auction — the fastest, meanest auction format, and a nightmare to run by hand. The shared TV is the auction house; each phone is a private paddle that knows your money and your secrets. For groups who like a little economic bloodsport with their party night.

## Problem
Running a Dutch auction in person means one person droning "...forty... thirty-five... thirty..." while everyone watches everyone else's face for a flinch. Bids collide, someone always yells at the same instant, and change-making is tedious. The whole thrill — snap decisions under a falling number — gets buried in bookkeeping and "wait, who said it first?"

## How it works
Eight lots go up one at a time. For each lot, the **host screen** shows the item art and a big price COUNTING DOWN (say $80 → $0 over ~12s). The first player to tap **BUY** wins it at the current displayed price; server timestamp (RTT-normalized) breaks near-ties.

Privately, each **phone** shows three things nobody else sees: (1) your remaining budget, (2) your two secret "cravings" — lot categories that score DOUBLE for you at the end, and (3) a live BUY button that only lights up once you can afford the current price. Because a jade cat might be worth 2× to me and nothing to you, the same falling number means different things on every phone. Snipe too early and you overpay; wait for the flinch and someone snipes first. At the end, the host reveals everyone's hoard and tallies value including private doubles — the winner is whoever read the room best while hiding their own tells.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). The DO owns the canonical clock: it broadcasts `priceTick` at ~10Hz per lot. **The genuinely hard part is fair first-tap arbitration** across phones with different latencies: clients send `buy(lotId)` immediately on tap; server records receipt time, subtracts each client's rolling median RTT/2 to estimate true tap time, and awards to the earliest within a 150ms coalescing window. Data model: `Lot{id,category,basePrice}`, `Player{id,budget,cravings[2],hoard[]}`, `Auction{currentLotId,priceFloorAt}`. Price is derived server-side from `now - lotStartAt`, never trusted from clients.

## v1 scope
- 3 players, one auction of **4 lots**.
- One descending clock; single BUY button per phone.
- Two secret cravings per player, fixed at start.
- Host shows price + final hoard tally. That's it.

## Out of scope
- Multiple rounds, re-auctioning unsold lots, budgets carrying over.
- Bidding *up*, proxy bids, or bluff-buy fakeouts.
- Accounts, persistence, spectators.

## Risks & unknowns
- Latency fairness: if arbitration feels unfair, the whole game dies. Needs real multi-device testing on home wifi.
- Balance: cravings must matter enough to bluff over but not dominate.
- A 12s descent may be too long (boring) or too short (panic) — tune.

## Done means
On three real phones over one wifi, four lots descend, each is awarded to exactly one player at the displayed price with no double-award and no perceived unfairness, budgets deplete correctly, and the host shows a final tally where at least one craving-double flips the winner.
