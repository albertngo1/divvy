## Overview

A 4-player concurrent-room auction game for people who like the *idea* of Modern Art or Ra but not the twenty minutes of shuffling, bid tracking, and "wait, whose turn is it." One lot goes up. Nobody knows what it fully is. Everyone knows one true thing about it.

## Problem

Tabletop auctions are tedious because the interesting part — private valuation — has to be simulated with fiddly hidden money and slow turn order. In person, the auctioneer chant is fun and the bookkeeping is not. And every player valuing the same fully-visible item makes for flat, arithmetic bidding.

## How it works

The host TV shows a lot with a redacted description: five slots, all blacked out, plus a live price ticker starting at $0. Each of the four phones privately holds ONE of those clauses in plaintext — e.g. "it is under 30 years old", "it is broken", "a celebrity owned it", "there are 400,000 of them." The fifth clause is held by nobody and never revealed.

Each phone also privately shows a **valuation rubric**: a personal formula the server computed for you, like "+40 if the lot is broken, −25 if mass-produced." You can only apply the terms whose facts you actually know — yours, plus whatever gets said out loud.

The price only moves when someone **unseals a clause**. Your phone has one button: UNSEAL. Tapping it publishes your clause to the TV permanently and adds a server-set increment to the price. You may unseal at any moment; unseals are simultaneous and the server orders them. The round ends 15 seconds after the last unseal, or immediately if all four unseal.

Then: a blind simultaneous BID on each phone, one number. High bidder pays their bid and scores their rubric's true value minus what they paid. So unsealing is agonizing — you reveal a fact that makes YOUR rubric worth more only by teaching three rivals the same fact and pushing the price up.

Private on phone: your clause, your rubric, your unseal button, your bid box. Public on TV: unsealed clauses, current price, who unsealed what, a countdown.

## Technical approach

PartyKit Durable Object per room. State: `{lot: {clauses[5], ownerBySlot}, unsealed: Set<slot>, price, rubrics: Map<playerId, Term[]>, bids: Map, phase}`. Rubrics are generated server-side from a hand-authored lot bank so terms are guaranteed to conflict across players.

Sync is easy in volume, hard in *ordering*: unseal is a race. Two players tapping within 80ms must get a deterministic, fair result — server assigns a monotonic sequence, and the TV animates unseals in that order with a 400ms stagger so the room can read them. Bids are collected as commitments and revealed only on the last submission, so nobody's number leaks via a laggy render.

The genuinely hard part: pacing. With no turn order, the room can freeze — four players all waiting. A visible decay timer that lowers the price every 5 seconds of silence forces action without a turn system.

## v1 scope

- Exactly 4 players, one lot, one round
- Hand-authored bank of 6 lots × 5 clauses
- Rubrics: 3 terms each, hand-tuned per lot
- One button (UNSEAL) + one number input (BID)
- TV shows redaction bars, price, and a final scoreboard

## Out of scope

Multiple lots, money carryover, bidding wars/outbid loops, proxy bids, player count other than 4, any lot generation that isn't a hardcoded JSON file.

## Risks & unknowns

Rubrics may be too opaque to reason about in 60 seconds — may need to show "your current known value" live. The decay timer might feel punishing rather than propulsive. Four players might all unseal instantly out of nerves, collapsing the game to a plain blind auction; the increment size needs playtesting.

## Done means

Four phones join a room code, each sees a different clause and rubric, at least one player unseals and the TV updates within 300ms, blind bids resolve to a single winner, and the final screen shows each player's true value versus their bid — with at least one player visibly regretting an unseal.
