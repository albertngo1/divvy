## Overview
A 20-minute auction game for 3 players in a room with a TV. It runs the one auction format that is physically impossible at a table: a *simultaneous* multi-lot ascending auction, where five parcels of land are all live at the same time and every player bids on all of them at once. Each phone privately holds a blueprint — a shape of adjacent parcels that pays a fortune if you assemble it and nearly nothing if you don't.

## Problem
Tabletop auctions are serial and slow: one lot, one auctioneer, one voice, everyone else waiting. Games patch around this with "once around the table" rules that turn bidding into a queue. The genuinely interesting auction — the FCC spectrum-style one where lots are complementary and you might win half of what you need — has never been playable in person, because a single auctioneer cannot run five lots concurrently and no human wants to track five price ladders, five activity counters, and a private valuation table on paper.

## How it works
**Host screen (public):** a map of five parcels A–E with adjacency edges drawn between them. Each parcel shows its current price and a colored chip naming who is *standing high* on it right now. A 20-second round clock. Nothing else.

**Phone (private):** your blueprint (e.g. "C+D" or the L of "A+B+D") with its bonus value; your cash ($20); your **eligibility** number; a live "if it ended right now" profit line; and a raise pad — tap +$1 on any subset of parcels. Your taps stage into a basket that nobody, not even the server's public state, reveals until the round closes.

Three rounds. At each round close the server resolves all baskets in one pass: highest raise takes standing-high on each parcel, ties go to the incumbent. Then the activity rule bites — **if you raised on fewer parcels than your current eligibility, your eligibility drops to that number permanently**, so keeping your options open costs real money. After round three, winners pay their standing bids. Complete your blueprint and you bank the bonus; own an orphan parcel and you eat salvage value. The reveal overlays all three blueprints on the map so the room can see exactly whose bluff worked.

## Technical approach
PartyKit Durable Object per room; host tab and phone PWAs over WebSocket. State: `parcels[{id, price, highBidder, adjacency}]`, `players{id, cash, eligibility, blueprint}`, `phase`, `roundEndsAt`. Phones stage raises locally and commit a basket; the server buffers baskets and **never echoes them** — the only public diff is the post-resolution one. Each player also receives a private diff (eligibility, exposure math).

The hard part is threefold: (1) *secrecy under simultaneity* — one leaked bid destroys the format, so baskets live only in the DO and the public broadcast is computed from resolved state, never from inbound messages; (2) *one authoritative clock* — phones estimate skew from ping RTT and the server accepts a 500ms grace window for packets stamped before the deadline; (3) *blueprint generation* — every parcel must be wanted by at least two players and no two blueprints may be identical, or the auction has no contention.

## v1 scope
- 3 players exactly, 5 parcels, 3 rounds of 20s
- Hand-authored set of three verified-contentious blueprints
- $20 budget, +$1 increments only
- One resolution rule, printed on the TV
- No reconnect, no lobby, code-on-screen join

## Out of scope
- More players or lots; package (all-or-nothing) bidding; withdrawals and penalties; variable increments; multiple auctions per session; persistence or stats.

## Risks & unknowns
- The exposure problem may feel punishing rather than thrilling; salvage value is the tuning knob.
- With 3 players, blueprints may be trivially deducible after round one.
- 20 seconds may be too short to read a five-parcel map.
- Tie-to-incumbent must be visibly explained or it reads as arbitrary.

## Done means
Three phones and a TV complete one auction end to end; at least one player finishes holding an orphaned parcel at a loss; the reveal overlays all three blueprints with final P&L; and a network log confirms no phone ever received another player's raise before its round closed.
