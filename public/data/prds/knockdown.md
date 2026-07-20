## Overview
Knockdown is a 3-6 player concurrent-room party game built around a Dutch (descending-price) auction — the chicken-game of auctions. For groups who like a fast nerve-test with a satisfying reveal, no math homework, and a lot of table-wide groaning.

## Problem
A real Dutch auction is thrilling but a nightmare in person: someone has to call falling prices aloud, everyone tracks their own secret cash on scraps of paper, and 'who valued this lot at what' is impossible to keep honest. The tension — *do I buy now or wait one tick?* — drowns in bookkeeping. Private phone state dissolves all of it.

## How it works
One lot at a time (a silly item: 'a lightly-used karaoke machine', 'half a stapler'). The **host TV** shows a big price counting DOWN from a high number, tick by tick, plus who has bought which past lots and everyone's remaining cash — *but never anyone's private valuations.*

Each **phone shows privately**: your secret budget (say 100 coins, spent across the game), your secret personal valuation of *this* lot (different for every player — the machine is worth 62 to you, who knows to them), and one giant **BUY** button. Tap BUY and you instantly win the lot at the current displayed price; the clock freezes and reveals the sale.

The squeeze: you want to wait so the price drops below your valuation for a fat margin — but the first finger to move wins, and you can't see anyone else's valuation or nerve. Buy at 70 when your worth was 62 and you took a loss; wait for 40 and watch a neighbor snipe it at 55. After 3-4 lots, highest total profit (valuation minus price paid, summed) wins. A quick post-round reveal shows everyone's hidden valuations — the 'you paid 68 for a thing you valued at 30?!' moment.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{players[], lots[], currentLot, price, phase}`, `Player{id, budget, valuations{lotId->int}, buys[]}`. The server owns the descending clock and ticks price on a fixed interval, broadcasting `price` to all. The **genuinely hard part is fair first-tap arbitration**: BUY taps race over the network, so the server timestamps by *server receipt order*, not client clock, and locks the lot atomically on the first valid message; late taps get a 'too slow' bounce. Valuations are generated server-side and sent only to their owner — never to the host — so the TV physically cannot leak them. Tick cadence (~1 price drop / 400ms) is tuned so human reaction time matters but lag doesn't decide winners; the server can pause the clock a beat after each buy to absorb jitter.

## v1 scope
- 3 players, one shared room code
- Exactly ONE lot, one descending clock
- Fixed budget, server-generated private valuations
- First-tap-wins arbitration + a single reveal screen

## Out of scope
- Multiple lots / full 4-lot game
- Reserve prices, minimum bids, re-auctions
- Bluff/taunt chat, avatars, sound design
- Persistent scores across games

## Risks & unknowns
- Network latency fairness: does receipt-order feel just? Needs playtest with real phones on real wifi.
- Tick speed: too fast = luck, too slow = boring. Must tune.
- With only one lot, is one nerve-moment enough fun, or does it need 3 to build a read on opponents?

## Done means
Three phones join via code; TV counts a price down from 100; each phone shows a distinct private valuation and budget; the first phone to tap BUY freezes the clock and is declared winner at that exact price; a reveal screen shows all three hidden valuations and the buyer's profit/loss.
