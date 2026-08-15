## Overview
A GitHub Action plus a small CLI that fingerprints the hosted runner your job landed on, runs calibration kernels alongside your benchmark, and reports a machine-corrected delta with a confidence interval. Secondarily, a public dataset of the runner lottery: which CPUs `ubuntu-latest` actually hands out, by hour, tier, and week.

## Problem
Hosted CI runners are a lottery. One job gets a Xeon Platinum 8370C, the next an EPYC 7763, the next the same model with 40% of its cycles stolen by a neighbor. Timing benchmarks in CI therefore produce numbers that swing 10–30% for reasons that have nothing to do with the diff, so teams either give up on perf gates or waste days bisecting phantom regressions. Nobody publishes what hardware you're actually getting, because only the people running the jobs can see it — and they throw the evidence away.

## How it works
1. `blame-the-box fingerprint` records `/proc/cpuinfo` model + stepping + microcode, `lscpu` flags and cache sizes, cgroup CPU/memory limits, kernel version, and available core count.
2. It runs four ~200ms canary kernels chosen to span workload shapes: a STREAM-style memory-bandwidth loop, a branch-heavy interpreter loop, a scalar FP loop, and a random-pointer-chase for cache latency. Plus `fio` on a 64MB file.
3. It samples `/proc/stat` steal time and the variance of a fixed spin loop before and after your benchmark — that variance is the noisy-neighbor detector.
4. Your benchmark runs. Its result plus fingerprint plus canaries are written as a JSON artifact.
5. The CLI fits, over your history, a per-fingerprint calibration: benchmark time ≈ code effect × Σ wᵢ·canaryᵢ. Weights come from a ridge regression across past runs; new results are divided through. Output: "raw +12.3%, calibrated +0.8% ± 2.1% — you drew an EPYC 7763 with 9% steal."

## Technical approach
Canaries in a single static Rust or C binary, no PMU needed (hosted VMs don't expose one), everything measured in wall clock with a fixed iteration count. Storage: JSONL artifacts committed to an orphan branch or pushed to a tiny SQLite-over-Litestream endpoint. Regression via a few dozen lines of NumPy. Public dataset: a scheduled workflow in a throwaway repo that burns free minutes hourly to sample the fleet, publishing Parquet + a static scoreboard. The genuinely hard part is canary relevance — a memory-bound benchmark needs bandwidth weighting, a parser needs the branch kernel — so the weights must be fit per benchmark, and the tool must refuse to calibrate until it has ~30 runs.

## v1 scope
- Fingerprint + two canaries (memory bandwidth, branch loop) + steal sampling.
- Emits JSON; no dashboard, no PR comment.
- CLI computes a single-canary correction, no regression fitting.
- Ubuntu x86-64 hosted runners only.

## Out of scope
Self-hosted runners, ARM/macOS runners, GitLab/Buildkite, flamegraphs, PR gating.

## Risks & unknowns
Calibration can overfit and erase a real regression — so always print raw next to corrected. Providers may change fleets under you, invalidating old weights. Continuous fleet sampling may bump against acceptable-use terms; keep it modest and cite it.

## Done means
On a repo whose benchmark is deliberately unchanged for 50 CI runs, calibrated variance is at least 3× lower than raw variance, and an intentionally injected 5% slowdown still shows up as ~5% after correction.
