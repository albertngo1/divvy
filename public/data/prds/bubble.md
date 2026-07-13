## Overview
Bubble is a browser puzzle game about the one part of the CPU nobody can see but everybody fights: the branch predictor. Each level hands you a short hot loop and a target cycle budget; you reorder branches, hoist conditions, and insert the occasional "useless if" until the animated pipeline runs clean. For programmers who half-understand why branchless code and sorted-input loops are faster and want the intuition drilled into their hands.

## Problem
Micro-architecture is folklore. Everyone has read that mispredicts cost ~15 cycles, that a sorted array makes the same loop 3x faster, that a redundant `if` can *help* — but almost no one has a mental model they can steer. Blog posts explain it once; you forget it by Monday. There's no place to *play* with speculation until it clicks.

## How it works
Each puzzle is a tiny loop in a toy C-like DSL over a fixed input stream (shown as a scrolling tape of taken/not-taken outcomes). A visible 5-stage pipeline animates fetch→retire; a 2-bit saturating-counter predictor (later: 2-level / gshare) sits on top, its state rendered as little glowing counters. When it mispredicts, the pipeline visibly flushes — bubbles ripple through. You edit the code: split a hard-to-predict branch into two easy ones, convert a branch to a conditional-move (branchless), reorder so the biased branch dominates, or add a guard `if` that shortcuts the unpredictable path. Score = retired cycles; stars for hitting bronze/silver/gold budgets. Solutions are shareable as a seed + diff, Wordle-style.

## Technical approach
Pure client-side TypeScript + Canvas/WebGL. The "CPU" is a deterministic scalar pipeline simulator (~400 lines): in-order issue, fixed latencies, a pluggable predictor interface (`predict(pc) -> bool`, `update(pc, taken)`), flush penalty on mispredict. The DSL parses to a tiny bytecode; branches carry a PC so the predictor can key on them. Input tapes are fixed per level so runs are reproducible and scoring is exact. The genuinely hard part is *level design*: hand-authoring loops where the human-obvious rewrite is wrong and the counterintuitive one (redundant if, branchless swap, data reorder) wins — plus tuning the predictor model to be simple enough to reason about yet rich enough to reward real tactics. A calibration harness cross-checks a handful of levels against `perf stat` branch-miss counts on real hardware so the toy doesn't teach lies.

## v1 scope
- 12 hand-made levels, single predictor (2-bit counter)
- DSL with `if`, `for`, comparisons, and a `select` (cmov) primitive
- Animated pipeline + predictor state, cycle counter, 3-tier medals
- Shareable seed+solution string

## Out of scope
- Superscalar/OoO execution, real cache modeling (that's a sequel)
- Arbitrary user code / general compilation
- Multiplayer or accounts

## Risks & unknowns
- The sim must be *simple enough to reason about* yet reward real tactics — the core tuning risk.
- Teaching wrong intuition if the model diverges from real silicon; mitigated by the perf-stat calibration levels.
- Audience may be narrow; mitigate with a gentle tutorial framing ("why sorted arrays are faster").

## Done means
A stranger who has never heard of branch prediction can beat the first three levels, and by level 12 correctly predicts which of two rewrites is faster *before* running it — verified in a 5-person playtest where median accuracy on a held-out "guess the winner" quiz rises from chance to >80%.
