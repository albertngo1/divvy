## Overview
Hot Loop is a browser puzzle game: each day you're handed a small, correct-but-slow hot loop and must transform it — reorder branches, go branchless, improve locality — to beat a par cycle count under a deterministic CPU cost model. For programmers who read 'mechanical sympathy' blog posts and want to actually *feel* it.

## Problem
The lobsters cluster this week — '6× faster branchless binary search,' 'C strings: a 50-year mistake,' K&R nostalgia — all circle the same joy: understanding how code meets the machine. But that knowledge is inert; you read a post and nod. There's no low-stakes daily rep for building intuition about branch prediction, cache lines, and data layout, the way chess puzzles build tactics.

## How it works
- Daily seeded puzzle: a snippet in a tiny C-like DSL that's correct but naive (e.g., a branch-heavy filter, a pointer-chasing scan).
- You edit it in-browser; the game runs it against hidden test vectors for *correctness*, then scores *cost* via a deterministic model — cycles = instructions + branch-mispredict penalties (predicted via a simple 2-bit predictor over the test data) + cache-miss penalties (modeled over a fixed cache-line size and access trace).
- Beat par → you 'solve'; the share card is your cycle count + a spark of the access pattern, Wordle-style.
- Global daily leaderboard by lowest cycles; a 'branchless' badge if you hit zero mispredicts.

## Technical approach
Stack: pure client-side — TypeScript, a hand-written parser for the DSL (subset: ints, arrays, loops, if, arithmetic, no heap alloc), compiled to a small bytecode. The 'CPU' is a deterministic interpreter that, per executed instruction, tallies base cost and simulates a 2-bit branch predictor keyed on branch site, plus a direct-mapped cache modeled over the array access trace. Determinism is essential so scores are comparable and shareable. Data model: `Puzzle` (seed, source snippet, test vectors, par), `Submission` (code, cycles, correct). The genuinely hard part is designing the cost model to be *simple enough to explain on one screen* yet *rich enough that branchless/cache-aware rewrites actually win* — if the model is too crude, the optimal move is a cheap trick; too rich, it's unteachable.

## v1 scope
- 10 hand-authored puzzles, one unlocked per day
- DSL + interpreter + branch-predictor + one cache model
- Correctness gate, cycle score, par, share card
- Local-only leaderboard (your history)

## Out of scope
- Real ISA/assembly, SIMD, multicore
- Server leaderboard and accounts
- User-authored puzzles

## Risks & unknowns
- Cost-model fidelity vs. legibility is the make-or-break tuning problem.
- Puzzle authoring is labor-intensive; procedural generation is unclear.
- Audience may be narrow (systems nerds) — small but passionate.

## Done means
A player loads today's puzzle, rewrites the naive loop into a branchless version, the game confirms identical output and reports strictly fewer cycles with zero mispredicts, and awards the branchless badge — with the same code producing the same score on any machine.
