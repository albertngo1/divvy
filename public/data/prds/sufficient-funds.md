## Overview
A four-player auction game for a TV plus four phones that inverts the usual arrangement: what each lot is worth to each player is printed openly on the shared screen, and the only secret in the room is how much money you actually have. For groups who like Modern Art or Ra but resent the arithmetic.

## Problem
Tabletop auctions are tedious for one reason: everyone is doing everyone else's bookkeeping. The genuinely interesting question — *can she actually afford that, or is she pushing me?* — is unplayable in person, because chips are countable and cash rustles. Any table with one attentive player has a spreadsheet in their head. So designers surrender and make money public, which deletes the bluff and leaves pure valuation math.

## How it works
The host screen shows three lots and a full public value table: lot 1 is worth 9 to Ana, 2 to Ben, 5 to Cy, 5 to Dee. Everyone knows what everything is worth to everyone.

Each phone privately shows: your wallet (drawn unequally, 12–24, and never broadcast), a bid slider, and a "you'd have N left" preview. Nothing else on your phone is secret; the secrecy is entirely the number.

Per lot: one simultaneous sealed bid, 20 seconds. **You may bid more than you have.** A bid you can't cover is free money-pressure — as long as you lose. If you *win* a bid you can't cover you BUST: the room is told, your exact wallet is revealed forever, you pay every coin you have and get nothing, and the lot drops to the second-highest bidder at their price.

All bids are revealed after each lot. That is what feeds the host screen's Ledger, the piece that would be intolerable to maintain by hand: two bars per player. **Proven ≥** rises only when you actually pay for something. **Claimed ≥** rises with your highest bid. "Ben: proven 5, claimed 14" is the visible size of a lie he may or may not be telling, and a bust collapses him to a single exact number in front of everyone.

Score = value of lots you won, plus half your leftover cash.

## Technical approach
A Cloudflare Durable Object per room holds `players[]{id,name,wallet}`, `lots[]{id,valueTable}`, `bids:Map<lotId,Map<playerId,int>>`, and a public `eventLog`. The Ledger is a *pure function of the public log*, so the server and host can never disagree about it by construction.

Sync is server-authoritative phase clock: `phase_start{serverTime,durationMs}`, phones count down against a ping-measured offset. Bids are local drafts, debounced upstream, locked at server timeout; a missing bid is a pass.

The genuinely hard part is leak-free fan-out. One careless `broadcast(state)` reveals every wallet in the room. Every frame goes through `viewFor(playerId)` — a projection emitting `you` plus public ledger intervals — with a test that asserts no serialized frame sent to A contains B's wallet field.

## v1 scope
- Exactly 4 players, one game = 3 lots, ~4 minutes
- One handcrafted value table; wallets 12–24
- Slider bid 0–30, 20s, all bids revealed after each lot
- Bust rule + second-price fallback
- TV ledger: proven/claimed bars per player, final scoreboard
- Four-letter room code, no accounts, no persistence

## Out of scope
Variable player count, multiple eras, income between lots, private value tables, chat, spectators, rematch carrying wallets, sound.

## Risks & unknowns
If busting is too punishing nobody ever bluffs, the claimed bar never separates from the proven bar, and the marquee display is dead furniture. Tuning levers: bust severity (all cash vs. half) and whether leftover cash scores. Three lots may be too few to build a read. A fully public value table with four players may solve into arithmetic unless the spread is wide.

## Done means
Four phones join by code and each sees a wallet nobody else sees; all four submit bids on lot 1 inside 20s; the TV reveals bids, awards the lot, deducts privately, and moves both bars. A scripted bust shows an exact wallet reveal and a second-price award. Final scores match a hand-computed sheet, and a captured socket transcript for player A contains no other player's wallet.
