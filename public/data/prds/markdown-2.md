## Overview
Markdown is a 3-6 player concurrent-room party game that turns the descending-price Dutch auction — a mechanic that in person devolves into everyone hovering hands over the table shouting "MINE!" and arguing about who tapped first — into a silent, exact, nerve-wracking clock. The host TV is the auction house; each phone is a private appraiser with a secret client.

## Problem
Dutch auctions are thrilling in theory (price falls, you must claim before a rival but as late as possible) and miserable in practice: simultaneous grabbing has no clean tiebreak, and hidden valuations mean players fumble with face-down cards. The tension — *do I value this more than they do?* — gets buried under bookkeeping and shouting.

## How it works
The host shows ONE lot at a time: a public card with visible attributes (e.g. era: 1970s, color: teal, category: furniture) and a big price counting DOWN from 100, one coin per second.

PRIVATELY, each phone shows: (1) your secret **commission** — a client who pays a bonus for certain attributes ("my client loves teal + hates 1970s"), from which your phone computes and displays *your* exact valuation of this lot; (2) your remaining coin balance; (3) one giant CLAIM button. Crucially you see only YOUR valuation — never anyone else's, and never who else is still hovering.

The first phone to tap CLAIM buys the lot at the current displayed price. You score (your valuation − price paid) and spend the coins. Everyone else gets nothing this lot. The host reveals the winner and their price with a satisfying gavel; valuations stay secret until end-of-game.

The agony: your phone says the lot is worth 60 to you. At price 80 it's a loss. At 45 it's a steal — but will someone whose client adores it grab at 55? You're pricing a rival you can't see. Some lots are duds worth *negative* to you; you'd love a rival to overpay for one.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{lots[], currentLotIndex, price, tickStartTs}`, `Player{id, coins, commission, score}`. The server owns the price clock and broadcasts ticks; it does NOT trust client-rendered prices. On CLAIM, the client sends `{lotId}` and the server stamps the authoritative price from `tickStartTs + serverNow`, resolving the first arrival by receipt timestamp. The genuinely hard part is **claim fairness under network jitter**: two players tapping within ~80ms must resolve deterministically. Mitigation: server-side arrival ordering plus a short (150ms) claim window that locks the clock the instant the first packet lands, then admits the earliest by server-received time; ties (rare) split to lower player-id with a shown coin-flip. Valuations are computed client-side from server-dealt commissions but never transmitted until reveal.

## v1 scope
- 3 players, one game of 3 lots
- Fixed 12-card lot deck, 3 hand-authored commission cards
- Descending clock 100→0 at 1/sec; single CLAIM resolution
- Host shows lot + clock + gavel reveal; end screen ranks by total score

## Out of scope
- Multi-round / persistent economy across games
- Bluffing signals, re-bids, or partial claims
- Procedural lot/commission generation
- Reconnect/spectator polish

## Risks & unknowns
- Sub-100ms claim fairness over consumer wifi — the core trust question
- Whether hidden valuations create enough read-your-rival tension with only 3 players
- Balancing commissions so no lot is universally worthless (dead clock)

## Done means
Three phones join via room code; the host clock ticks down on a lot; the first CLAIM tap locks the price server-side within one tick, credits (valuation − price), and after 3 lots the TV shows a correct score ranking with all commissions revealed.
