## Overview
Pass Blame is a CLI for C, C++, Rust and Zig developers who have hit a performance regression that comes from the compiler rather than their own code. It works like `git bisect`, but it bisects the optimizer's pass sequence for one build instead of commit history. The output is one line: "pass #1,412 (`LoopRotatePass` on `parse_header`) costs you 18% ± 2%."

## Problem
Posts like "Chasing a -O2 pessimization" show the usual workflow: stare at disassembly, guess, toggle flags, and repeat for an evening. LLVM already ships the primitive that solves this. `-opt-bisect-limit=N` runs only the first N pass invocations. Almost nobody uses it for performance, because it was built for hunting miscompiles (pass/fail). A slowdown is a noisy, continuous signal, so a plain pass/fail bisect gets it wrong.

## How it works
1. `passblame init -- cargo build --release` records the build command and the benchmark command (`hyperfine`, `cargo bench`, or any command that prints a number).
2. A dry build with `-opt-bisect-limit=-1` collects the full numbered list of pass invocations (often 5k–50k).
3. The tool builds and benchmarks at N=0 and N=max to confirm a gap exists.
4. It runs a **noisy bisection**. At each midpoint it benchmarks repeatedly until a Welch t-test or bootstrap CI decides which side the midpoint belongs to, then recurses.
5. It reports the culprit pass, the function it ran on, and a side-by-side `llvm-mca` throughput diff of that function before and after the pass.

## Technical approach
- Rust CLI. Flags are injected through `RUSTFLAGS=-C llvm-args=-opt-bisect-limit=N` or `CFLAGS=-mllvm -opt-bisect-limit=N`.
- The pass list comes from parsing stderr lines of the form `BISECT: running pass (N) X on Y`.
- Each N is built in its own target dir so builds are cached and resumable. State lives in a `.passblame/state.json` log.
- **The hard part: non-monotonicity.** A later pass can undo an earlier one's damage, so the cost-versus-N curve isn't a single step. To handle this:
  - Do a coarse sweep at ~16 points first.
  - Find the largest single jump.
  - Bisect only inside that interval.
  - Report any secondary jumps.
- Noise control: `taskset`/`nice`, a CPU-governor warning, and interleaved A/B runs to cancel thermal drift.
- Optional: `llvm-extract` the culprit function and emit a minimal reproducer `.ll` for an upstream bug report.

## v1 scope (humiliatingly small)
- clang/C only, a single translation unit
- User supplies a benchmark command that prints one float
- Coarse sweep plus bisection, with a CI-based decision at each step
- Prints the culprit pass name, the function, and the before/after asm of that function

## Out of scope (for now)
- GCC (it has no equivalent of opt-bisect)
- LTO / ThinLTO across multiple modules
- Automatically filing upstream bugs
- Bisecting across different compiler versions

## Risks & unknowns
- Each step is a full rebuild. Large projects need per-TU isolation or they take hours.
- Some passes are "required" and skip bisect numbering, which can make attribution fuzzy.
- Laptop benchmark noise may be larger than a 3% regression. The tool must say "inconclusive" honestly instead of guessing.

## Done means
On a planted test case (a loop where `-O2` vectorization is slower than scalar because of a known gather cost), `passblame run` names `LoopVectorizePass` on the right function in under 15 minutes on an M-series Mac. Running it 5 times gives the same answer each time.
