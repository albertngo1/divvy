## Overview

Corpsing turns the most passive group ritual there is — everyone slumped on a couch watching a funny clip — into a live equities market where the underlying asset is *your friends' composure*. 3–5 players, one host TV playing a short comedy clip, and every phone simultaneously acting as (a) a private trading terminal and (b) a near-field microphone watching only its own owner. "Corpsing" is the theater term for breaking character; here, breaking is the settlement event.

## Problem

Watching something funny with friends is already social, but it's a spectator activity — the only participation is laughing. Existing "bet on the show" games bet on the *content*, which requires authored props per clip and dies the moment you run out of clips. Nobody bets on the room. And the room is the funniest, most unpredictable market available: you already know who is a soft touch and who has an iron face, and you're already trying to make each other break.

## How it works

**Calibration (8s).** The clip's first seconds play. Each phone samples its own mic RMS and computes a personal baseline + noise floor. Nothing but a scalar ever leaves the device.

**Trading (the clip, ~45s).** The clip plays on the TV. Each phone shows PRIVATELY: your chip balance (start 20), a live "heat" bar of your *own* laugh z-score, and a buy row — one tap buys a share in any player, including yourself. Price rises with shares outstanding (`price = 1 + 0.5 × shares`). Your positions are private.

**The host TV shows PUBLICLY:** the clip, plus a tote strip of each player's current share *price* — so the room can see Dana is being heavily bought, but never by whom. That's the whole social engine: you see the crowd leaning on someone and must decide whether to pile on or fade it.

**Settlement.** The first player whose own-mic z-score exceeds their break threshold for 400ms continuously is the winner. Shares in that player pay 3 chips each; everything else expires worthless. **Self-shares pay half** — so buying yourself and then deliberately guffawing is a real but weak strategy, and the market visibly prices in fakery.

**No break by clip end** → all shares refund at 1 chip; the room's stone faces are their own punchline.

## Technical approach

PartyKit / Cloudflare Durable Object per room, authoritative. Model: `Room { phase, clipId, startedAtServerMs, players: {id, name, baselineRms, sigma, chips, positions: Map<playerId, shares>}, book: Map<playerId, sharesOutstanding> }`. Host tab is the only renderer; phones never fetch media.

Phones stream a single float (own-mic z-score) at 10 Hz over WebSocket. The server ticks at 10 Hz, and the genuinely hard part is **the TV's own audio bleeding into every mic** — a laugh track or applause spikes all phones at once and would settle the market on whoever sits nearest the speaker. Fix: common-mode rejection. Each tick, the server computes the median z across all phones and settles on `z_i − median(z)`; a real individual break is differential, room audio is common. Sustained-400ms plus a one-shot latch prevents double-fires. Clock: phones estimate server offset via ping/pong; buy orders are stamped server-side on receipt, so a laggy phone loses the race honestly rather than being retro-filled.

## v1 scope

- 3 players, 1 hard-coded 45-second clip, 1 market, 1 settlement.
- Buy only. No selling, no shorting, no rounds, no rematch.
- Fixed linear pricing, fixed 3-chip payout, self-shares at half.
- Host screen: video + 3 price bars + a winner card.

## Out of scope

Clip library or upload; selling/short positions; multi-round bankroll; laugh *intensity* scoring; video of players; accounts; spectators.

## Risks & unknowns

Mic gain varies wildly across phones — z-scoring against each device's own baseline should absorb it, but a phone in a pocket is deaf. Common-mode rejection may over-subtract when two people break together. The 400ms latch may fire on a cough. Biggest social risk: staring at a trading screen kills the laugh you're betting on — the buy UI must be one thumb-tap, glanceable, never text.

## Done means

3 phones join by QR, a 45s clip plays, each phone buys at least one share invisibly to the others, exactly one player is latched as "broke first" within 400ms of the room agreeing they broke, chip balances settle correctly on the server, and the TV reveals who held what — with no player having seen another's position at any point.
