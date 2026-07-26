## Overview
Small Bills is a 4-player auction game where money is lumpy and private. Each phone holds a secret wallet of odd-denomination bills; you bid by choosing a subset of them, and you pay exactly what you submitted — the house never makes change. The shared screen shows the lot and the bid totals; it never shows what anyone is holding.

## Problem
Auction games are the best mechanic in tabletop and the most tedious in practice: counting out paper money, breaking a 10 into fives, hiding your pile from a neighbor who can plainly see it, and the interminable "does anyone have two ones?" Digitally, the usual fix is to make money a smooth integer — which kills the exact thing that made physical money interesting. Small Bills keeps the lumpiness and deletes the counting.

## How it works
Three lots (point cards, 3/5/8 pts) are auctioned in sequence. Each phone starts with 5 bills of awkward denominations (e.g. 3, 4, 7, 11, 18) — different wallets per player, dealt privately.

**Private on your phone:** your bills as tappable chips, a running sum of what you've selected, your wallet total, and a private note of which bills you've received from past rounds. **Public on the TV:** the lot, its posted reserve (a number you must meet or exceed), a countdown, and — after lock — every player's bid *total* and bill *count*, never denominations.

Highest total over the reserve wins; ties go to whoever used **fewer bills** (an elegance premium). Losers get their bills back untouched. The winner's submitted bills leave their wallet and are **dealt out one at a time, privately, to the losers in ascending order of bid** — so spending doesn't just cost you points, it hands your rivals precise liquidity at price points you chose. Overpaying is real waste: bid 22 for a lot worth 8 and you funded three opponents.

The game is the arithmetic of what you *can* say. With 5, 5, 7 you cannot bid 14. Everyone knows the public totals; nobody knows whether your 15 was 4+11 or 7+4+... and the table spends the whole game reverse-engineering each other's wallets from bid totals, bill counts, and what they personally received.

## Technical approach
Socket.IO server (Node, behind Tailscale Serve) or a PartyKit Durable Object; host browser tab plus phone PWAs. State: `players = {id, wallet: [billIds], bid: {billIds, locked}}`, `lots = [{value, reserve, winner}]`, `bills = {id, denom, ownerId}` — a bill is an entity with identity, so redistribution is a pointer move and the server can audit that no denomination was invented. Bids are sealed: the server accepts `lock_bid(billIds)`, validates ownership, and broadcasts only `{playerId, total, count}` to the host at the reveal tick. Payouts are unicast — each loser's phone gets only its own new bills. Sync is turn-phased, not real-time, so the hard part isn't latency: it's **leak discipline**. Every broadcast has to be built from an explicit public-projection function rather than by filtering the room object, or one careless `emit(state)` shows the room every wallet and the game is over.

## v1 scope
- 4 players, one session of exactly 3 lots (redistribution needs at least two to bite)
- Fixed hand-authored wallets and lots — no generation, no balancing
- 20-second bid timer; no bid = you keep everything and score nothing
- Host screen: lot, reserve, timer, reveal bar chart of totals, final scores

## Out of scope
- Trading or gifting bills, loans, multi-lot simultaneous bidding, persistence, >4 players

## Risks & unknowns
- Does illiquidity read as clever or as arbitrary bad luck? Denomination sets need tuning so most players can hit most price points *somehow*.
- Redistribution may feel like it rewards losing; the ascending-bid deal order is a guess.
- Three lots may be too few for wallet inference to pay off.

## Done means
Four phones join by code, submit sealed subsets, and the TV reveals only totals and counts; the winner's exact bills appear in losers' private wallets and nowhere else; the server rejects a bid containing a bill the player doesn't own; a full 3-lot game finishes in under five minutes.
