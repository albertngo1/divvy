## Overview
Nop Sled is a browser puzzle game about the counterintuitive art of **adding code to go faster**. Each level is a real hot loop in x86-64 (or ARM64) assembly; your job is to insert or reorder instructions so its per-iteration throughput drops, scored deterministically by a static pipeline model. For perf nerds, compiler people, and anyone who read 'quadrupling performance with a useless if' and wanted to *do* that on purpose.

## Problem
Micro-optimization intuition ('adding a useless if made it 4x faster', 'unrolling with two accumulators doubled throughput') is real but almost nobody gets to practice it with a fast feedback loop. Compiler Explorer shows you asm but doesn't *score* it or turn it into progression. There's no Zachtronics for the CPU pipeline.

## How it works
- Each level presents a working loop and its measured baseline throughput (cycles/iteration) plus a **target** and a **par**.
- You edit the loop body in a constrained editor: insert instructions, add registers, reorder, but a validator enforces that the loop still computes the identical result on a bank of random inputs.
- Hit 'Run' → the model reports throughput, the critical dependency chain highlighted in red, and port-pressure bars. The 'aha' levels only clear when you *add* something: a second FP accumulator to break the `addsd` dependency chain, a `xor` to kill a false dependency, a branch hint.
- Global leaderboard on cycles-per-iteration; daily seeded loop for a Wordle-style share.

## Technical approach
- Scoring engine: **`llvm-mca`** compiled to WASM (it already models issue ports, latencies, and dependency chains for real microarchitectures like Skylake/Zen) — feed it your loop, parse the JSON throughput + critical-path report. This makes scoring 100% deterministic and offline, dodging the flakiness of real timing.
- Correctness check: assemble the edited loop with a WASM build of the Keystone assembler, run it against the original in a tiny sandbox (or, simpler for v1, a symbolic dataflow equivalence check over the instruction set subset we allow).
- Frontend: React + a Monaco editor with an asm grammar; render the dependency DAG with elk.js.
- Content: author ~20 loops (dot product, saxpy, popcount, prefix sum) whose canonical solution is a *known* add-instructions transform.
- Hard part: making the correctness/equivalence check trustworthy enough that players can't cheat by breaking the computation, while keeping the allowed instruction set small.

## v1 scope
- 8 hand-authored x86-64 levels, each with a par that requires adding/reordering instructions.
- llvm-mca-WASM throughput scoring + critical-path highlight.
- Random-input correctness harness over a whitelisted instruction subset.

## Out of scope
- Multiple architectures, custom user-submitted levels, real hardware timing.
- Full x86 instruction coverage.

## Risks & unknowns
- llvm-mca is a *model*, not silicon — a few levels may score unintuitively; curate around its known-good cases.
- Building llvm-mca + Keystone to WASM is fiddly; fallback is a small server that runs them natively.

## Done means
A player can open the saxpy level, add a second accumulator register, and watch scored throughput drop from ~4.0 to ~2.0 cycles/iter with the critical chain visibly shortened, while the correctness harness confirms identical output on 1000 random inputs.
