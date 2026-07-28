## Overview
A silent convergence game for three players. The TV shows a menu of twelve items; every phone shows a private version of that menu where three different items are struck through as OUT OF STOCK. All three must simultaneously order the *same* item — which means finding something that exists on all three shelves, without being able to ask.

## Problem
Most "pick the same thing" games are pure focal-point games: you converge on the obvious answer and it's over in one beat. The interesting version is when the obvious answer might not *exist* for someone at the table, and you have no way to find out except by burning a guess. This game turns failure into the information channel.

## How it works
PRIVATE (phone): your shelf — the same twelve items in the same layout as the TV, three of them greyed and untappable, chosen per player so no two players share a gap. You tap one item and lock. You never see anyone else's shelf, gaps, or pick.

SHARED (TV): the twelve items, plus permanent marks accumulated across attempts. Nothing during the attempt except a "2/3 locked" counter.

On reveal, the server does *not* say who picked what. It marks each of the picked items only:
- **Red X** — this item was out of stock on at least one shelf. It is now dead for everyone.
- **Green CONFIRMED** — this item was on all three shelves. Still live, and now known-universal.

So a failed attempt is never wasted: either you've killed a phantom or you've certified a candidate. The arc is two-phase — first map the intersection, then agree on a single focal point inside a shrinking set of confirmed items, still without a word. Four attempts max. Win = all three lock the same item.

The cruelty is that the most attractive item (the funniest, the most obvious) is exactly the one the generator likes to remove from someone's shelf.

## Technical approach
Host browser tab + phone PWAs + PartyKit / Durable Object room over WebSocket, server authoritative.

Data model: `Room { code, items[12], attempt, marks: {itemId → 'dead'|'confirmed'|null} }`, `Player { id, missing: itemId[3], lockedPick }`. The `missing` sets are generated disjointly at room start and are the one piece of state the server never broadcasts. Phones receive only their own shelf mask.

Sync strategy is simple and that's the point: locks are individual messages, the server holds them until all three arrive (a barrier), then computes marks and broadcasts one reveal event. No real-time streaming, no clock sync. The hard part is *information hygiene* — the phone client must never receive another player's mask or pick, even transiently, because a curious player with devtools ruins the whole premise. Everything derived is computed server-side; the client gets a mask and a mark table, nothing more.

Items are hand-authored short evocative nouns with deliberately uneven attractiveness, so focal points exist and can be sabotaged.

## v1 scope
- 3 players, one game, 4 attempts, 12 hand-written items
- Disjoint 3-item gaps, uniformly random
- 30-second lock timer per attempt (auto-lock on a random available item)
- Reveal screen with red X / green CONFIRMED marks; win screen shows all three shelves overlaid

## Out of scope
- 4+ players, variable gap sizes, item packs, scoring across games
- Any chat, emoji, or signalling affordance
- Persistence between sessions

## Risks & unknowns
The endgame may collapse to "pick the lowest-numbered confirmed item," a boring convention the room discovers once and reuses forever — mitigation is scrambling per-phone item order so ordinal conventions don't transfer. Four attempts may be too generous or too tight. Twelve items may be too few for the deduction to feel like deduction rather than luck.

## Done means
Three phones, no talking: a room reaches a matched order within four attempts more often than not across five playtests, and at least one of those wins visibly hinges on a red X the room learned from a previous failure.
