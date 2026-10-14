## Overview
Gift Receipt is a 4–6 player party game played on a TV and phones. One player is the **Guest**. Everyone else is a **Giver**, and each Giver has one gift to buy before the timer runs out. It's built for friend groups who know each other well enough to guess what someone wants, which is also why their guesses all land on the same gift.

## Problem
In most guessing games, agreeing with the group is how you win. Real gift-giving runs the other way: the obvious gift is the one three people buy. When you should coordinate, the person you'd be coordinating around is in the room listening. No party game has made that awkwardness the core mechanic.

## How it works
1. **Wishlist (60s).** On their phone, the Guest privately types and ranks 8 things they'd love, from 1 (dream) to 8 (fine).
2. **Deal.** The server gives each Giver's phone a private set of **3 of the 8 items**. Rank #1 always goes to at least 3 Givers. The lower ranks are spread thin. Givers see the item names but not the ranks. They also don't see what anyone else was dealt.
3. **Shop (90s).** Each Giver taps one item and can change their pick until the timer ends. The phone shows a private rumor line, like "someone else saw this item." It's true only 70% of the time.
4. **Talking is allowed, and it's a trap.** Any time during Shop, the Guest can tap **"I heard that"** and type a guessed item. If a Giver ends the round holding that item, it's **spoiled** and scores half. So if you say "I'll take the headphones," the Guest gets to spoil the headphones.
5. **Unwrap.** The TV reveals the gifts one at a time. If two or more Givers picked the same item, all copies show a **RETURNED** stamp and score 0. Unique gifts score (9 − rank). Every Giver's score is the room total, plus a solo bonus for their own unique gift. The Guest scores 1 point for every gift they spoiled.

**Phone (private):** your 3 items, your pick, the rumor line. The Guest's phone has the ranked list and the "I heard that" box. **TV (shared):** the countdown, a wrapped box for each Giver, and the unwrap animation. During Shop the TV never shows any picks.

## Technical approach
The room runs on one authoritative Durable Object (PartyKit). State is `{wishlist[8], deals: {giverId: itemIdx[3]}, picks: {giverId: itemIdx}, spoils: itemIdx[], rumors}`. Picks are sent only to the server. The TV only ever gets a picked or not-picked count. The dealing algorithm is the real design work: it builds an overlap graph so the dream item is crowded and the low ranks are lonely, while making sure every Giver has at least one item nobody else holds. The Guest's spoils match loosely on normalized text plus the item's index. The hard part is balancing the deals, not syncing them.

## v1 scope (humiliatingly small)
- 1 round, 1 Guest, 3–5 Givers
- The Guest types the 8 items, with no catalog or images
- Fixed deal rule: rank #1 goes to 3 phones, everything else goes to 1–2
- Rumor line plus "I heard that"
- Unwrap screen with RETURNED stamps and a total

## Out of scope (for now)
Rotating Guests, budgets and prices, item photos, LLM-suggested wishlists, saving results.

## Risks & unknowns
- Givers could just whisper. Whispering in front of the Guest is part of the comedy, and v1 tests whether it ruins the round.
- If the Guest spoils too easily, Givers stop talking and the game gets quiet. Each Guest may get only 2 spoils.
- The rumor accuracy (70%) needs playtesting.

## Done means
Four people on four phones play a full round in under 5 minutes. The server log shows at least one RETURNED collision and at least one spoil. A post-game poll gets at least 3 of 4 votes saying "I avoided the obvious gift on purpose."
