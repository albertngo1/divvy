## Overview

Two Piles is a 3-player silent categorisation game. The host TV shows eight items (words, icons, or photos: HAMMER, MOSS, SAXOPHONE, VENDING MACHINE…). Each player privately drags all eight into two piles of exactly four. The piles have no labels and no meaning — the room wins only if all three players produced the *same partition*, regardless of which pile is which. You are not converging on an answer; you are converging on an unspoken *rule*.

## Problem

Most "match the group" games ask you to guess a popular answer from a list. That's a poll. The interesting version is guessing a shared **boundary**: what carves this set in half in a way that's obvious to everyone yet nameable by no one. You feel the rule before you can say it, and you can't say it anyway.

## How it works

- Each phone (private): the same eight items, shuffled into a **different order per phone**, with a left and right bin whose sides are also randomised per phone. So no one can converge on "top-left goes left" — only on the partition itself. Drag to sort; the LOCK button enables only at a 4/4 split.
- Host TV (shared): a ring of the eight items with chords drawn between pairs. A chord's weight shows how many players (0–3) put that pair *together* — solid for all three, faint for two, absent otherwise. It never shows piles, never shows who, and can never be inverted into anyone's actual split without guessing.
- Loop: everyone locks → server checks partition equality → if not unanimous, the lattice updates and everyone unlocks and re-sorts. No talking, no gestures. Win reveals all three splits side by side and lets the room argue loudly about what the rule *was*.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object holding `{ roomId, items: [8], players: { id: { partition: uint8, seatShuffle: [8], locked: bool } }, round }`.

A partition is an 8-bit mask; canonicalise by flipping so bit 0 is always 0. Equality is then a plain integer comparison — pile-swap invariance falls out for free. State is bytes, so sync is trivial: full mask on every drop, server sequence number, last-write-wins.

The hard part isn't real-time sync, it's the **information budget**. With 3 players and 28 item pairs, a raw co-grouping count is close to invertible — a diligent player could reconstruct the other two splits and the game collapses into arithmetic. Mitigations to tune in playtest: quantise chords to three visual tiers (all / some / none), refresh the lattice only on lock (not live), and force a 4/4 split so the space is 35 partitions — small enough to converge, large enough that brute force isn't the fun path.

## v1 scope

- Exactly 3 players, one item set of 8, forced 4/4 split.
- Per-phone shuffle + per-phone bin-side randomisation.
- Lock → unanimity check → chord lattice refresh; unlimited attempts, 4-minute timer.
- Win screen showing the three partitions overlaid. One hardcoded item set.

## Out of scope

Scoring, multiple rounds, item packs, 4+ players, image items, any chat or emote channel, uneven splits.

## Risks & unknowns

- The item set does all the work: too coherent and round one wins; too arbitrary and nobody converges. Needs maybe 20 sets tested to find the difficulty band.
- Players may deduce partitions from the lattice rather than intuit a rule.
- Silence enforcement is social, not technical.

## Done means

Three phones and a host tab; each phone provably shows a different item order; a room reaches an identical canonical partition within five lock attempts on at least half of tested item sets, and post-game the three players name three different rules for the same split.
