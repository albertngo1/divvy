## Overview

A four-player, two-pair bidding game for people who like the *brain* of bridge and none of its procedure. Each pair privately agrees on a three-button code before the deal. During bidding, opponents may demand an explanation of any coded bid — and the explanation is legally required to be truthful, is answered by your **partner**, and is delivered to the opponents alone. You do not learn how you were described until showdown.

## Problem

Tournament bridge already solved coded partnership signaling, with the most tedious apparatus in tabletop gaming: convention cards, alerts, announcements, bidding boxes, and — at high level — physical screens across the table so a player cannot see or hear their own partner explaining their bid. At a kitchen table none of this works. You cannot hide four hands, you cannot route "what did that mean?" to the partner without the bidder hearing the answer, and nobody enforces full disclosure honestly. The best idea in the game (a private language you are obliged to reveal on demand) is locked behind a rulebook nobody at a party will read.

## How it works

One deal, 32-card deck, eight cards each, two pairs seated across.

**Private (phone):** your eight cards; your pair's convention card; a bid pad of three coded buttons plus a level 1–3. Before the deal, each partner independently picks 3 meanings from a fixed menu of 6 ("I have 5+ of a red suit", "my hand is flat", "I have exactly one ace", …). Your phone shows only the meanings you *both* picked; silent disagreements survive into play and are the comedy engine.

**Shared (TV):** the bid sequence as opaque tokens — `WEST · L2 · ◆`. Never the meanings. An ASK badge lights when a disclosure is pending, with an 8-second clock.

Any opponent taps ASK on any bid. The bidder's phone locks to a full-screen blackout. The bidder's **partner** has 8 seconds to pick the meaning from their own convention card. That answer routes privately to the two opponents' phones — not the TV, not the bidder. Silence scores as an admitted misexplanation.

After two bids each, everyone privately answers one question about their partner's hand ("how many spades?"), and each opponent privately guesses the asking pair's combined length in one suit.

Showdown: the TV finally prints every bid beside what the bidder *meant* and what their partner *said*. Score = correct partner-reads, minus one point per contradicted disclosure, plus opponents' correct reads off the explanations they alone heard.

## Technical approach

Host browser tab + phone PWAs over a PartyKit/Durable Object room; the DO is authoritative and holds the only copy of the deal.

Data model: `Room{deal, pairs[2], conventions{playerId → [meaningId×3], agreed[]}, bids[{playerId, level, gadget, intendedMeaningId}], disclosures[{bidIdx, askerId, answererId, meaningId, ms}], reads[]}`. Clients hold a redacted projection; the server never ships a field to a socket that isn't entitled to it, so a scraped WebSocket frame leaks nothing.

Sync is small and event-driven — no tick loop. The disclosure window is server-timed; the client clock is display-only.

The genuinely hard part is **entitlement-correct fan-out under a hard 8-second timer**: four different views of the same event, a bidder whose device must go dark and stay dark, and a fairness question when the answer lands at 8.01s on a flaky phone. Server timestamps at receipt, 400ms grace, and a bidder-blackout that is a full-screen wake-locked overlay the server can confirm is mounted.

## v1 scope

- Exactly 4 players, one deal, no rematch
- 6 canned convention meanings, no free text
- 2 bids per player, 1 ASK per opponent
- One partner-read question, one opponent-read question
- Score printed on the TV; nothing persisted

## Out of scope

Actual card play, tricks, trumps, vulnerability, more than 4 players, custom conventions, rematch, audio.

## Risks & unknowns

Bridge-shaped rules may read as homework — the menu must be plain English. The blackout is honor-system against a shared TV, so the TV must never render disclosures mid-hand. The 6-meaning menu may be too small for real ambiguity.

## Done means

Four strangers finish a deal in under 7 minutes; the showdown screen produces at least one laugh at a partner who confidently misdescribed a teammate; and no player can state, before showdown, how their own bid was explained.
