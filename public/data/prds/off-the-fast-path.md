## Overview

A CLI + CI action for Node projects that treats **JIT tier state** as a discrete, low-noise performance signal instead of measuring milliseconds. It records which functions V8 optimizes, why they bail out, and how polymorphic their call sites are — then fails a PR when that fingerprint degrades. For teams with hot paths (parsers, serializers, game loops, API middleware) who can't run stable microbenchmarks in shared CI runners.

## Problem

The classic silent regression: someone adds a `try/catch`, a `console.log`, or passes a second object shape to a helper, and an *unrelated* hot loop three files away goes megamorphic and runs 4x slower. Wall-clock benchmarks in CI are too noisy (±15% on shared runners) to catch a 2x regression in a function that's 5% of total runtime. So nobody catches it until a customer profiles production. Tier state, unlike time, is nearly **deterministic** — that's the arbitrage.

## How it works

1. `npx fastpath record --entry bench/hot.mjs` runs your entry under `node --allow-natives-syntax --trace-opt --trace-deopt --trace-ic`.
2. It parses the trace into a fingerprint keyed by `file:line:fnName`: highest tier reached (Ignition / Sparkplug / Maglev / Turbofan), the list of deopt reasons (`wrong map`, `insufficient type feedback`, `Smi`), and an IC state histogram (mono / poly / mega) per call site.
3. Commit `fastpath.lock.json`.
4. In CI, re-record on the PR and diff. Fail on: tier drop, a new deopt reason, or a call site going mono→mega.
5. The report blames the change: it intersects the PR diff hunks with the transitive callers of the degraded function and ranks candidates, printing `serialize() lost Turbofan — new deopt "wrong map"; likeliest cause: src/log.ts:14 now passes {id, trace} where {id} was expected`.

## Technical approach

Node 22+/24. Prefer `%GetOptimizationStatus(fn)` bitfields over log scraping where the function is reachable — it's a stable ground truth; fall back to a small line grammar over `--trace-opt/--trace-deopt` stderr. Store the lockfile per `(v8 major, arch)` so an engine bump regenerates rather than false-alarms. SQLite is overkill; JSON is fine.

The genuinely hard part is **tiering nondeterminism**: V8 promotes on an interrupt budget, so a function may or may not reach Turbofan on a given run. Mitigation: run the entry k=5 times, keep only functions whose state is identical across all k, and auto-quarantine the rest into a `flaky` list that's reported but never fails the build. Warmup iteration count is configurable per entry.

## v1 scope

- Single entry file, Node only
- Boolean "reached Turbofan" per function — no IC histograms yet
- `record` and `check` subcommands, `fastpath.lock.json`, exit 1 on regression
- Plain-text diff output; blame is just "functions that regressed"

## Out of scope

Browsers, JSC/SpiderMonkey, actual timing benchmarks, autofix suggestions, a GitHub App with PR comments, flamegraphs.

## Risks & unknowns

V8 trace formats churn between majors. Inlining renames functions and can look like a disappearance. Maglev's tiering heuristics are still moving. And the social risk: a red build for "lost Turbofan" on a cold function is noise — v1 must let you allowlist which functions are even watched.

## Done means

On a sample repo: wrapping a hot loop in `try/catch`, or calling a helper with a second object shape, makes CI fail and name that exact function plus the deopt reason; reverting makes it pass. 20 consecutive runs on unchanged code produce zero failures.
