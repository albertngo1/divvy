## Overview

Sealed Nickel is a 4-player concurrent-room auction game for a shared TV plus phone controllers. It fixes the two things that make live auctions miserable in person: the sequential turn order and the bookkeeping. Every bid is simultaneous, sealed, and paid in goods rather than money — and the sting is that what you *win* is not what you *bid*.

## Problem

Tabletop auctions (Modern Art, Ra, High Society) are brilliant and unplayable at a party. Bids are announced out loud, so late bidders get free information; money is fiddly physical chips; and everyone waits through three other people's turns. Sealed-bid variants fix the information leak but require paper slips and a scoring referee. The itch: an auction where all four bids land at once, nobody hears anybody, and the resolution is instant and theatrical.

## How it works

Each phone starts with a private hand of 5 cards, each a silly noun with a hidden point value 1-9 ("A Damp Owl · 7"). Nobody sees anyone else's hand — not even the count of high cards.

The TV reveals one **Lot**: a public card everyone wants (value visible, e.g. "The Last Croissant · 8").

All four players simultaneously choose, on their own phone, one card from their hand to bid. 20-second timer. Your phone shows your hand, your bid selection, and a private nudge ("you are holding the highest single card in play" — true only sometimes; it's a real server-computed fact, revealed to at most one player per round).

On reveal, the TV flips all four bids face-up at once. Highest bid wins the Lot. **But the winner does not lose their bid — they lose the *second-highest* bid's card from their own hand instead**, if they hold a card of that value or higher; otherwise they discard their bid. Everyone else keeps their bid card. This is a Vickrey auction where the price is paid in your own inventory, and it means bidding your 9 to win is only expensive if someone else also went big.

One round, one Lot, then the TV totals hands and names the winner.

Host screen shows: the Lot, four face-down bid backs that flip on reveal, a running "hand size" per player, and the final scoring math animated. Never any hand contents until the end.

## Technical approach

PartyKit Durable Object per room. State: `{players: [{id, name, hand: Card[], bid: CardId|null, locked}], lot, phase}`. The DO holds all hands; each socket receives only a filtered view — `you: {hand}`, `others: [{id, name, handSize}]`. Filtering happens on the server at send time, never as a client-side hide.

Sync: phases are `LOBBY → BID(20s) → REVEAL → SCORE`. Bids are stored on receipt but never echoed; the DO broadcasts only `bidLocked: playerId`. Timer is server-authoritative — the DO stamps a `deadline` epoch and clients render a countdown against it, so a lagging phone doesn't get extra seconds. Late/absent bids auto-submit the player's lowest card.

Hard part: the reveal must feel simultaneous. If four flips arrive at slightly different times over the TV socket, the drama dies. Solution: the DO computes the entire reveal *and* the second-price resolution as one immutable payload, broadcasts it once with a `revealAt` timestamp ~400ms in the future, and every client animates from that shared clock. Second hard part: the Vickrey-in-goods rule is easy to misread, so the TV animates the payment step explicitly ('Dana won · pays a 6 · loses A Damp Owl').

## v1 scope

- Exactly 4 players, one Lot, one round
- 5-card starting hands from a hardcoded 30-card deck
- 20-second sealed bid, auto-submit on timeout
- Second-price-in-goods resolution, animated once on the TV
- Final score = sum of hand values + Lot; TV names a winner
- The private nudge shown to at most one player

## Out of scope

Multiple lots, money, trading, rejoin/reconnect polish, spectators, sound, more than 4 players, any persistence between rooms.

## Risks & unknowns

The second-price-in-goods twist may be one rule too many for a party — playtest whether the TV animation carries it. With one round, luck of the deal dominates; that's acceptable for v1 but may read as unfair. Four sealed bids in 20 seconds might be over too fast to feel like an auction.

## Done means

Four phones join a room code, each sees a distinct 5-card hand no other device can obtain, all four submit bids inside one 20s window, the TV flips all four within 100ms of each other, the second-price payment resolves correctly including the fallback case where the winner can't cover, and the TV displays a correct final ranking.
