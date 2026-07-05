## Overview
Dibs is a concurrent-room party game for 3–5 players plus a host screen. A small spread of treasures sits on the shared TV. Every player's phone privately reveals *their own* secret valuation of each item — and everyone values them differently. On a countdown, all players simultaneously call dibs on exactly one item. Anything claimed by a single person is theirs; anything two or more people grab is contested and *shatters*, scoring nobody. It's a sealed-bid collision game where wanting the same thing destroys it.

## Problem
'Pick-to-avoid-matching' games are usually symmetric — everyone's staring at the same Schelling point. The itch here is *asymmetric desire*: you genuinely covet the jade idol because it's worth 9 to you, but is it worth 9 to someone else too? The agony of abandoning the thing you love for a safe scrap only lands when valuations are private and grabs are simultaneous.

## How it works
The host TV shows 5 numbered treasures (icon + name), identical for everyone. Each phone PRIVATELY shows the same 5 treasures annotated with *that player's* secret point value (e.g. Idol=9, Chalice=2, Crown=6…), generated so no single item is the obvious pick for the whole room. Each phone shows one tap-to-claim per item and a locked-in confirmation — but never anyone else's valuation or claim.

On a shared countdown everyone locks a claim. The server reveals all claims at once on the TV: items grabbed by exactly one player fly to them and score that player's *private* value; items grabbed by two or more crack down the middle and score zero for everyone involved; unclaimed items rot. The reveal is the payoff — gasps when the two greediest players both lunged at the crown. Highest total wins the round.

The private valuations plus the simultaneous hidden claim are load-bearing: pass one phone around and every later player just reads the earlier grabs, collapsing the whole tension.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Room state: `{ phase, items:[{id,name}], valuations:{ playerId:{ itemId:value } }, claims:{ playerId:itemId } }`. On start the server generates each player's valuation vector (shuffled, bounded totals) and pushes *only that player's* vector to their socket. Phones send `{claim:itemId}`; the server withholds ALL claims until every player has locked or the timer expires, then computes contested-vs-solo and broadcasts the full reveal + scores.

The genuinely hard part isn't sync (a single simultaneous reveal is simple) — it's *valuation generation*: values must be asymmetric enough to create real per-player desire yet balanced so there's no dominant item everyone rationally piles onto (which would make every round a guaranteed shatter). That distribution tuning is the design risk.

## v1 scope
- One round, 5 items, 3–4 players, one claim each.
- Server-generated private valuations, one simultaneous reveal.
- Solo=score value, contested=shatter/zero, unclaimed=nothing.
- Host shows shatter animation + final scores.

## Out of scope
- Multi-round campaigns, running scores, ties/tiebreaks.
- Negotiation, taunts, re-grabs after a shatter.
- Variable item counts or player-set valuations.

## Risks & unknowns
- Valuation balance: too flat = no desire, too spiky = forced collisions.
- One claim per round may feel thin; may need 2–3 claim phases.
- With few players collisions could be rare and anticlimactic.

## Done means
Four phones join, each sees a *different* private valuation of the same 5 shared items, all lock a claim within the window, the TV reveals every claim at once, a treasure grabbed by two players visibly shatters for zero while solo grabs score that player's private value, and a winner is declared — with no phone ever exposing another's values or claim.
