## Overview
A solo scheduling/economics sim about maintaining a package repository. You never write code. You decide what enters staging, when staging merges, what gets patched-and-carried, and which fire to let burn. For anyone who has watched a nixpkgs staging cycle or a Debian transition and thought *this is a strategy game*.

## Problem
Build-farm scheduling under a dependency DAG is one of the richest optimization problems in software and zero games model it. Existing factory games give you a graph you *built*; here the graph is inherited, hostile, and changes underneath you. The core tension — batch rebuilds to save CPU-hours versus ship fast so users aren't stale — has no dominant strategy, which is exactly what a good tycoon needs.

## How it works
One turn = one week.
- **The graph.** ~6,000 packages with real reverse-dependency edges and real user weights.
- **Upstream inbox.** Each week, N upstream releases land. Each is tagged: patch, feature, or **soname bump**. Accepting a bump marks its entire reverse-transitive closure dirty.
- **The farm.** 40 build slots × 3 architectures. Dirty packages queue; build durations are sampled per package. Merging staging→main while 3,100 packages are dirty locks the farm for six in-game days and nothing else ships.
- **Carried patches.** You can hold a package back with a local patch. Every upstream release afterward increases that patch's rebase cost. Debt compounds; eventually a patch costs more per week than the feature was worth.
- **CVEs.** Arrive on a clock with a severity-scaled SLA. A CVE in a leaf is cheap; one in the C library means the mass rebuild happens *now*, on your schedule or not.
- **Failure.** FTBFS events, flaky builders, a maintainer burning out and orphaning 40 packages at once.
- **Score.** Weighted staleness of what users actually run, minus unpatched-CVE-days, minus wasted CPU-hours.

## Technical approach
TypeScript + a deterministic seeded tick loop (no wall-clock), canvas for the DAG heatmap, no engine. Real data at build time: Debian's UDD or `apt-rdepends` output for the dependency graph, and **popcon.debian.org** install counts as per-package user weight — so the game's pain is calibrated to what people really have installed. Build durations seeded from buildd log statistics, falling back to log-normal by source-tarball size. Core data structures: CSR-encoded DAG plus a persistent dirty-set with incremental transitive closure (recomputing 6k-node reachability every tick is the naive trap — use a topological-order bitset propagation, ~1ms). Hard part is legibility: a 6,000-node dirty closure must be *readable* in one glance, so the UI shows a treemap by popcon weight, not a node-link graph.

## v1 scope
- 800-package subgraph, real edges, real popcon weights.
- Three event types: release, soname bump, CVE.
- Farm = one slot pool, one arch.
- 52 turns, one score screen, no save.
- Keyboard-only, ugly, deterministic seed in the URL.

## Out of scope
Multiple architectures, bootstrap/staging-next chains, maintainer hiring, mod support, art.

## Risks & unknowns
May be legible only to people who already maintain packages. The batching decision could collapse to one dominant rhythm — needs playtesting with the CVE clock's variance tuned to break it. Popcon data skews to servers.

## Done means
One 52-turn run playable end to end where two different strategies (batch-heavy versus ship-fast) produce scores within 15% of each other, but fail in visibly different ways.
