## Overview

A 4–6 player, 8-minute party game about frantic private barter and the moment the bills come due. Every phone privately holds an inventory of absurd goods and a secret shopping order; the TV shows only anonymized market aggregates. You may promise goods you don't have. At the bell, settlement runs — and anyone who promised the same thing twice defaults, loudly, in front of everyone.

## Problem

Trading phases in tabletop games (Catan, Bohnanza, Chinatown) are the best part and the worst part. They're the best because negotiation is social; they're the worst because deals are *serial* — one loud player dominates, four people wait, and nothing is enforceable without an accountant. Simultaneous, binding, over-committed trade is impossible with cards on a table: you can't privately promise the same goat to three people and have the room discover it all at once.

## How it works

1. Each phone privately receives 5 goods ("half a birthday cake", "your cousin's van", "a folding chair") and a secret 3-item ORDER to fill.
2. A 90-second open window. On your phone you compose an offer: pick a target player, pick what you GIVE, pick what you WANT, send. Offers are one-tap accept/decline on the recipient's phone.
3. **You may offer goods you do not hold** — they appear greyed but selectable. And offers are non-exclusive: the same folding chair can back three live offers at once.
4. Accepting is instant and binding. Delivery is not. Delivery happens at settlement.
5. **The TV never shows an offer.** It shows a ticker of anonymous deal volume and an OPEN INTEREST bar per item: promises outstanding vs. copies known to exist in the room. Five chairs promised, two chairs in the room — someone is short, and everyone can see it without knowing who.
6. At the bell, the server settles in acceptance order. First accept gets the item; every later claim on the same unit is a FAIL TO DELIVER — the TV stamps DEFAULT with your name, you pay the penalty, and your counterparty's order goes unfilled.

Scoring: +4 per order line filled, −5 per FTD, +1 per unsold surplus good.

## Technical approach

PartyKit Durable Object per room, authoritative. Data model: `Room{phase, deadline, items[], openInterest{}}`, `Player{id, inv[], order[], reputation}`, `Offer{id, from, to, gives[], wants[], seq, state}`, `Accept{offerId, seq}`. The server assigns a monotonic `seq` to every accept; clients never resolve anything locally. Phones get a filtered state slice (own inventory, own order, own inbox); the host tab gets the aggregate projection only — enforced server-side so a curious player opening the host URL learns nothing.

The hard part is the accept race: two people can tap ACCEPT on offers backed by the same unit within 40ms of each other. Resolution must be server-sequenced, and the loser must feel the loss *at settlement*, not at accept time, or the shorting tension evaporates. Phones show an optimistic "pending" state that is never retracted mid-round.

## v1 scope

- 4 players, one 90-second round, single settlement.
- 12 item types, 3-line orders, fixed −5 penalty.
- Accept / decline only. No counteroffers, no chat, no cash.
- Host screen: open-interest bars, deal ticker, settlement reveal.

## Out of scope

Multi-round markets, currency, partial delivery, reputation carryover, spectators, rejoin-after-disconnect.

## Risks & unknowns

Over-promising may be strictly dominant — if the penalty is too soft everyone shorts everything and open interest goes to noise; needs playtest tuning. 90 seconds may be too short to compose offers on a phone keyboard-free UI. Quiet players get ignored and never receive an offer.

## Done means

Four phones, one TV. A player promises one folding chair to two people, both accept, and at the bell the host screen stamps DEFAULT on that player while the second buyer's order shows one line unfilled — and the table reacts out loud.
