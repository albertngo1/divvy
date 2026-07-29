## Overview

A 60-second silent auction for four people in a room. One lot, one rising price, and a big HOLD pad on every phone. Keep your thumb down to stay in; lift it and you're out forever. The last thumb standing wins — and probably regrets it. For groups who like tension without talking.

## Problem

Auctions are the best mechanic in board games and the worst experience at the table. The English auction crawls clockwise, someone has to play auctioneer and chant "going once, going twice," the slowest player sets the pace, and everybody bids on identical public information, so there is nothing to read. The interesting part of a real auction — inferring value from other people's behavior — is exactly the part cardboard cannot deliver.

## How it works

The host TV shows a lot: *1998 estate sale, unopened.* Its true value **V** is the sum of four hidden attribute scores. Each phone is privately dealt **exactly one** of those four attributes — "Condition: pristine, +40" or "Provenance: dubious, −15." You own a quarter of the truth and know nothing about the rest.

The price ladder starts at 0 and ticks +5 every 700ms. Everyone presses and holds. Release is instant and irreversible.

- **Phone (private):** your one attribute card, the live price, your HOLD pad, and a running "if I win right now" line.
- **TV (public):** the price, and only the *count* of thumbs still down — 4… 4… 3… 2. Drop-outs are anonymous while live, plotted as ticks on a timeline.

When the second-to-last thumb lifts, the auction ends. The last holder buys the lot **at that price**. Then the reveal: all four attribute cards flip, V is computed, each player's private signal and exit price are shown side by side. Win too easily and you learn the room knew something. Score = V − price, and it can be deeply negative.

## Technical approach

A PartyKit Durable Object is the sole clock and the sole authority. State: `{phase, price, tick, holders:Set<pid>, exits:[{pid, price, tick}], lot:{attrs[4], V}}`. Attributes are dealt over per-socket private messages and never broadcast until reveal.

Phones send `HOLD_DOWN` / `HOLD_UP` on pointer events plus a 250ms heartbeat while held; two missed heartbeats count as a release. Sync is one broadcast per tick containing only `{price, holderCount}`.

The genuinely hard part is fairness under jitter. A player must never be knocked out by a dropped packet, and two releases arriving in the same tick must resolve *deterministically*. Solution: server ticks are the only timeline, releases are stamped to the tick in which they land, a 300ms grace window forgives a slipped thumb, and if two thumbs lift in the same tick the lot **passes in** — no winner, nobody pays. An honest rule beats a coin flip. Client side: `touch-action: none`, Wake Lock, and suppression of long-press context menus.

## v1 scope

- Exactly 4 players, one lot, one auction, then the reveal screen
- 4 attribute cards, 5-point ticks every 700ms
- No money and no budgets — unlimited credit, score can go negative
- Anonymous holder count on TV; de-anonymized only at reveal
- Join by room code, no accounts, no persistence

## Out of scope

Multiple lots or rounds, budgets, private-value lots, sound design, spectator mode, rematch flow, more or fewer than four players.

## Risks & unknowns

Mobile browsers cancel pointer events on notifications and scroll — a false release ruins a round. Whether a single auction is satisfying, or whether the inference only lands on round two. Whether non-economists read the drop-out timeline as information or as noise. If the ladder is too slow, forty seconds of holding a thumb is just tiring.

## Done means

Four phones on a LAN, one lot. Thumbs go down, the TV counts 4→3→2, the winner is declared at the second-to-last exit price, the reveal flips all four attributes and shows profit or loss. Success is one playtest where the winner audibly groans at what they paid.
