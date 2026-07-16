## Overview
Slice is a cut-and-choose fair-division party game for 4-5 in one room, host screen plus private phones. It turns "I cut, you choose" — the argument-prone, table-talk-heavy classic — into a fast, silent battle of hidden tastes and simultaneous grabs.

## Problem
Fair-division and open drafting devolve at the table: slow negotiation, telegraphed reaches, and one loud person steering everyone. The tension only works if valuations are secret and everyone commits at once — impossible with a shared board and open hands.

## How it works
The host TV shows 6 quirky Loot cards (a red gem, a "7", a skull, a crown, etc.). One player is the Divider this round. On the Divider's phone ONLY: drag the 6 cards into exactly 3 Bundles, any split. Meanwhile each of the other 3 players (Choosers) privately holds a secret Taste card — different for everyone (e.g. "+3 per red, −2 per number"). When the Divider locks the split, the host reveals the 3 bundles face-up, and the Choosers each privately and simultaneously tap the bundle they want (10-second timer, blind to others' picks).

Resolve: a bundle claimed by exactly one Chooser → they take it, scored by their private Taste. A bundle claimed by two or more → contested, DISCARDED, nobody gets it. The Divider keeps every unclaimed bundle. So the Divider wants to build bundles that make Choosers collide (denying them) or leave a bundle so unloved it falls to the Divider; Choosers must guess where the others WON'T go. Private per phone: the Divider's drag UI, each Chooser's Taste card, and every tap — all hidden until reveal. Host shows only the pool, the locked bundles, and the simultaneous grab.

Load-bearing: with public or sequential choices (one passed phone) everyone just avoids taken bundles and the collisions vanish. Simultaneous hidden claims over privately-valued loot ARE the game.

## Technical approach
Host + phone PWAs + authoritative WS server. Model: Room{loot[], bundles[[]], dividerId, phase}; Player{id, taste(secret), claim}. Phases: DIVIDE (only the divider's socket may mutate bundles) → CLAIM (choosers submit one bundleId, server withholds all until everyone's in or the timer fires) → RESOLVE (server computes uniqueness and scores). Sync is turn-gated, so the hard part isn't throughput — it's claim-reveal integrity: the server must buffer claims and reveal atomically so no phone can time its tap off a leaked signal. Claims are never broadcast until the phase flips.

## v1 scope
- 4 players: 1 Divider + 3 Choosers, one round
- 6 loot cards → 3 bundles
- Fixed simple Taste cards, dealt secretly
- Host score readout at reveal

## Out of scope
- Rotating the Divider across rounds
- Variable bundle counts, trading/negotiation
- Tie-breaks beyond "discard", 6+ players

## Risks & unknowns
- Divider power may need tuning (bundle count vs. chooser count)
- 3 choosers + 3 bundles can make collisions too rare or forced
- Taste cards must be legible in a glance

## Done means
The Divider drags 6 cards into 3 bundles on their phone only; each Chooser sees a private Taste and taps simultaneously; a solo claim awards and scores the bundle; a double claim discards it; the Divider banks the leftovers; and the host shows a correct final tally.
