## Overview

A fast open-outcry auction for three players where every item on the block belongs to someone at the table, secretly. A chandelier bid is the real auctioneer's term for a phantom bid invented to lift the price; here the phantom is a player. Two consequences: you are sometimes bidding against the person who profits from your bid, and you sometimes need to talk up an item you are desperate not to win. Seven minutes, three lots.

## Problem

Shill bidding is the most interesting mechanic in real auctions and is almost unplayable at a table: it needs a secret ownership assignment, anonymous bids, and instant resolution, which in cardboard means face-down chits, an argument about who raised, and a five-minute price ladder. Phones make all three free. Nobody has to look away.

## How it works

Three players, three absurd lots drawn from a fixed content list ("a jar of 1998 pond water," "your neighbour's second-best hedge trimmer"). The server secretly assigns each player as the consignor of exactly one lot — you always own one, never know which of the other two owns which.

**Your phone privately shows:** your personal value for each of the three lots (a random 0–60, different per player), a red banner on the one lot you consigned reading YOU OWN THIS — YOU COLLECT THE HAMMER PRICE, and, during bidding, a live indicator of whether you are currently the last bumper (HOLDING IT).

**The TV shows:** the lot, the current price, a three-second countdown bar, and the words SOMEONE BUMPED — never who.

Bidding: price starts at 5. Any player may tap BUMP to raise it by 5. Each bump resets the countdown to three seconds. When a full three seconds pass without a bump, the auction closes and the last bumper buys at the current price. If nobody ever bumps, the lot is passed in and the consignor eats a −10 penalty.

The consignor may bump. That is the whole game. Bump to lift the price and you might extract 40 from a rival; bump once too often and you have bought your own pond water at 35, paying yourself and netting nothing while the other two split the room.

Scoring: buyer scores (private value − price); consignor scores the hammer price; a consignor who wins their own lot scores zero and loses their value. Final TV screen reveals every consignment.

## Technical approach

PartyKit Durable Object, one per room. State: `{lots:[{id, consignorId, price, lastBumperId, deadlineMs}], values: {playerId: {lotId: n}}}`. Bumps are client-sent intents; the server alone increments price and resets the deadline, timestamping with its own clock. Per-socket filtering strips `consignorId` and other players' `values`.

The hard part is the countdown under latency. Two players bumping within 80ms of each other must resolve to one price step or two, deterministically and identically on all four screens. Approach: server assigns a monotonic bump sequence number; clients render the countdown from a server `deadlineMs` corrected by a per-socket clock offset measured at join; a bump inside the last 400ms extends the deadline to a minimum of 400ms so no phone can lose a race it visually appeared to win.

## v1 scope

- Exactly 3 players, exactly 3 lots, one pass through
- Hardcoded lot text, random private values
- One BUMP button, one countdown, no bid increments other than 5
- Consignment reveal and score screen at the end

## Out of scope

- 4+ players, buy-it-now, reserve prices, multiple rounds
- Any negotiation, chat, or accusation phase
- Reconnect beyond rejoin-by-code

## Risks & unknowns

With only three players, one non-consignor dropping out immediately makes shilling suicidal; the value spread may need widening so both rivals stay live. Anonymity may be paper-thin — with three players, a bump when you didn't bump identifies the bumper as one of two. That may actually be the fun, but it needs playtesting. Latency-induced "I bumped first!" arguments are the main failure mode.

## Done means

Three phones, three lots, under eight minutes, and at least one lot ends with a consignor holding their own item to visible table delight. The reveal screen correctly attributes all three consignments, and no phone's countdown bar ever disagrees with the TV's by more than 150ms.
