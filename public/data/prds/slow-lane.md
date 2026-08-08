## Overview
A macOS/Linux screensaver that turns idle time into a nightly tournament of deliberately *pessimal* microbenchmarks, rendered as a drag strip with one lane per pathology. Over weeks it accumulates a longitudinal fingerprint of your specific machine's worst case. For programmers who like knowing what their hardware actually does.

## Problem
Every benchmark measures best case. Nobody knows their machine's worst case — and worst case is where regressions surface first: a firmware update that changes prefetcher behavior, a kernel that starts scheduling you onto E-cores, a background agent thrashing L3, a laptop whose paste has aged. Meanwhile the screensaver is the largest unused display surface in computing.

## How it works
Eight lanes, each a named pathology, 3 seconds per round:
- **False sharing** — two pinned threads CAS'ing adjacent words in one cache line
- **Split-line atomic** — atomic RMW straddling two cache lines
- **Denormal storm** — float ops driven into subnormal range
- **Mispredict maze** — pointer-chase whose branches are drawn from a PRNG
- **TLB thrash** — page-plus stride over a 4 GB region
- **Latency ladder** — dependent pointer chase across L1/L2/L3/DRAM
- **Syscall storm** — `clock_gettime` forced off the vDSO path
- **Icache flush** — self-modifying / cross-modifying code

Car speed is real measured throughput, normalized to that lane's all-time best *on this machine*. A record board persists nightly winners. When every lane slows together, that's thermal throttling, and the track draws heat haze.

## Technical approach
Lanes in C, one file each, compiled `-O1` with `volatile` and inline-asm barriers so the compiler can't optimize the point away (a unit test asserts each lane is at least 5× slower than its benign twin — the pathology must be *provably* present). Threads pinned via `pthread_setaffinity_np` on Linux; on macOS, `thread_policy_set` affinity tags plus QoS classes to force P- vs E-core placement. Renderer: Swift + Metal `ScreenSaverView`; on Linux a fullscreen wgpu binary that also works as an XScreenSaver hack.

Metrics prefer hardware counters (`perf_event_open` for cache-misses and branch-misses on Linux); on macOS `kpc` is entitlement-gated, so fall back to wall-clock ops/sec plus `ProcessInfo.thermalState` and `IOReport` for package power. SQLite: one row per (lane, run, core type, thermal state, OS build, firmware version) so a regression is attributable.

The hard part is comparability under DVFS: a control lane (plain scalar FMA loop) runs every round, and all results are reported as **ratios to the control**, never absolutes. The second hard part is not being user-hostile — pause on battery, abort above a thermal threshold, never run while another app is fullscreen.

## v1 scope
- 3 lanes: false sharing, denormal storm, latency ladder
- Wall-clock measurement only, no perf counters
- One static drag-strip render, no animation polish
- SQLite log + a `--report` flag that prints the record board
- macOS only

## Out of scope
Cross-machine leaderboards, GPU lanes, uploading anything anywhere, x86-specific hand-written asm.

## Risks & unknowns
macOS counter entitlements may be unobtainable. Thermal noise may swamp lane-to-lane differences. Compilers get smarter and quietly delete a pathology. A screensaver that heats a laptop is a bug report, not a feature.

## Done means
Seven consecutive nights logged; injecting a known perturbation (saturate all cores with a background load, or switch from battery to charger) visibly reorders the lanes; at least one lane shows a >2× spread between its best and worst night, and that spread is explained by a stamped thermal state.
