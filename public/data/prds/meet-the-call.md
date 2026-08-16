## Overview

A 4-player, 90-second in-play betting game where the fun is not predicting the show — it is guessing who else is levered. The TV shows a single prop and a single price tape. Your phone shows your position, your collateral, and a margin bar nobody else can see.

## Problem

Group betting on a show is one-shot: pick a side, wait, collect. There is no second-order game, because everyone's exposure is either public or irrelevant. Real markets are interesting for the opposite reason — the most profitable information is *how much other people can afford to lose*, and that information is hidden. No party game has put a forced liquidation on a TV.

## How it works

1. **The prop.** TV: *"Does she open the box?"* Price starts at 50 and is the room's own consensus, not a real market — it moves only from player order flow.
2. **Private books.** Each phone starts with 20 chips of collateral and may hold a position up to 4× that. Buy YES / sell YES in sizes of 1–8. Your size, your leverage, and your unrealized P&L are private. The TV shows the price tape and nothing else.
3. **Price impact.** Every order moves the price by `k × signedSize` — a 8-lot visibly spikes the tape. The room sees the spike, not the trader.
4. **The call.** Whenever your equity drops below 25% of position value, the server force-closes your entire position at market. That sale shoves the price further, which can put the next-most-levered player under maintenance, which cascades. The TV flashes a red **MARGIN CALL** with no name; your phone gets a 5-second ADD COLLATERAL panic button funded from your unspent reserve.
5. **Resolution.** The clip ends, the prop settles at 0 or 100, survivors mark to truth. Only at the very end does the TV attribute each margin call to a face.

The game this produces: a big buy is both a bet and a weapon. If you think Dana is long and thin, you can pay real price impact to stop her out and buy her forced sale. If you are wrong about her leverage, you just bought high for nothing.

## Technical approach

Host tab plays the clip; phone PWAs; one Durable Object per room owns the price scalar, every account, and the clock. Single-threaded DO execution is the whole reason this is buildable — margin checks must run to a fixed point inside one tick or a cascade double-liquidates.

Model: `Market {price, k, ticks[]}`, `Account {collateral, reserve, side, size, entry}`. Orders are stamped on arrival and processed FIFO in 100ms batch ticks so a phone on good wifi cannot front-run one on bad wifi. After applying a batch: loop `checkMaintenance → liquidate → reprice`, capped at 5 iterations, then broadcast one price update plus per-player private deltas over separate channels.

Hard part: making a liquidation *legible*. A silent number change reads as a bug. v1 spends its animation budget on the tape gapping, the red flash, and the settled attribution at the end.

## v1 scope

- 4 players, one 90-second clip, one binary prop, one price.
- Fixed 20-chip collateral, 4× cap, sizes 1–8, one panic ADD COLLATERAL per player.
- TV: price tape, anonymous MARGIN CALL flash, final attribution screen.
- No order book, no limit orders, no fees.

## Out of scope

Multiple props, shorting other players' books, rounds, leaderboards, real odds, clip library, spectator mode.

## Risks & unknowns

May read as finance homework rather than a party game — the phone UI must be two buttons and a bar, not a trading terminal. `k` needs tuning: too small and nobody can be squeezed, too large and the first 8-lot ends the game. Cascades may be so fast the room cannot follow them; a 400ms enforced delay between cascade steps is the likely fix.

## Done means

Four phones trade one prop over one clip, an over-levered player is force-closed by another player's deliberate 8-lot, the TV shows the gap and an unattributed red flash within 400ms, the clip resolves, and the final screen names who blew up and who bought their liquidation.
