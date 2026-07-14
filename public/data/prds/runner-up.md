## Overview
Runner-Up is a 3–5 player sealed-bid auction party game built on the Vickrey (second-price) rule: highest bidder wins the lot but pays the *second*-highest bid. It's a mechanism famous for being tedious to explain and elegant in theory — and it only sings when each phone privately holds a different secret valuation.

## Problem
Second-price auctions have a beautiful property: bidding your true value is the dominant strategy. But run one at a table and it collapses — you need sealed slips, someone to sort them, arithmetic to find the runner-up price, and total trust that nobody peeked. The clever theory drowns in paperwork, and half the table won't believe the 'just bid honestly' claim anyway.

## How it works
A lot appears on the host TV (an absurd prize: 'a lightly used moon,' 'exclusive naming rights to Tuesday').

Each **phone privately** shows a number nobody else sees: *YOUR true value* for this lot (randomly assigned, e.g. 43). You secretly enter a bid — anything you like — and lock it. Bids are simultaneous and hidden.

On reveal, the **host screen** dramatizes it: bids flip up, the top bidder wins, and — the twist everyone forgets — they pay the *runner-up's* bid, not their own. Profit = your private value − price paid. Ties for top cancel to no-sale.

Across 3 lots, most cumulative profit wins. The fun is watching players over-bid in a panic or shade down to 'outsmart' a rule that already rewards honesty — and the reveal exposing who left money on the table. Values stay secret until end-game, so you're bidding blind to others' worth, only your own.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit).

Data model: `Room { lots: Lot[], currentLot, phase, players: [{id, value(private, per-lot), bid, locked, profit}] }`. Each phone is sent ONLY its own `value` for the active lot.

Sync here is easy — it's turn-based reveal, not real-time. The genuinely hard part is **information hygiene and drama**: bids must be un-leakable before the simultaneous unlock (server never echoes a bid until all are `locked`), the second-price computation and tie-cancel must be provably correct and visibly explained on reveal (players WILL dispute it), and the reveal has to teach the rule in the moment or the elegance is lost on the table.

## v1 scope
- 3 players, 3 lots, one session.
- Random integer private values 1–100 per lot.
- Single sealed bid per lot, lock button, all-locked triggers reveal.
- Host reveal animation: bids, winner, 'pays the runner-up' price, profit deltas, running total.

## Out of scope
- Budgets/currency carryover, all-pay variants, custom lots, >5 players, accounts, the guess-the-hoarder meta-round.

## Risks & unknowns
- Will players grasp 'pays second price' without a rules wall — is the reveal animation enough?
- Randomly-assigned private values may feel arbitrary vs. earned; may need flavor.
- Three lots might be too short to feel like a game; balancing session length vs. 'humiliatingly small.'

## Done means
Three phones join, each sees a distinct private value per lot, bids lock invisibly and reveal only when all are in, the server correctly identifies the winner and charges the second-highest bid (cancelling on ties), profit is computed as value − price, and the host screen shows a legible three-lot leaderboard at the end.
