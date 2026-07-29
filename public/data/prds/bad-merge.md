## Overview

A 5-player, one-round, ~8-minute hidden-role game for a living room with a TV. The table must build a correct ranking of the five people in it, on a number each person actually looks up on their own phone. All the information needed exists in the room — distributed two facts per player. Exactly one of those facts is a lie, and the person holding it has been told they're lying without being told which of their two facts it is.

## Problem

Ranking games (Wavelength, Herd Mentality) have no ground truth, so they collapse into whoever talks loudest. Social deduction games have ground truth but the imposter's advantage is pure freedom to invent. Nobody has built the version where the corruption is *in the data*, the truth is checkable at the end, and the imposter can't self-correct because they don't know which of their own beliefs is false.

## How it works

1. **Seed (45s).** Every phone privately shows the same nosy, verifiable prompt: *"Open Mail. How many unread emails do you have right now? Type the number."* Nobody — not even the TV — sees any number. The TV shows only `4 / 5 in`.
2. **Deal.** The server sorts the five numbers into a true total order. With 5 players there are exactly 10 pairs, so it deals every pair once: each phone privately receives **two** pairwise facts about *other* players (`MAYA has more than DAN`), never involving itself. Before dealing, the server reverses one edge — chosen from a **non-adjacent** rank pair, which guarantees the lie sits inside at least one intransitive 3-cycle. That edge's holder additionally sees: *"You are the Bad Merge. One of your two facts is a lie. You are not told which."*
3. **Talk (4 min).** Open discussion. The TV shows five name chips in an ordering rail. Any phone can privately compose a proposed reorder and push it; it becomes the standing order once three phones tap AGREE. The TV shows agreement lamps, never who proposed what.
4. **Lock & accuse.** The order locks; every phone privately names the Bad Merge. The TV reveals the true numbers, one at a time, slowest reveal last.

**Private (phone):** your number, your two edges, your role flag, your proposals, your accusation. **Shared (TV):** intake count, the standing order, agreement lamps, the reveal.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs both hold a WebSocket. State: `{phase, players[{id,name,value,rank}], edges[{hi,lo,holderId,corrupted}], standingOrder[], agreements:Set, votes{}}`. Numbers never leave the DO until reveal; each edge is written only to its holder's socket, so a leak is a socket-log bug, not a race.

Sync is trivial (a few events per minute). The genuinely hard part is **dealing**: find an assignment covering all 10 pairs where every player holds 2 edges and neither touches themselves, *and* the corrupted edge is non-adjacent in true rank. Rejection-sample random assignments with a feasibility check and a retry cap. Second hard part: **ties**. Two players with the same number make the truth ambiguous and the reveal a fistfight — break ties server-side and disclose the tiebreak on the reveal screen.

## v1 scope

- Exactly 5 players, one round, one hardcoded seed question
- Typed names at join; no avatars, no reconnect, no rejoin
- One ordering rail, three-tap agreement, one accusation vote
- Reveal screen with true numbers and Kendall-tau score

## Out of scope

Question decks, other player counts, multiple rounds, spectators, in-app chat, animation polish, persistent profiles.

## Risks & unknowns

Self-reported numbers are unenforceable (mitigation: reveal asks everyone to hold up their screen — social, not technical). A disciplined table might mechanically recite all ten edges and solve it in 90 seconds; the design bets that the resulting 3-cycle leaves three edge-holders in a genuine three-way standoff, which is the game. Untested: whether the Bad Merge's uncertainty reads as suspicious hedging or as useful cover.

## Done means

Five phones and one TV complete a round end-to-end. An assertion over 1,000 simulated deals shows the corrupted edge always lies in ≥1 cycle and no player ever holds an edge about themselves. A socket transcript confirms no phone receives another player's raw number before reveal. In 3 of 5 playtests the room spends ≥60 seconds arguing about which cycle member is lying.
