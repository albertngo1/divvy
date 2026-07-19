## Overview
Taper is a real-time candle-auction party game for 3–6 players: a shared host TV plus each player's phone as a private bidding paddle. One lot per round is sold in an open, ascending auction — but the auction ends at a moment nobody can see coming.

## Problem
Candle auctions (bidding continues until a candle randomly gutters out) are one of the most thrilling auction formats, but in person they collapse under logistics: you need an auctioneer, everyone shouts over each other, someone has to count chips, and the hidden timer has to be physically concealed and honestly run. The delicious tension — do I lead now or wait? — gets buried in bookkeeping and crosstalk.

## How it works
The host TV shows the lot (a described "relic" with public flavor text), the current high bid, the current high bidder's name, and an animated candle whose true remaining burn is HIDDEN — the server snuffs it at a random time inside a window. Each phone PRIVATELY shows: your secret valuation of this lot (drawn per-player — it might be worth 14 to you but 8 to your neighbor), your remaining budget, and a big "+1 / +2 raise" control. Public = high bid + bidder. Private = your value + budget. Tap to seize the lead. When the candle snuffs, the current high bidder pays their bid and scores (secret value − price paid); overpay past your private value and you go negative. Everyone else scores 0. The hidden end punishes both greedy early leads and last-second snipes.

Why phones are load-bearing: every phone holds a DIFFERENT secret valuation and budget, simultaneously, and raises arrive in real time. Passing one phone around would leak values and kill the live bidding.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object over Tailscale Serve). Data model: Room{lot, highBid, highBidderId, candleDeadline (server-only), phase}; Player{id, name, secretValue, budget}. Sync: clients send RAISE intents; the server validates (sufficient budget, strictly monotonic bid), broadcasts the new high bid to all, and keeps the candle burning; at candleDeadline it locks, reveals valuations, and scores. Hard part: fair real-time raise ordering under phone latency — the server is sole arbiter, timestamps intents on arrival, and grants the first valid raise to a price. A 300ms "going once" freeze on each new lead reduces race unfairness. The deadline MUST live server-side so no client can peek and snipe.

## v1 scope
- 3 players, ONE lot, one round
- Fixed private-value distribution, +1/+2 buttons only
- Text-only lot (no art)
- Reveal + single-round score screen on the TV

## Out of scope
- Multi-lot rounds, budgets carried across rounds
- Proxy/auto-bidding, lot artwork, spectators

## Risks & unknowns
Near-simultaneous raises can feel unfair under latency (mitigated by server arbitration + freeze). With very few players it may be swingy. Players might all snipe — the hidden end is the deliberate counter.

## Done means
Three phones join one room; each shows a distinct private valuation; raises propagate to the TV in <500ms; the candle snuffs at a server-hidden time; the winner is charged their bid; and the score (value − price) renders for all players.
