## Overview
A real-time descending-price (Dutch) auction party game for 3–5 players. The host TV is the auction house; every phone is a private bidder's paddle that secretly tells you how much *this particular lot* is worth to you — a number no one else can see.

## Problem
Dutch auctions are thrilling in theory but a slog in person: someone has to play auctioneer and chant descending prices, everyone stares waiting to shout, and there's no clean way to hand each player a *different secret valuation* without a fistful of hidden cards per lot. The tension — "do I grab it now or risk a snipe?" — gets buried in bookkeeping.

## How it works
A round is 3 lots auctioned one at a time (e.g. "a slightly haunted lamp"). For each lot the host TV shows the lot art and a big price counting DOWN from 100 coins, one tick per ~0.4s. Each phone **privately** shows: (a) YOUR secret valuation of *this* lot — different for every player, tuned so someone values it high and someone low; and (b) your remaining bank (start 100). One button: **BUY NOW**. The first phone to tap wins the lot at the currently displayed price, paid from bank. Your score for the lot = your private valuation − price paid. So you want to snipe just above where a rival would break — but wait too long and someone grabs it; if nobody buys before 0 it's free and worthless. The private valuation is the whole game: you know it's worth 62 to *you*, but not whether it's worth 20 to everyone else (you could've waited) or 80 (buy now!). The host screen shows only the price and who bought — never valuations. After 3 lots, the host reveals everyone's hidden numbers as the payoff and the comedy.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object). Model: `Room{code, players[], lots[], phase, currentLot, price, tickRate}`, `Player{id, name, bank, secretValuations[perLot], captured}`. The server owns the price tick (authoritative countdown) and broadcasts price each tick. The **first** BUY the server receives locks the lot; server-receipt timestamp resolves races and later taps are rejected. Genuinely hard part: fair race resolution under variable phone latency — timestamp on server arrival, show "SOLD" only after server ack, and add a ~150ms guard so near-simultaneous taps settle by arrival order. Valuations are generated server-side and pushed only down each owner's socket.

## v1 scope
- 3 players, one round, 3 lots
- Hand-tuned valuation tables with dramatically overlapping ranges
- One BUY button, linear descending clock
- Host reveal screen at the end

## Out of scope
- Multiple rounds, banks carrying over, persistent scores
- Reserve prices, multi-unit lots, custom lot decks
- Avatars, sound beyond a tick

## Risks & unknowns
- Latency fairness on tap races (the core risk)
- Whether hidden valuations create enough "should I wait?" tension at only 3 players
- Awkward ties when a lot leaves a player broke

## Done means
3 phones join a host room, each sees a *different* private valuation, the clock descends, the first tap server-resolves as SOLD at that price, banks decrement, and after 3 lots the host reveals all valuations and declares a winner — with no valuation ever visible on the host screen or any other phone.
