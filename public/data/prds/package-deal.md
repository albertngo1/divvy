## Overview

A sealed-bid **combinatorial auction** for 3–5 people at a party. Four absurd lots go up at once ("a shoebox of AA batteries", "the aux cord", "whatever's in the freezer", "the good chair"). Every phone privately holds a different synergy sheet, and every phone submits *package* bids — a bundle of lots at one price. A server solves the allocation live on the TV.

## Problem

Package bidding is the most interesting auction format ever invented and it is unplayable at a table. You'd need each player to hand-write bids for arbitrary subsets, then someone would have to solve an NP-hard winner-determination problem with a pencil. Board games dodge it by auctioning one lot at a time — which throws away the entire point, that things are worth more together. Hidden, *asymmetric* valuations make it worse: at a table that's four people squinting at screens and doing arithmetic behind their hands.

## How it works

**Host TV (public):** the four lots. During bidding it shows only each seat's *bid mass* — how many lots that player has touched — never prices, never subsets. A player who's touched all four is either desperate or bluffing, and the room can see it.

**Phone (private):** your synergy sheet. Batteries alone = 1. Batteries + flashlight = 9. Aux cord + good chair = 6. Everyone's sheet is different and secret. You compose up to two package bids: tap lots to build a subset, drag a price. The two bids are **XOR** — at most one of yours can win. A live readout shows "if this wins: pay 7, score 9, net +2".

At the buzzer the server enumerates every feasible allocation and picks the one maximizing total revenue. The TV animates the solve: candidate allocations flash up and get struck out one by one before it lands. Then every synergy sheet flips face up, and the room watches the exposure disasters — someone paid 7 for a lot worth 1 alone because they needed its partner and didn't get it.

## Technical approach

PartyKit / one Durable Object per room code, authoritative. Model: `Room {code, phase, lots[4], players{id, name, sheet, budget}, bids[]}`, `Bid {playerId, subsetMask: 0–15, price, xorGroup}`. Phones stream draft state ephemerally; only `submit` is authoritative and server-timestamped. Winner determination is trivial at this size — 15 non-empty subsets, one bid per player max, a few thousand combinations, sub-millisecond brute force.

The genuinely hard part is not the solve, it's the **reveal choreography**: the TV animation and five phones must agree on phase boundaries, so phases advance on server ticks with client-side interpolation and phones go read-only during reveal. Second hard part: sheet generation must *guarantee* at least one painful exposure trap. Generate from templates, then simulate naive single-lot bidding and reject any sheet set where it wins.

## v1 scope

- 3 players, 4 lots, **one round**
- Max 2 XOR package bids each, fixed budget of 20
- Three hand-authored synergy sheets, verified to contain a trap
- Room code, no accounts, no persistence
- Reveal = one struck-out-allocations animation, then a static results list

## Out of scope

Multi-round play, more than 4 lots, VCG/Vickrey pricing, chat, spectators, offline PWA install, custom lot decks, rematch flow.

## Risks & unknowns

Comprehension is the whole risk: "at most one of my packages can win" *is* the game, and 90 seconds may not be enough to internalize it — the live net-profit readout is the mitigation. With only 3 players and 4 lots the optimal allocation may be obvious, killing the reveal. And 90s of silent bidding is a lot of dead air on the TV.

## Done means

Three phones and one TV complete a round end to end in under 4 minutes; the solver matches a brute-force reference on 500 randomized bid sets; and in playtest at least one player says out loud, during reveal, some version of "wait — I only got *one* of them".
