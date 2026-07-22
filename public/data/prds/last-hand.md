## Overview
Last Hand is a live ascending-clock ("Japanese") auction for 3–6 people in a room, played on a shared host screen plus one phone each. It turns the slowest, most poker-faced table mechanic — the English shouting-match auction — into a silent, breathless, thumb-on-a-button standoff.

## Problem
In-person ascending auctions are tedious and unfair: they're loud, slow, dominated by whoever shouts fastest, and everyone reads everyone's face. Sealed bids fix the noise but kill the drama. The itch: keep the escalating tension of a live clock, but make each player's nerve genuinely private, so bluffing is about how long you dare to hold — not your poker face.

## How it works
One lot is up (v1: a single "player card"). The host screen shows a price ticking upward — +1 every 0.5s — and a bare count: "🔨 4 still bidding." It never shows *who*.

Each **phone privately shows**: your secret valuation of this lot (e.g. "worth 62 to YOU" — different per player via a hidden need card), your budget, the live price, and one giant **HOLD** button. As long as your thumb is down, you're in. The instant the price passes your comfort, you lift — you're locked out, and your phone quietly says "you're out at 41."

The drama: you cannot see how many fingers are left except the dwindling count, and you can't see whose. Do you release at your true value, or hold three ticks longer to scare the last holdout into folding first? When one finger remains, the clock stops. Winner pays the price at the level the **second-to-last** player released (a natural second-price rule), and scores valuation − price. Highest score wins the round.

The **host screen** shows only the climbing price, the live bidder count, and — at the end — the reveal: who won, the two release levels, and everyone's hidden valuations exposed for the table's groans.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). The **server owns the clock**: it broadcasts `price` on a fixed tick and is the sole timestamp authority. Phones send only `release` events; the server stamps arrival order and records `releaseLevel`. Data model: `Room{ lot, price, phase }`, `Bidder{ id, valuation, budget, holding, releaseLevel }`.

The genuinely hard part is **release-timing fairness under latency**: two players lifting near-simultaneously must resolve deterministically. Server timestamps at receipt, and a 250ms tick keeps human reaction well above jitter; near-ties fall back to server-receipt order, disclosed on reveal. Holding the button when the app is backgrounded must count as a release (visibility API), so nobody wins by pocketing their phone.

## v1 scope
- 3 players, one lot, one round.
- Each phone: private valuation, budget, HOLD button, live price.
- Host: climbing price, bidder count, final reveal.
- Second-price payout + score.

## Out of scope
- Multiple lots / a full auction house.
- Persistent budgets across lots.
- Reserve prices, proxy bids, sound design.

## Risks & unknowns
- Latency near-ties feeling unfair — mitigated by slow tick + transparent tiebreak.
- Is the dwindling count enough drama, or do we need haptic pulses as fingers drop?
- Backgrounded-app cheating; accidental lifts on capacitive screens.

## Done means
Three phones on a table, the price climbs, two players lift at 41 and 58, the third holds; host shows "Won at 58, valuation 62, +4," all three secret valuations revealed — and no player could tell how many fingers remained until the count dropped.
