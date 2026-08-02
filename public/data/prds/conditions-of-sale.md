## Overview

A single-lot auction for exactly three players in which each bidder privately receives a *different* auction format — open outcry, sealed second-price, or all-pay — and nobody knows which rulebook anyone else is holding. For a group that likes hidden-information games and is willing to read one paragraph.

## Problem

Auctions are the best mechanic in tabletop and the worst to actually run. Someone must be auctioneer and stop playing. The rules are explained once, identically, to everyone. And the genuinely interesting formats — Vickrey, all-pay, Dutch clocks — are near-unplayable in person because each needs a tireless, trusted referee holding hidden numbers and doing arithmetic. Real auction houses print a "Conditions of Sale" page nobody reads. Hand every player a *different* one, let the server be the referee, and the tedium becomes the entire game.

## How it works

The TV is the rostrum: the lot (*a slightly haunted sofa*), a 60-second hammer clock, and a deliberately redacted live tape.

Each phone privately shows a format card (one short paragraph), a budget of 100, a private valuation of this lot drawn from {40, 70, 100} and different per player, plus controls that exist only for that format:

- **ENGLISH** — sees the current standing bid; a RAISE +5 button; pays what they bid if they win.
- **SEALED** — sees nothing about anyone's number; one slider, revisable until the hammer; pays the *second*-highest bid if they win.
- **ALL-PAY** — one slider; pays their bid whether they win or lose.

The tape is asymmetric on purpose. English raises are announced with amounts ("CLARA → 45"); sealed and all-pay activity is announced without them ("DEV moved"). One player is naked, two are opaque, and everyone can see who's naked — which is itself the first inference.

At 60 seconds the hammer falls for everyone at once, highest bid takes the lot, and the TV reveals every format card, every bid, and every payment, narrated line by line. Score = value − paid for the winner, −paid for a losing all-pay bidder, 0 otherwise.

Per-phone privacy is the whole game: you are literally playing a different game from the person next to you and must infer which one from their behavior. One phone passed around exposes every rulebook and the round is dead on arrival.

## Technical approach

PartyKit / Cloudflare Durable Object. State: `{lot, deadline, players:{id:{format, value, budget, bid, seq}}, tape:[]}`.

Every bid mutation goes through the DO, which appends a tape event and runs a per-audience redaction function `visible(event, viewerFormat)` before emitting. Three audiences: the host channel (redacted public tape), each phone (public tape plus its own private card). No bid amount leaves the DO except to its owner until `HAMMER`.

The clock is server-authoritative; clients render `deadline − offset` from a ping handshake at join, and bids in the last 300ms are judged by server receipt timestamp. Sealed revisions are last-write-wins on a monotonic sequence number.

The genuinely hard part is that redaction is a correctness problem, not a UI one: visibility depends on both the sender's format and the viewer's format, and one leaked number destroys the round. Build it as a single pure function with a table-driven test over every (senderFormat × viewerFormat) pair, plus a CI assertion that the host channel carries no numeric bid before `HAMMER`.

## v1 scope

- Exactly 3 players, exactly 1 lot, one 60-second clock, one hammer
- 3 hardcoded formats dealt at random
- Budget 100, private values drawn from {40, 70, 100}
- Reveal screen with one narrated line per player
- No rounds, no rematch, no persistence

## Out of scope

Dutch clocks, reserve prices, shill bidders, multiple lots, more than 3 players, tutorials, any rules text beyond the one paragraph on the card.

## Risks & unknowns

- Comprehension. Three cold-read rulebooks at a party may just confuse. Each card must be under 25 words and the controls must make an illegal move unrepresentable.
- The all-pay player can lose real points and feel cheated instead of amused; the reveal narration has to land it as the joke.
- Three players may leave too little signal to infer formats at all; the fix (a second lot with formats re-dealt) breaks the one-round scope.

## Done means

Three phones join; each displays a different format card and a different private valuation; the TV tape shows amounts only for the English bidder; the hammer falls at 60s; the reveal correctly computes a second-price payment for a winning sealed bid and charges a losing all-pay bidder; a WebSocket transcript check confirms no non-owner received any bid amount before HAMMER.
