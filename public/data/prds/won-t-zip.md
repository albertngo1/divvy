## Overview

Survival-horror inventory management — the Resident Evil 4 attaché case, the Tarkov rig — turned into a 90-second, 4-player, one-round scramble. The TV holds one communal pile of oddly-shaped loot. Each phone holds a private case with a different shape. You grab from the shared pile in real time and pack in private, and at the buzzer every case zips open at once.

For groups of 3–5 who like a game that is mostly panic and one big reveal.

## Problem

Inventory Tetris is one of the most compulsively satisfying loops in games and it is always played alone, at zero stakes, with the game paused. Two things fix that: a clock, and other people's hands in the same box. The private grid is also what makes table talk worth anything — "I don't need the long one" is only interesting when nobody can check.

## How it works

The **host TV** shows the pile: ~24 items, each a small polyomino with a printed value (a 1×4 rifle, a 2×2 medkit, a 1×1 battery), arranged in a grid, plus a 90-second countdown. When an item is claimed, it flies off the TV in the claimer's color — so the room sees *what* you took but never *where it went*.

**Each phone privately shows** your case: a grid whose shape is yours alone (an L-shaped case, a narrow tall one, a wide one with two dead cells riveted in the middle). It also shows the item currently in your hands and your running score. Nobody sees anyone's grid until the buzzer.

The loop, all four players simultaneously: tap an item in the pile strip to claim it → first claim wins, losers eat a 1.5s fumble lockout and watch it grey out → the item lands in your hands → tap to rotate, tap a cell to place. **You cannot claim while holding something.** That's the whole tension: packing skill is the throttle on greed, so the person hoarding rifles is quietly falling behind while shouting that they're winning.

At zero, the TV zips open all four cases side by side, animates unplaced items falling out worthless, and totals the values.

## Technical approach

PartyKit / Cloudflare Durable Object, one room per party code; host browser tab plus phone PWA clients over WebSocket.

State: `{ pile: [{id, shape, value, claimedBy}], players: [{id, color, caseMask, cells: [{itemId, x, y, rot}], holding}] }`. The DO is single-writer, so claim ordering is trivially serialized — no locks, no CRDT. `caseMask` and `cells` are sent only over the owning player's socket; the host tab gets pile state and claim events only, and receives all grids in one payload at the buzzer.

Placement is validated server-side against the case bitmask (rotate the polyomino, AND against occupied ∪ dead cells). Clients place optimistically and roll back on reject, which matters because a bad rotation at 88 seconds must feel instant.

The hard part isn't throughput — it's making a lost race *legible*. Two players tapping the same rifle 80ms apart both see it highlight. Mitigation: local "reserving…" state (dimmed, not owned), server receipt order decides, and the loser gets a 300ms animation of the item flying to the winner's color before the lockout, so it reads as "they beat me" rather than "the app glitched." Second hard part: rotate-and-place on a 6" screen with adrenaline — tap-to-rotate, snap-to-cell, generous hit targets, no pinch, no drag.

## v1 scope

- 4 players, one 90-second round, one shared pile of 24 items
- 5 polyomino shapes total, values 1–5
- 3 distinct case shapes dealt at random (two players may share one)
- Claim → hold → rotate → place; one item in hand at a time
- Buzzer, zip-open reveal, single scoreboard. No rounds 2+.

## Out of scope

Private constraint cards ("green scores double," "oil can't touch food"), stealing from another player's case, trading, item weight, consumables, more than 5 players, persistent profiles, sound design beyond a buzzer.

## Risks & unknowns

- Packing may be too easy at 24 items — pile size and case area need tuning so the average case ends ~85% full.
- Fast packers may snowball; unclear whether the hold-blocks-claim rule is enough friction.
- The verbal lying only emerges if players notice their cases differ — the reveal must make asymmetry obvious the first time.
- Contested-claim fairness over hotel wifi at 200ms+ RTT.

## Done means

Four phones join a code and run one 90-second round to the buzzer with all four cases zipping open on the TV and a correct total. Specifically testable: two players tap the same item within 100ms and exactly one gets it, the loser sees it fly away in the winner's color and is locked out for 1.5s, and an item left in hand at the buzzer is animated as dropped and scores zero. Playtested once with 4 people who did not read instructions first.
