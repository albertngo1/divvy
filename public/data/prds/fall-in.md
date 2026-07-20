## Overview
Fall In is a cooperative human-sorting panic game for 3-5 players in one room. Each phone is a recruit carrying secret information; together they must arrange themselves into a correct left-to-right line before the timer runs out. It's a logic puzzle turned into a loud, physical group scramble because every clue lives in a different person's head.

## Problem
Constraint-satisfaction 'line up in the right order' puzzles are single-player and silent. The itch: make the clues *distributed and private* so the puzzle can only be cracked by pooling them out loud — turning a quiet logic grid into a Devils-&-the-Details shouting match.

## How it works
Each phone privately holds two things: an ATTRIBUTE (a colored badge + a number, e.g. RED / 4) and one CONSTRAINT about where you must end up in the final line — and every constraint references OTHER players' attributes you cannot see: *'Stand to the RIGHT of RED.' 'Be at an END.' 'Have exactly one person between you and badge #4.'*

Because your rule names hidden attributes, you're forced to announce yours and interrogate the room: 'Who's red?' 'I'm number 4!' Players physically shuffle into a line facing the TV, and each sets a POSITION stepper (1..N) on their phone to claim their slot. The server checks all constraints against the claimed permutation live.

PRIVATE per phone: your attribute, your secret constraint, your position stepper. SHARED TV: N slots each with a lock icon (empty / conflicted / satisfied) and a count of how many constraints are green — it NEVER reveals the attributes or constraints. When every slot is uniquely claimed, all constraints are green, and the arrangement holds for 3 seconds, the platoon 'falls in' and wins.

## Technical approach
A Durable Object room holds `players[]` with `{attribute, constraintSpec, claimedPos}`. On every claim change the server re-evaluates each constraint predicate over the current permutation and broadcasts only aggregate state — per-slot lock status and green count, never raw private info. Sync is trivial (small state, no tight timing window); the buzz is instant. The genuinely hard part is *generation*: producing a constraint set that (1) has exactly one satisfying order, (2) is solvable only by pooling every player's clue, and (3) guarantees each constraint references an attribute held by someone else so voice is unavoidable. Approach: sample a random target permutation, emit constraints entailed by it, then verify uniqueness with a brute-force solver over N! (tiny for N≤5).

## v1 scope
- 3 players, 3 constraints, exactly one solution
- Colored-badge + number attributes
- Position stepper claim + live conflict flash
- 3-second stable-hold win

## Out of scope
- Multiple rounds, scoring, leaderboard
- Imposter/sabotage variant
- Sensor-enforced real physical position (position is self-claimed)
- More than one attribute per player

## Risks & unknowns
- Could collapse into a silent solve if constraints don't force talk — mitigated by guaranteeing every constraint names a hidden attribute.
- Uniqueness generation is fiddly; may need retries per puzzle.
- 3 players may be trivially easy — tune toward 4-5.

## Done means
Three phones each show a distinct attribute and secret constraint, players interrogate aloud and claim positions, the server verifies the one correct order, two claiming the same slot flash a conflict, and holding the correct arrangement 3 seconds flips all locks green with a FALL IN screen on the TV.
