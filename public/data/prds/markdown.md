## Overview
Markdown is a Dutch (descending-price) auction party game for 3–5 people around one TV. Each round the host screen puts a single silly lot under a falling price clock; every phone privately holds that player's secret maximum valuation for it. First to slap BUY wins at the current price. It's for groups who love the nerve of "going, going—" but hate the labor of running an auction by hand.

## Problem
In person, a descending auction needs a human auctioneer chanting numbers while everyone watches a shared clock and secretly holds their own limit. The secret-limit part is impossible to enforce on one shared board, and manual auctioneering is slow and error-prone. The whole delicious tension — do I pounce now, or hold for a cheaper price and risk someone grabbing it first? — only exists if nobody can see anyone else's limit. A single passed-around phone can't hold everyone's private threshold at once, and can't let all players watch the same falling clock simultaneously.

## How it works
The host TV shows the lot (a procedurally silly item like "a mildly cursed label maker"), one big number ticking DOWN from a high start (e.g. $100 → $0 over ~15s), and a row of player avatars. Each phone PRIVATELY shows: your secret valuation for THIS lot (say $63, randomized, different per player), your remaining budget, and one giant BUY button. As the number falls, each player decides alone when to jump. The first BUY the server accepts freezes the clock on every screen and awards the lot at the shown price. Your profit = valuation − price paid, shown privately, tallied on reveal. If price hits $0 unsold, the lot passes. You never see others' valuations, so you can't compute their pounce point — you're gambling on nerve.

Private (phone): your valuation, budget, buy button, your profit. Shared (TV): lot art, live descending price, who-won banner.

## Technical approach
Host browser tab + phone PWA clients + authoritative WS server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, players[], phase, lot{id, startPrice, floor, ratePerMs}, clockStartTs, soldTo, soldPrice}; Player{id, name, valuation, budget}. Sync: the server owns the clock and broadcasts clockStartTs + rate once; every client renders price locally as startPrice − rate·(now − start), so TV and phones agree without per-tick messages. The genuinely hard part is fair first-tap resolution: BUY taps race over the network. The server timestamps by arrival and, for fairness, can subtract each client's measured RTT/2 (a ping handshake at join). Lowest adjusted timestamp wins; it must lock instantly and reject late taps to prevent a double-sell.

## v1 scope
- One lot, one round, 3 players
- Fixed 15s descending clock
- Valuations pre-randomized server-side
- Lot names from a small hardcoded list (no art)
- First-BUY-wins by naive server-arrival order (skip RTT compensation)
- Private profit shown at end

## Out of scope
Multi-lot budgets across rounds, RTT fairness compensation, item artwork, reserve prices, spectators, reconnect handling.

## Risks & unknowns
Network latency making first-tap feel unfair; whether a single 15s lot is enough fun or feels anticlimactic; tuning valuations so the right pounce moment isn't obvious; clock drift between TV and phones.

## Done means
Three phones join a room code; the TV shows a falling price; each phone shows a different private valuation; the first phone to tap BUY freezes the price on all screens within ~150ms and is declared winner with a correct private profit number.
