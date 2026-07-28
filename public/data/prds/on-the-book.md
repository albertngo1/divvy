## Overview
A 4-player auction game with no live bidding. Each phone privately authors a tiny conditional instruction sheet — an absentee bid "left on the book" with the house — and the auction then executes itself, played back on the TV as a 40-second cinematic. For anyone who likes auction games but has sat through the twelfth lot of an ascending-bid auction at 11pm.

## Problem
Auctions are the best tension mechanic in tabletop and the worst pacing mechanic. An English auction is a serialized turn engine: one increment at a time, around the table, twelve lots, forty minutes, three-quarters of it spent watching two other people. Sealed bids fix the pacing and kill the drama — you lose the *war*, the escalation, the moment where someone's pride ruins them. The interesting information in an auction isn't your number, it's your *policy toward other bidders*, and there is no way to express a policy at a physical table without simply bidding.

## How it works
Three lots, known to all, with private valuations. Everyone gets 20 coins.

**Privately on each phone:** a two-slot rule builder. Each rule is `WHEN <trigger> THEN <action> UP TO <cap>`. Triggers: *lot is red / lot is blue*, *high bidder is Seat N*, *price is under X*. Actions: *raise by 1*, *jump to cap*, *pass*. Your phone also shows your private valuation of each lot and your remaining coins. All four books are written simultaneously and blind.

**On the shared TV:** the auctioneer runs. The server simulates a real ascending auction — seat order, one increment at a time, each seat's book evaluated in turn — and the TV plays the bid log back at ~400ms per bid with an auctioneer chant and the price ticking up. Nobody can intervene. Your phone lights up each time one of *your* rules fires, so you experience your own bot as a character with intentions you now regret.

The comedy is emergent and only possible from blind simultaneity: Seat 1's "always outbid Seat 3" meets Seat 3's "always outbid Seat 1", and they escalate a lot neither wanted from 2 coins to 19 while Seats 2 and 4 quietly take the good lots for 3 each.

After Lot 1 resolves there is one 15-second amendment window — still blind, still no live bidding.

## Technical approach
PartyKit / Durable Object room. Data model: `Room { lots[3], books: Record<seat, Rule[2]>, coins, phase, log[] }`. Phones submit whole books atomically with a phase token; late submits are rejected, not merged. The auction engine runs entirely server-side after the lock, producing an event log; the host tab is a dumb replayer of that log, so a host refresh mid-playback resumes cleanly.

The hard part is not sync — it's semantics. A rule engine players don't correctly predict is just chaos, so triggers are deliberately few, evaluation order is fixed and displayed ("rules fire top-down, seat order clockwise"), and every phone gets a one-lot dry-run preview against dummy opponents before the real lock. Mutual-escalation loops must terminate: they're bounded by coins and caps, plus a hard 200-increment iteration guard.

## v1 scope
- Exactly 4 players, 3 lots, 20 coins, 2 rules per book
- 6 trigger types, 3 action types, integer caps only
- One blind amendment window after Lot 1
- TV playback with auctioneer chant + per-phone "rule fired" flashes
- Scoring: private valuations revealed at the end, coins-remaining as tiebreak

## Out of scope
More lots, rule chaining, AND/OR conditions, live overrides, custom valuations, persistent bankrolls, spectator mode.

## Risks & unknowns
Agency-after-submit is the real risk: if the playback feels like watching someone else play, it dies. Mitigations are the amendment window and per-phone rule-fire feedback, but this needs playtest proof. Also: a two-slot rule builder on a phone must be thumb-fast — if authoring takes 90 seconds the pacing win evaporates.

## Done means
Four phones lock books blind, the TV replays a full three-lot auction from a server-generated log, at least one runaway bidding war occurs that neither participant intended, every player can point at the moment their own rule fired, and coins plus lot ownership balance exactly against the starting totals.
