## Overview

A CLI that ingests a few hundred CI runs and treats intermittent test failures the way an epidemiologist treats a cluster of cases: not as forty independent sick tests, but as one outbreak with a vector. It outputs a deadpan field report naming the most likely shared resource, with attack rates, odds ratios, and confidence intervals.

## Problem

Every flaky-test tool answers "which test is flaky?" That question is nearly useless. You get a list of forty quarantine candidates and no story. The truth is usually that one test leaves a port bound, a temp file poisoned, or a DB sequence advanced, and *whichever* test runs after it on that worker gets sick. The flakiness follows the resource, not the test — and no dashboard is shaped to show that.

## How it works

Ingest N runs of JUnit XML plus a small metadata sidecar per run. Build a case table where each `(test, run)` pair is one observation with an outcome (pass/fail) and a set of *exposures*:

- runner hostname / VM image digest
- shard index and position within the shard's execution order
- which tests ran immediately before it on the same worker (a before-set)
- concurrent job count on the runner at that moment
- wall-clock hour, day of week
- git sha, dependency lockfile hash

Then compute, per exposure, a Mantel–Haenszel odds ratio **stratified by test** — so a test that's simply broken can't dominate the ranking; only exposures that change a test's *own* failure rate score. Rank exposures. Separately, build a co-failure graph (tests that fail in the same runs) and cluster it; each cluster is a candidate outbreak with its own vector. The report reads like a CDC bulletin: index case, attack rate, exposure table, recommended intervention.

## Technical approach

Python + polars + DuckDB for the case store. `scipy.stats.fisher_exact` for 2×2s, `statsmodels` conditional logit for the stratified fit. Before-set membership as roaring bitmaps so "did test X precede test Y on this worker" is a cheap intersection across 200 runs × 3000 tests. Co-failure clustering via Jaccard similarity + Louvain. Output is a single self-contained HTML file; the graph is inline D3, no server.

The hard part is confounding. Execution order, shard index, and runner identity are all correlated by construction — a naive per-exposure OR will happily indict the shard when the culprit is the predecessor. Mitigations: stratify explicitly and print the stratifier, require a minimum discordant-pair count before reporting anything, and show CIs wide enough to embarrass a weak finding. Second hard part: most CI systems don't hand you worker identity, so v1 ships a tiny shim that stamps hostname + boot id into the JUnit properties.

## v1 scope

- `flaky-trace ingest` over GitHub Actions JUnit artifacts.
- Three exposures only: runner id, immediate predecessor, concurrency.
- Mantel–Haenszel OR table, sorted.
- One HTML report.

## Out of scope

Auto-quarantine, rerun orchestration, PR comments, non-JUnit formats, hosted service, anything that mutates your test suite.

## Risks & unknowns

Under ~150 runs the ORs are noise; the tool should refuse rather than mislead. Some suites randomize order per run (great — that's a natural experiment) and some don't (bad — order is perfectly confounded with test identity, and the tool must say so instead of guessing).

## Done means

On a seeded repo where one test corrupts a shared temp file and a specific later test reads it, run 200 randomized-order CI runs, and the report names the predecessor test as the top vector with OR > 10 and a CI excluding 1 — without ever being told the two tests are related.
