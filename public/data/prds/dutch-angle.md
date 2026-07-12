## Overview
Dutch Angle is a 3–5 player party auction built on the descending-price (Dutch) clock. The shared TV runs the clock and shows the current absurd lot; every phone is a private paddle holding a secret budget and a secret desire nobody else can see. It's for friend groups who love the sweaty chicken-game of an auction but hate the person-with-a-gavel bookkeeping.

## Problem
Dutch auctions are the most thrilling auction format and the most annoying to run at a table: someone has to chant descending prices, watch five hands at once, and adjudicate who slapped the table first. And the core tension — *do I secretly want this more than they do?* — collapses the instant valuations are spoken aloud. Private state fixes both.

## How it works
The TV shows one lot ("Haunted Lava Lamp," "The Last Aux Cord") and a giant number ticking down from $100 toward $0 over ~8 seconds. Each PHONE privately shows three things nobody else sees: your remaining bank ($250 for the game), your secret valuation of *this* lot (you alone know you'd pay $80 for the lamp), and one huge GRAB button. First to grab wins and pays the current clock price. Grab too early and you overpay; wait and someone snipes it; let it hit $0 and it goes unsold — publicly embarrassing on the TV feed. The shared screen shows only the clock, the lot, and after resolution the winner + price. Over 3 lots you're spending a hidden budget against opponents whose wants you can only guess. The reveal at the end shows everyone's secret valuations vs. what they actually paid — the biggest overpay wins a "Sucker" ribbon.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{lots[], currentLotId, clockStartTs, players{id, bank, valuations{lotId:int}}}`. The clock is a pure function of server time — clients render `price = f(now - clockStartTs)` so no per-tick broadcast is needed. GRAB sends `{lotId, clientTs}`; the SERVER stamps receive-time and the first message wins, ignoring client clocks entirely. The genuinely hard part is latency-fair first-touch: a player on slow wifi sees a stale (higher) price and grabs late. v1 accepts server-receive-order and displays each grabber's *server* price; a later version can compensate by RTT-estimating each phone and back-dating the effective price.

## v1 scope
- 3 players, 3 lots, exactly one round
- Fixed lot list + fixed per-player secret valuations (seeded, not generated)
- Descending clock, GRAB, server-order resolution, unsold-at-$0
- End screen: valuations vs. paid, "Sucker" ribbon

## Out of scope
- Matchmaking, accounts, rematch flow
- Generated/AI lot art or valuations
- RTT latency compensation
- More than 5 players

## Risks & unknowns
- Latency unfairness could feel cheaty; needs playtesting on real phones over the same wifi.
- Secret valuations must matter enough that the chicken-game bites — tune spread so grabbing early is genuinely tempting.

## Done means
Three phones join a room code, a lot clock counts down on the TV, the first phone to tap GRAB wins at the shown server price, its bank decrements, three lots resolve in sequence, and the end screen correctly reveals each player's hidden valuation next to what they paid.
