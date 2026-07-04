## Overview
The Drop is a live descending-price ("Dutch") auction party game for 3–6 players around a shared screen. The host TV shows a single lot and a price ticking DOWN in real time; each player's phone privately holds how much that lot is secretly worth to them. First to slam BUY wins the lot at the current price — but wait too long and a rival who values it more grabs it first.

## Problem
Dutch auctions are electric in theory and miserable in a living room. One person has to chant falling numbers, everyone shouts over each other, and nobody can hold a private valuation without a hidden bid sheet that grinds the pace to nothing. The nerve-and-timing core — the whole reason the mechanic is fun — gets buried in bookkeeping and arguments about who yelled first.

## How it works
At game start each player is secretly dealt a Buyer persona (e.g. "you hoard RED lots — reds are worth double to you"). Only their phone shows this. A lot appears on the host screen and a price starts high (say 100 coins), ticking down ~2/second with a satisfying clock animation. Privately, each phone shows: your secret valuation of THIS lot, your remaining coins, and a big BUY button. The instant anyone taps BUY the clock freezes, that player pays the current price, and the lot is theirs. Everyone sees who grabbed and at what price — but never each other's valuations. Profit = your private valuation minus price paid. Waiting for a lower price risks losing the lot entirely. Over several lots, most profit wins.

Private vs shared: Shared host screen = lot art, the falling price, balances as bars, who won each lot. Private phone = your secret persona/valuation, your exact coins, the BUY trigger.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room { players[], lots[], currentLot, priceStartMs, priceRate, status }. The price is NOT streamed tick-by-tick — the server broadcasts (startTimestamp, startPrice, rate) once and every client computes currentPrice locally against a server-synced clock, so all screens agree with zero per-tick traffic. The genuinely hard part is fair first-tap arbitration under network jitter: the server resolves authoritatively by computing the price at message-arrival and locking the lot on the first valid BUY; late taps get a "too slow" bounce. A short clock-sync handshake (measure round-trip, offset each client) keeps the displayed price within ~50ms across phones so nobody feels robbed.

## v1 scope
- 1 auction of exactly 3 lots, 4 players
- 3 hand-authored Buyer personas
- Falling-price clock + single BUY button
- Server first-tap arbitration + "too slow" bounce
- Final profit tally screen

## Out of scope
- More lots/personas, multi-round play, coin-economy tuning
- Reserve prices, re-auctions, art beyond the clock
- Reconnect / spectator handling

## Risks & unknowns
- Latency fairness IS the game; if one first-tap feels unfair, trust dies. Prototype clock-sync before anything else.
- Is a lone descending clock tense enough with only 4 players? May need a bot "phantom bid" to force nerve.

## Done means
4 phones join via room code, one 3-lot auction runs, each player sees only their own valuation, the first BUY on each lot wins authoritatively within ~50ms fairness, and a correct profit leaderboard displays at the end.
