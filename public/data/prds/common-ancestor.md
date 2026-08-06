## Overview
A 3-player simultaneous drafting game where collisions are retroactive and back-loaded in mercy. Everyone builds a 4-stage machine from the same six-part bin. Nothing is revealed until the end. Then the three builds are laid side by side, and any stage where two players grabbed the same part scores zero for both — and worse, kills your multiplier, which is the length of your *clean run starting at stage one*. A stage-4 clash stings. A stage-1 clash guts you.

## Problem
Most anti-coordination games treat every collision as identical: you both lose the thing. That flattens the decision — round three plays exactly like round one. Making the *timing* of the collision the punishment turns the whole arc into a diverging-then-relaxing shape: stage one is a knife fight over the safest-looking part, and by stage four everyone stops caring and grabs whatever they actually want. That arc doesn't exist in a passed-phone game, because the whole thing is simultaneous secret commitment.

## How it works
1. TV shows six parts (Flywheel, Bellows, Antenna, Claw, Vent, Ballast) with big art. Public and identical for all.
2. Each phone privately shows **your value card**: each part is worth 1–5 points *to you only*. Cards differ; overlap is deliberate, so the tempting part is often tempting to two of you.
3. Four stages. Each stage, all three privately tap one part within 20s. You may reuse a part you already used.
4. **Nothing resolves.** Between stages the TV animates a cumulative unattributed **wear meter** per part — total taps so far, all players, all stages, revealed in randomized order. A meter reading "2" is ambiguous: one player using a part twice, or two players clashing once. That ambiguity is the entire read.
5. Final reveal: three chains side by side. Same part at the same stage = collision; both score 0 for that stage.
6. Score = (sum of your private values for surviving stages) × (1 + number of clean stages counted forward from stage 1). Clean sweep = ×5.

## Technical approach
PartyKit Durable Object holds `{stage, parts[6], players: {id, valueCard[6], picks[4], locked}}`. Value cards are generated server-side at room start and pushed only to their owner — the host tab never receives them, so a screen-shared TV can't leak them.

Sync is easy (one commit per player per 20s); the hard part is **leak suppression**. Naively streaming wear-meter deltas as picks land reveals pick order and therefore attribution. So the DO buffers all three picks, waits for the stage barrier, then emits one shuffled batch of meter increments with randomized animation delays. Same for lock indicators: the TV shows only a count ("2 of 3 committed"), never who, since knowing that Player B locked instantly is real information about how contested their choice felt. Timeouts auto-commit the currently highlighted part so a stalled phone can't hold the barrier.

## v1 scope
- 3 players, one game, four stages, six hardcoded parts with emoji art.
- Server-generated random value cards, 20s stage timer with auto-commit.
- Wear meter with shuffled batched reveal.
- One final side-by-side reveal screen with the multiplier math shown as arithmetic.

## Out of scope
4+ players, multiple games, part abilities, themed part sets, rematch, persistent scoring, any animation budget beyond CSS transitions.

## Risks & unknowns
Biggest: with six parts and three players, stage 1 may just be a 1-in-3 dice roll that decides the game — needs playtesting on bin size (eight parts may be right). The wear meter may be too weak a signal to support real deduction across only four stages. And the reveal has to be theatrical or the deferred-resolution structure feels like a spreadsheet.

## Done means
Three phones join, each gets a distinct private value card the host never sees, four stages commit blind with correct barrier behavior, the wear meter never leaks pick order under a deliberate "one player stalls 19s" test, and the reveal screen computes collisions and the clean-run multiplier matching a hand-worked example.
