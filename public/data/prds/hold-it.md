## Overview

**Hold It** steals the cross-examination system from courtroom adventure games (press / present / object) and squeezes it into a 4-6 player living-room game. The host screen is the witness stand. Every phone is a private court record. One round is one testimony, about six minutes.

## Problem

The courtroom-adventure genre is one of gaming's great social feelings — the whiplash of spotting a lie and slamming a button — but it's strictly single-player, because the fun depends on *you* privately holding a fact the game doesn't know you noticed. Party versions collapse into trivia buzzers. The itch: keep the private-record feeling, but make the contradiction something no single person can prove alone.

## How it works

The **host screen** shows a witness portrait and their testimony, revealed one statement at a time on a 7-second auto-advance (5 statements, then it loops). It also shows the public burn pile of already-presented evidence, and each player's score. It never shows anyone's hand.

Each **phone privately** holds 4 evidence cards drawn from a 20-card case file — overlapping but not identical hands, so near-misses are everywhere. Phone actions:

- **PRESS** (free, unlimited): freezes the loop and makes the witness elaborate on the current statement, swapping in a pre-authored follow-up line. This can create a contradiction — or destroy one you were saving. Pressing is public; the TV names you.
- **HOLD IT** (the bid): freezes the testimony, then you pick one card to **present**. It is revealed to the room forever and burned from your hand, win or lose.
- **SECOND** (4-second window, appears on every *other* phone after a present): tap to corroborate with a card of your own, which also burns.

Scoring: the case file defines exactly one *paired* contradiction — statement S is only broken by cards A **and** B, held by two different players. Present A alone with no second → **OVERRULED**, -2. Present A and get the right second → both players split +6. Second with a wrong card → -1 for the seconder only. So presenting is a public bet that someone out there holds your other half, and seconding is a bet that the presenter isn't fishing.

The social engine: you can talk freely, but naming your cards out loud tips the two players who could complete your pair — and they score equally, so the incentive is to hint just enough to be corroborated and no more.

## Technical approach

PartyKit Durable Object per room, one authoritative room actor. State: `{caseId, statementIdx, pressed[], hands: {playerId: cardId[]}, burned[], phase: 'testify'|'present'|'second', scores}`. Phones join by QR to a 4-letter room code; the server deals hands and *only ever sends a player their own hand*.

Sync is coarse — the only latency-sensitive moment is the HOLD IT race, resolved by server arrival order with a 250ms grace so LAN jitter doesn't decide it. The genuinely hard part is authoring: the case file must be generated such that near-miss cards look exactly as contradictory as the real pair. v1 hand-authors one case and validates it by playtest, not by generation.

## v1 scope

- One hand-authored case: 5 statements, 5 press-elaborations, 20 evidence cards, one true pair.
- Exactly 4 players, one round, no lobby customization.
- Host screen: portrait, current statement, burn pile, scores.
- Phone: hand of 4, PRESS, HOLD IT, SECOND.
- Scores printed at the end. No persistence.

## Out of scope

Multiple cases, LLM-generated testimony, a prosecutor/defense role split, animations, spectators, rejoin-after-disconnect.

## Risks & unknowns

- Players may just shout their cards, collapsing the bid. Mitigation: hands are 4 cards of dense text; reading one aloud costs real testimony time.
- The paired contradiction may read as arbitrary rather than clever — this is an authoring quality problem, and one bad case sinks the demo.
- Press could become spam. v1 caps it at 3 presses per round, room-wide.

## Done means

Four phones and a laptop, one round, no explanation beyond a 30-second rules card: at least one OVERRULED (someone bid and nobody had the other half) and at least one successful pair, and when it lands the room reacts audibly.
