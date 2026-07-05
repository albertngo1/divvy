## Overview
A silent, real-time hidden-role sorting game for 4–6 players. A shared row of tiles sits on the TV; every phone privately shows the 'correct' order to arrange them into — but the imposter's target is off by one swap. Rearrange in silence, then hunt the player who kept pulling the board somewhere slightly wrong. For groups who want deduction with zero talking during play.

## Problem
Deduction games lean almost entirely on talking and lying. The itch: a purely **behavioral** tell — can you spot a saboteur from their moves alone, when everyone shares nearly the same goal? And can the imposter hide a single divergent intention inside collaborative chaos, with no cover story to slip up on?

## How it works
The host screen shows 6 shuffled tiles in a row (e.g. films to sort by year, or swatches by shade). Each phone privately shows a **target-order card**. Crew all get the identical target; one **Imposter** gets a target with two adjacent tiles swapped — and the Imposter alone is told they're the imposter and must steer toward *their* order without being caught. Silent phase (75s): players take turns round-robin, 5s each, tapping two tiles on their phone to swap them on the shared board. No talking. The board lurches toward consensus, but the imposter's swaps occasionally fight the crew — undoing a pair others just fixed. When time ends, discussion opens, then a private vote. Crew win by voting out the imposter; the imposter wins by surviving, with a bonus if the board ended in their order.

Private per phone: your target-order card, your swap controls on your turn. Shared: the live tile row, whose turn it is, the timer, the vote.

## Technical approach
Host tab + phone PWAs + authoritative WS server. Data model: `Room{code, tiles[], boardOrder[], targetCrew[], targetImposter[], imposterId, turnQueue, turnDeadline, phase, votes}`. Server owns `boardOrder` and validates every swap (only the current-turn player, only two tiles). Broadcast `boardOrder` to everyone on each swap; broadcast targets **only privately** to each phone. Sync: authoritative turn timer, optimistic tile animation on the host reconciled to server truth. Hard part: turn hand-off must feel instant and fair across 4 phones, and swaps must serialize cleanly so two intents never race — the server is the single source of truth and phones send intents, never mutate state.

## v1 scope
- 6 tiles, single hardcoded ordering puzzle, 4 players, one imposter
- 75s silent round, round-robin turns, one discussion + vote, win/lose

## Out of scope
- Multiple rounds, free-for-all swapping, multiple imposters
- Generated tile sets, in-game chat, elaborate imposter victory conditions

## Risks & unknowns
Balance is the big one: if crew share an identical target, convergence may be too clean and the imposter's one bad swap too obvious — may need a bigger diff, partial info, or decoy tiles; it could also read as pure chaos. Turn-based may feel slow (free-for-all with cooldown is the alternative). Silence is enforced socially, not technically.

## Done means
Four phones each get a private target (one swapped), players swap the shared board in turns under a server timer, the board updates in real time for all, a vote resolves, and the imposter is revealed — validated by one playtest where reading the swaps actually informed the vote.
