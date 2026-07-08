## Overview
Pecking Order is a silent-consensus game for 3–5 players. Shared host screen + private phone controllers. Everyone independently ranks the same small set of items; the room must converge on one identical ranking with no talking.

## Problem
Ranking arguments ('rate these snacks best-to-worst') are fun but instantly become a shouting match. The itch: force the *same* consensus to emerge silently, where each player only ever sees pressure, never anyone's actual list — so agreement has to be inferred and chased.

## How it works
Each phone PRIVATELY shows the same 5 item cards (e.g. 🍕🌮🍔🥗🍣) as a vertical drag-to-reorder list. You freely reorder anytime; it's live state, not a submit. Nobody sees anyone else's order.

The server computes pairwise agreement across all lists. The HOST screen shows ONLY: a 'HARMONY: 70%' meter (based on average Kendall-tau agreement) and the single most-contested ADJACENT pair — 'the room can't agree whether 🌮 or 🍔 goes higher' — shown as two cards flickering against each other. It never shows anyone's ranking. Players read the flicker, privately guess how the majority leans, and nudge that one swap, over repeated silent passes, until all lists collapse to one.

The per-phone private, simultaneously-editable ranking is load-bearing: pass one phone around and it's just one person sorting a list — the game IS the hidden parallel disagreement being squeezed out.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / DO). Data model: `items[5]`; per-player `order: itemId[]`. On each reorder, the DO recomputes average pairwise Kendall-tau → `harmonyPct`, and finds the adjacent-position pair with maximal cross-player rank-order variance → `hottestPair`. Win when all `order` arrays are identical. Sync is trivial (short arrays, a few messages/sec). The hard part is again feedback tuning: surfacing exactly one actionable contested swap so progress is possible without leaking full rankings, and avoiding oscillation where two swaps trade the 'hottest' title forever.

## v1 scope (humiliatingly small)
- 3 players, 5 fixed food emoji.
- One round, no timer.
- Host: harmony meter + one flickering adjacent pair.
- Win = all three orders exactly identical, held 2s.

## Out of scope
- Custom/loaded item decks, more items, scoring, multiple rounds.
- Any reveal of individual orders (even post-game beyond the final consensus).
- Weighting/ties; every list is a strict total order.

## Risks & unknowns
- With 5 items and 3 players it may converge trivially or stall on a 2-vs-1 deadlock with no tiebreak — item count and player count need playtest.
- The 'hottest adjacent pair' signal may thrash; likely needs smoothing/hysteresis to be readable.
- Silent ranking of subjective items risks a genuine impasse (no majority exists) — need a graceful 'near-consensus' fallback so the round can end.

## Done means
3 phones each privately drag-rank the same 5 cards, the host shows only harmony + one flickering pair, and the instant all three private orders match, the host reveals the single agreed ranking — no individual list ever shown mid-round.
