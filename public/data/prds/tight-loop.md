## Overview
Tight Loop is a weekly speed-golf ladder for systems programmers. Given a tiny, sharply-specified problem ("binary search over a sorted i32 slice", "UTF-8 validate", "parse a decimal into i64"), you submit an implementation in C/Rust/Zig and it comes back ranked by **median cycles-per-element on real hardware** — not wall-clock on a jittery CI runner, but a reproducible, isolated measurement. For people who read branchless-binary-search and mechanical-sympathy blog posts and think "I could do that," this turns passive admiration into a scoreboard.

## Problem
Micro-optimization is a spectator sport right now — you read the post, nod, and move on. Nobody can *cheaply* prove their version is faster, because getting a trustworthy cycle count is genuinely hard: cloud CI shares cores, throttles, and varies microarchitecture run to run. A dedicated, quiet, pinned box is the scarce resource. I happen to have one.

## How it works
1. Pick the week's challenge; read the exact signature + correctness harness.
2. Submit a single source file. It's compiled with fixed flags, run against hidden correctness inputs (fail = disqualified), then benchmarked.
3. Bench = median cycles over N reps against a large, cache-hostile hidden input corpus, run on one isolated core.
4. Your entry lands on the ladder with cycles/element, a flame delta vs the reference, and a diff-of-approach blurb. Head-to-head 'beat this entry' challenges notify the author.

## Technical approach
- **Runner:** a queue worker on a dedicated homelab box; one physical core `isolcpus`-reserved, `cpufreq` governor pinned to `performance`, hyperthread sibling parked, ASLR off for determinism.
- **Measurement:** `perf_event_open` reading `PERF_COUNT_HW_CPU_CYCLES` and `INSTRUCTIONS` directly around the tight loop; warmup reps discarded; report median + MAD across ~1000 reps.
- **Sandbox:** compile and execute inside a seccomp-locked container, no network, wall-time and memory capped; inputs delivered by the harness so entries can't precompute.
- **Anti-cheat:** hidden randomized input corpus regenerated per submission (kills lookup-table cheese), output checked before timing, source diffed for syscalls / precomputed statics.
- **Stack:** Rust runner, SQLite for ladder, static site for the board. The genuinely hard part is *fair* measurement — noise isolation, and detecting entries that game the corpus rather than the algorithm.

## v1 scope
- One language (C), one challenge live at a time.
- GitHub-issue or web-form submission.
- Cycles-per-element median + correctness gate + a public ladder page.
- Manual 'new challenge' each week.

## Out of scope
- Multiple languages/architectures, SIMD-width fairness classes.
- Real-time re-benchmarking of old entries when hardware changes.
- Anti-cheat against adversarial timing-attack submissions.

## Risks & unknowns
- Measurement noise on consumer hardware may blur the top of the ladder — need to publish confidence intervals honestly.
- Sandboxing untrusted native code is a real security surface; keep the box air-gapped-ish and disposable.
- Niche audience, but a passionate one.

## Done means
Two strangers submit C binary-search implementations; the faster one ranks above the slower one with non-overlapping cycle confidence intervals, and re-submitting the identical file twice lands within 2% — reproducibly.
