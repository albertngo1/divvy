## Overview
Finder's Fee is a 4-player game of paid information. One player, the **Fixer**, holds the only map of a 7×7 field on their phone: where the Prize is, where the sinkholes are. The other three are **Runners**, crossing that field one step per tick, seeing their own coordinates and nothing else. The Fixer is not on anyone's team. The Fixer sells.

## Problem
"One phone is the map" almost always means a benevolent guide talking friends home — cooperative, warm, and structurally a walkie-talkie. Making the map-holder a mercenary flips the social shape entirely: information becomes a priced good, lying becomes a strategy with a real cost, and the table has to reason about a *person* instead of a maze.

## How it works
12 ticks, 10 seconds each. Runners start on different edge cells with 100 chits.

**Runner phone (private)**: current coordinates, chit balance, D-pad, and a hint menu with three tiers —
- CLEAR: "the Prize is not in this 2×2"
- WARM: "is the Prize within 2 steps of me? yes/no"
- LINE: "which of the 8 directions from me"

A Runner picks a tier; the Fixer's phone gets the request and names a price; the Runner accepts or walks away. The answer arrives as text on *that Runner's phone only*. Never spoken, never on the TV.

**Fixer phone (private)**: the full grid, three live Runner dots, the request queue, a price pad — and the ability to answer *wrongly*. The server does not check the Fixer's answer against truth.

**Host screen (public)**: the tick clock, every Runner's chit balance in big numbers, and an anonymous ticker — "a hint was sold — 40 chits". No map, no truth, no names. Public balances are the deduction engine: the Runner down 60 chits probably knows something, so follow them — and the Fixer watches you follow.

First Runner onto the Prize wins; a sinkhole costs 3 ticks. The Fixer's score is chits earned, **halved if nobody reaches the Prize in 12 ticks**. So the Fixer must string the table along and still let someone win.

## Technical approach
Durable Object per room. State: `truth` (prize cell, 4 sinkholes), `runners[id]{cell, chits}`, `requests[]`, `tick`. All hint traffic is server-mediated: request → quote → accept → atomic chit transfer → answer delivered to the requesting connection only. Ordering is the sharp edge — two Runners buying the same tier in one tick must not see each other's quote, and a Runner must not be able to accept a stale quote after their balance changed. Server-side escrow with a single per-room queue covers it.

Hard part: keeping the Fixer's UI fast enough to quote three simultaneous requests inside one 10s tick, and tuning the anonymous ticker to leak *exactly* enough.

## v1 scope
- 4 players, 1 round, 12 ticks, one hand-placed 7×7 grid.
- 3 hint tiers; free-form price entry; accept/decline only, no counteroffer.
- Prize + 4 sinkholes. 100 chits, spend-down only, no earning.

## Out of scope
Counteroffers, cross-round Fixer reputation, more Runners, chat, sinkhole reveals, replays.

## Risks & unknowns
A relentlessly lying Fixer kills the market by tick 4; the halving penalty is the only brake and may be too weak. Quoting under time pressure may be too fiddly on a phone. Runners might brute-force-search and ignore the market — grid size and tick count must make search strictly worse than buying.

## Done means
Four phones join; the Fixer sees a map nobody else can; a Runner buys a WARM hint; chits move on the shared screen without revealing who or what; the round ends with either a Prize claim or a Fixer sitting at half score.
