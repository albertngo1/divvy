## Overview
Reserve is a 3-6 player bluffing auction. Lots come up one at a time on the shared TV; each player secretly bids from a hidden budget on lots whose value to *them* only their own phone reveals. The cruel twist: it's an all-pay auction — everyone forfeits their bid, but only the top bidder wins the lot. For people who love the mind-games of auction games (Modern Art, Ra) minus the tedious go-around-the-table "any advance on five?" call-and-response.

## Problem
Live auctions are the tensest mechanic in tabletop and the slowest to run: sequential bidding, an auctioneer, chips counted in the open. And valuations are public-ish, so the deep bluff — "is she out of money, or just baiting me?" — rarely lands. The itch: keep the chicken-game psychology, hide the budgets, and make every bid simultaneous.

## How it works
Each phone PRIVATELY shows: your remaining budget (starts at, say, 100), and this lot's value TO YOU (each player sees a different private number — the same painting is worth 40 to you, unknown to others). You enter a sealed bid on a slider and lock it.

The shared host screen shows: the lot, a countdown, and — after lock — a dramatic simultaneous reveal of the bids (with names) and who won. Crucially it does NOT show anyone's remaining budget or private valuations; those stay on-phone all game. All-pay: every bid is deducted from every bidder's hidden budget; the winner gains the lot's payout. Because budgets are invisible, players bluff by overbidding to look rich or lowballing while nearly broke.

After ~5 lots, final scores (payouts won minus everything paid) are revealed on the TV.

## Technical approach
Authoritative WebSocket server (PartyKit / Socket.IO over Tailscale Serve). Data model: `players[{id, budget, privateVals:{lotId:val}}]`, `lots[{id, payout, bids:{pid:amount}, status}]`. Sync: server assigns each player a private valuation per lot at deal time and pushes it only to that phone; phones send `lockBid`; server validates bid ≤ budget, waits for all locks or timeout, then broadcasts the public reveal (bids + winner) while privately updating each phone's budget. The hard part isn't throughput — it's the trust boundary: budgets and valuations must NEVER appear in any broadcast payload, and the reveal must be perfectly simultaneous (buffer all locks server-side, release in one frame) so no one gleans over to peek early or reads timing tells.

## v1 scope
- One game, 3-4 players, 5 lots, sealed simultaneous all-pay bids.
- Fixed starting budget; per-player private valuations dealt randomly.
- Host: lot display, countdown, synchronized reveal, final scoreboard.

## Out of scope
- Multiple auction formats, budget top-ups, trading lots, reconnection, spectators, custom art packs.

## Risks & unknowns
- All-pay can feel punishing/random for casual groups — needs a gentle tutorial lot.
- Hidden budgets are only fun if players track their own; UI must make "you're nearly broke" viscerally clear.
- 5-6 players may bloat reveal time; validate the sweet spot.

## Done means
4 phones + a TV; each phone shows a budget and a per-lot private value never visible to others; all four lock bids, the host reveals all bids simultaneously with a winner, budgets deduct correctly for all bidders, and a final scoreboard resolves after 5 lots.
