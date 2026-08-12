## Overview
A 5-player, ~7-minute deduction game for a TV and five phones. The room writes the evidence, the server shuffles the authorship, and each phone is dealt a partial, mostly-true map of who wrote what. One map is poisoned. Catching it requires people to spend the information they hold.

## Problem
Most "imposter sees a different screen" games hand innocents a complete, correct view, which means the innocents' job degenerates into reciting facts until the odd one out contradicts them. If everyone's view is partial *and* the corruption is a swap rather than a deletion, the imposter's false belief is internally coherent — it looks exactly like a confidently held true belief until it collides with someone else's slice.

## How it works
**Phase 1 (60s, private):** the TV shows a prompt ("Type two short claims about anyone in this room — true or not"). Each phone privately types two lines. Nobody sees anyone else's typing.

**Phase 2:** the TV shows all ten lines, numbered and shuffled, with no names, permanently. **Each phone privately shows** a *byline slice*: four line numbers with an author's name beside each, always including your own two. Four players' slices are entirely true. The imposter's slice contains one transposed pair — two lines within their slice have had their authors swapped — and their phone tells them only: *"One byline on your screen is wrong. You don't know which."*

**Phase 3 (3 min, open talk):** any player may tap a byline in their slice to **publish** it. The TV appends it to a public ledger ("Maya says #7 is Ben") and shows each player's `published X / 4` count, so hoarding is visible. Any other player may **challenge** a published byline; the named author's phone lights up with *That's mine / Not mine*, and their answer resolves publicly and truthfully. A correct challenge costs the publisher a point; a wrong challenge costs the challenger one.

So the imposter is squeezed: publishing scores and looks cooperative, but one of their four bylines is a landmine, and they can't tell which. Sitting on all four is a scoreboard-visible tell. Innocents can bait — publishing a byline they hold that overlaps someone else's slice forces a comparison.

**Phase 4:** one simultaneous vote. Majority hits the imposter → innocents win. Otherwise the imposter wins.

## Technical approach
One PartyKit Durable Object per room owns the only complete authorship map and never sends it anywhere:

```
Room { code, phase, deadlineTs,
       lines: [{ id, text, authorId }],          // server-only authorId
       slices: { playerId: [{ lineId, claimedAuthorId }] },
       ledger: [{ seq, publisherId, lineId, claimedAuthorId, status }],
       imposterId }
```

Slice generation runs server-side after phase 1: deal each player four line ids covering their own two plus two random others, then for the imposter pick two slice entries whose true authors differ and transpose them (retry the deal if no valid pair exists). Every phone gets only its own `slices[me]` — the projection happens per connection, so a devtools-open phone still learns nothing extra.

Sync is server-authoritative with a monotonic `seq` on the ledger. The genuinely hard part is the challenge/resolve race: two players can challenge the same ledger entry within the same 100 ms, and the named author must be asked exactly once. The DO takes a per-entry lock, assigns the first challenger, queues or rejects the second with a visible "already challenged" toast, and holds a 15-second timeout on the author's response that resolves to "unanswered" rather than hanging the round.

## v1 scope
- Exactly 5 players, one prompt, two lines each, four-byline slices.
- One transposed pair; imposter told a swap exists, not where.
- Publish / challenge / author-resolves loop with a single 3-minute clock.
- One vote, win-lose screen, no cross-round scoring.
- No profanity filter, no reconnect, no spectators.

## Out of scope
Multiple rounds, variable player counts, multiple imposters, richer corruptions (deletions, phantom lines), typing on the TV, any persistence beyond the live room.

## Risks & unknowns
Whether five improvised lines are distinctive enough that authorship is guessable at all — flat, generic lines make the ledger meaningless. The imposter may be able to publish only their two self-authored bylines (guaranteed safe) and coast; may need to require that published bylines name someone other than yourself. Also unclear whether 3 minutes is enough discussion for a swap to surface, or whether overlap in slices needs tuning upward.

## Done means
Five phones join, type, receive five distinct slices with exactly one poisoned, and play a full round where publishing appears on the TV ledger in under 300 ms, a challenge routes to the correct author's phone and resolves truthfully, and the round ends with a vote that correctly identifies the imposter at least sometimes in live play.
