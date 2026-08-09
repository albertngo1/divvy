## Overview

A 40-second silent co-op for exactly three people in a room with a TV. Three plants are dying on a shelf. Everyone must water one plant every tick. Watering is good; watering the *same* plant as someone else kills it outright. The room wins only if all three plants survive five ticks. It is a game about being unable to help without stepping on the person helping beside you.

## Problem

Co-op party games reward doing the obvious right thing together. Real group failure looks nothing like that: everybody sees the same emergency, everybody rushes it, and the emergency dies of attention while a quieter problem starves. No party game makes over-helping the loss condition.

## How it works

**Host screen (shared).** A shelf with three unlabeled plants, each with a deliberately coarse public status — FINE / DROOPING / WILTING (25% buckets). A tick clock counting 6 seconds. After each tick, a 1.5s replay naming exactly who watered what.

**Each phone (private).** Two things nobody else sees:
1. Your **ward** — one named plant whose *exact* moisture number you watch live, updating in real time.
2. Three buttons, one per plant. You must commit before the tick boundary; no choice means the server picks for you.

Ward assignment is the trap: in v1 two players secretly share a ward and one player is alone on a different plant. Nobody is told how the wards are distributed.

**Resolution per tick.** Every plant loses 12–20 moisture. A plant watered by exactly one player gains 35. A plant watered by two or more **rots and dies immediately**, whatever its level. A plant at 0 dies of thirst. Five ticks, no talking, then a verdict.

The coarse public bars manufacture the pile-on — all three players read WILTING and lunge. The private ward numbers make it worse: the two players sharing a ward hold identical information and must take *different* actions with no way to negotiate. The post-tick replay is the only channel; from it you infer who your twin is, and then neither of you knows who should yield.

## Technical approach

PartyKit Durable Object per room, one room = one authoritative 6s tick loop. State: `plants[{id, moisture, alive}]`, `players[{id, wardPlantId, choice}]`. Clients send `CHOOSE(plantId)`, last-write-wins until the boundary; server resolves and broadcasts one identical resolution packet to host and phones.

The hard part is boundary fairness. The countdown must read the same on the TV and on a phone 200ms behind it, or the room feels cheated. Solution: ping-based clock offset per connection (EWMA over 5 samples), server-side authoritative deadline, and a 500ms visual lockout on the phone *before* the real boundary so a late tap is refused visibly rather than silently discarded. Late packets are dropped deterministically and echoed back as TOO LATE.

## v1 scope

- Exactly 3 players, 3 plants, 5 ticks, one round
- Fixed ward assignment (two share, one solo)
- CSS plants, no art, no audio
- No reconnect, no lobby beyond a 4-letter room code
- One end screen: ALIVE / DEAD per plant

## Out of scope

Variable player counts, mid-round ward reshuffles, plant species, difficulty curve, spectators, persistence, scoring history.

## Risks & unknowns

- The shared-ward pair may converge on a stable alternation by tick 3, making ticks 4–5 flat. Five ticks may be one too many.
- Instant death on double-water may read as unfair; a −40 penalty is the fallback tuning.
- Coarse bars need a tuning pass: too coarse and choices are random, too fine and the private ward stops mattering.
- Silence has to be enforced by host-screen copy alone.

## Done means

Three phones and a TV, one 40-second round. Each phone displays a different exact ward number. At least one plant rots from a double-water in the first playtest. The TV names who watered what within 300ms of every boundary, and the round ends with an unambiguous per-plant verdict.
