## Overview

A sealed-bid estate auction for 4 players where everyone is simultaneously a seller and a buyer. Each phone is privately dealt one lot — a boat, a horse, a haunted armoire — with five true attributes and a hidden total value. You choose exactly two attributes to disclose. Then everyone blind-bids on the other three lots at once. You can't lie. You can only omit.

## Problem

Auction games at a table die of sequencing: one lot at a time, one auctioneer talking, three people waiting and doing arithmetic. And the interesting part — the seller knowing more than the buyer — is impossible in person, because the moment you pick up the card, everyone reads your face. Adverse selection needs real privacy and real simultaneity, and a table has neither.

## How it works

**Phase 1 — Disclose (45s, all four phones at once).** Your phone shows YOUR lot in full: name plus five attributes with signed values (`Teak hull +40`, `Registered in three states −25`, `Smells fine +5`). You tap exactly two to publish. A live preview shows what buyers will see. The other three lots don't exist to you yet.

**Phase 2 — Bid (45s).** Host screen shows all four lots side by side: name, two revealed attributes, three slate-grey `???` slots. Your phone shows the three lots you don't own, each with one number field. Bids are sealed until the deadline. Your own lot is greyed out and unbiddable.

**Phase 3 — Settle.** Host flips every hidden attribute simultaneously. Highest bidder on each lot pays their bid; buyer scores `trueValue − price`, seller scores `price`. Sellers who hyped a lemon get rich; buyers who assumed the worst about grey slots get bargains. The room instantly learns the unraveling logic — *hiding three attributes means those three are bad* — which is exactly why v1 is one round and the argument afterward is the product.

## Technical approach

Host tab + phone PWAs + a Durable Object per room. State: `{lots: {ownerId, attrs: [{label, value}]×5, revealedIdx: [a,b]}, bids: Map<lotId, Map<bidderId, number>>, phase}`. Two fan-out rules do all the work: the DO never sends a lot's unrevealed attribute *values* to anyone but its owner, and it never sends any bid to anyone until the phase deadline fires server-side. Both are enforced by a per-recipient projection function, not by client-side hiding — the wire payload for a non-owner literally lacks the fields.

The hard part isn't throughput (4 players, ~20 messages a round); it's the **atomic simultaneous deadline**. Disclosure toggles are drafts and must be committable up to the last millisecond, so the DO holds an alarm, freezes on fire, and treats any in-flight edit arriving after the alarm as void with a clear "too late" on the phone. Same for bids. A single late-arriving bid that silently wins would break trust in the whole game.

## v1 scope

- Exactly 4 players, 4 lots, one round, under three minutes
- 8 hand-authored lots, each with 5 fixed attributes; dealt without replacement
- Reveal exactly 2 of 5 — no variable disclosure budget
- One sealed bid per buyer per lot, integers only, no reserve, no passing
- Host settlement screen with a scoreboard

## Out of scope

Multiple rounds, bidding on your own lot, reserve prices, second-price rules, procedurally generated lots, more than 4 players.

## Risks & unknowns

Unraveling may solve the game on round two — mitigated by one-round v1, but a real product needs noise (occasional lots where hidden attributes are good). Is picking 2 of 5 checkboxes an interesting decision, or a shrug? Bidding on three lots at once may be too much arithmetic for a party crowd; may need to drop to two lots per bidder.

## Done means

Four phones each disclose 2 attributes, the host shows four lots with correctly masked slots, all 12 bids stay invisible until the deadline, a late bid is rejected visibly, and final payoffs match hand-computed `trueValue − price` for every lot.
