## Overview
Blur Radius is a 3–5 player confession game where the win condition is **not being identifiable**. Everyone starts with something true and specific about themselves and coarsens it until it collides with someone else's. Statements that end up true of two or more people get printed, unattributed, on a shared card. Statements that stay unique are deleted unread — by anyone, including the host. It is k-anonymity as a parlor game.

## Problem
Confession games (Truth or Dare, Never Have I Ever) trade intimacy for exposure: the reward for being honest is being the person everyone stares at. Blur Radius inverts it — honesty is only *publishable* when someone else shares it. You get the intimacy of the disclosure and the safety of the crowd, and the crowd is the point.

## How it works
**Round 1 — Commit.** The host screen shows one prompt: *"the last time you cried."* Each phone privately fills three slots from authored menus:
- WHEN: `Tuesday, 11pm` → `a weeknight` → `this month` → `sometime`
- WHERE: `in my car` → `in a vehicle` → `alone somewhere` → `somewhere`
- WHY: `a phone call` → `something someone said` → `other people` → `a reason`

Each slot has 4 levels. Level 0 = razor specific. Level 3 = vacuous.

**Round 2 — Blur.** Two 45-second passes. Each phone privately raises or lowers its own slot levels. After each pass the server checks, for each player, whether any *other* player's statement matches exactly at both players' chosen levels. Your phone shows one private line: **"1 other person is here with you"** or **"you are alone."** It never shows who.

**The budget.** You can't just max-blur everything: the card only accepts statements whose total specificity (12 minus the sum of levels) is ≥ 4. So you must stay sharp *somewhere*, and guess where the room is likely to be sharp with you.

The host screen shows only an anonymized lattice cloud — dots migrating up the generalization tree, merging — and a covered/uncovered count. No names, ever.

**Ending.** Covered statements print on a dated card; uncovered ones are shown as a struck-through blank and dropped from server state. Nobody wins. You either made the card or you didn't, and nobody knows which line was yours.

## Technical approach
PartyKit Durable Object holds `players[id] = {slots: [leafId, leafId, leafId], levels: [0-3]×3}`. Generalization hierarchies are static JSON trees; a statement's value at level L is `ancestor(leaf, L)`. Matching is exact tuple equality after lifting — cheap, O(n²) over ≤5 players, recomputed every commit.

Sync is easy; the hard part is **leak control**. With 3 players, "1 other is here" narrows to two candidates, and any timing correlation between someone's UI change and your counter flipping leaks identity. Mitigations: counts only, batched at pass boundaries (never live), a fixed reveal tick so all counters update simultaneously, and TV dots shuffled every frame so you can't track one.

## v1 scope
- 3–5 players, ONE prompt, one 3-slot schema, two blur passes
- ~40 hand-authored leaf options across 3 trees
- Private counter with two states: *covered* / *alone*
- PNG card export via QR; server state purged on export

## Out of scope
- Free-text answers, LLM generalization, multiple prompts, rejoin, persistence, guess-who phase (would destroy the premise)

## Risks & unknowns
- Hand-authored menus may not contain anyone's actual truth — the leaves must be broad and a little funny
- 3 players may be too few for real anonymity; 4 may be the true floor
- Tone risk: the prompt must be poignant, not traumatic

## Done means
Four phones join, each privately builds a statement, two blur passes run with synchronized counter reveals, at least one pair merges, and the TV prints a dated card containing only covered statements while the uncovered ones are provably gone from server state.
