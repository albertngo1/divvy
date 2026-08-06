## Overview
Number Four is a 4-player hidden-view deduction game: one shared host screen, four phones. Every phone privately shows the same six items ("cold pizza for breakfast", "a fully charged phone", "your ex's new haircut"). One player's list contains the same six items in a *different order*. Nobody is told who. Out loud, players may refer to items **only by number**. For groups who love The Chameleon but hate that the chameleon knows they're the chameleon.

## Problem
In most hidden-role games the imposter is handed a comfortable secret: *you are the liar, now perform*. That collapses the game into acting talent. The genuinely interesting cognitive state — *everyone in this room is confidently wrong and I can't tell whether it's them or me* — is rarely reachable, because the odd player is normally told they're odd. Number Four withholds that.

## How it works
1. **Deal.** Server picks six items, publishes them to no one. Each phone privately renders the list numbered 1–6. Three phones get the canonical order; one gets a permutation with minimum displacement 4 (no item stays put in more than two slots).
2. **Prompts.** The host screen shows three prompts in sequence, 30s each: "Which would you defend in a fight?", "Which is most overrated?", "Which would you delete from the universe?" Each phone privately submits **a number**.
3. **The wall.** The host screen shows only the raw numbers, tagged with player names. No item text ever appears on the TV during play.
4. **Argue (3 min).** Free discussion, numbers only. "6 is indefensible." "You said 6 was overrated *and* you'd fight for it?" The odd player is arguing sincerely about different objects. Any phone can tap **Named It** if a player speaks an item aloud; two independent flags inside 5 seconds cost that player a point.
5. **Accuse.** All four phones simultaneously name one suspect, plus an optional private "It's me" claim.
6. **Reveal.** The TV finally prints both lists side by side, aligned, with every submitted number resolved into its actual item — so the room re-hears the whole argument at once.

Scoring: innocents +2 each for catching the odd player; odd player +4 for surviving, +3 extra for a correct self-claim (they can win big by *deducing themselves*).

## Technical approach
PartyKit Durable Object per room; phones are PWA clients over WebSocket; host tab is a read-only subscriber with a distinct `role=host` token. Data model: `Room {itemIds[6], canonicalOrder, players[{id,name,permutation,submissions[]}], phase, flags[]}`. Permutations live server-side only; a phone receives just its own rendered list, and submissions travel as **indices**, resolved to item IDs server-side. The host socket is never sent any player's permutation until `phase === 'reveal'`, so a screengrab of the TV can't leak the answer.

The hard part is leak-safety on reconnect: a dropped phone must resume with the *same* permutation and no extra state, and a phone that reconnects as the host role must be refused. Second hard part: simultaneous accusation — collect all four, hold, then broadcast one atomic reveal frame so nobody sees a partial tally. Flag timing uses server receipt order with a 5s tumbling window, not client clocks.

## v1 scope
- Exactly 4 players, exactly one round, one fixed pack of 6 items
- 3 prompts, hardcoded
- Named It flag, no appeals
- One accusation, one reveal screen, then the game is over
- No lobby art, no avatars, four-letter room code

## Out of scope
Multiple rounds, more than one permuted phone, custom item packs, spectators, rejoin after game end, persistent scores, audio.

## Risks & unknowns
The permutation may fail to bite if the room's opinions are flat — mitigate with polarizing items. Four players is thin: one confused innocent reads as guilty. Numbers-only speech may feel like homework in the first 60 seconds; the host screen should model it with example phrasing.

## Done means
Four phones join by code; each shows a numbered list; exactly one differs by ≥4 positions; three prompts collect indices; the TV shows numbers and never item text before reveal; accusations resolve simultaneously; the reveal screen shows both orderings aligned. A playtest group of four reaches at least one moment where two players argue past each other about the same number.
