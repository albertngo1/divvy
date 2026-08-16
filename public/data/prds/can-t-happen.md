## Overview
A build-time instrumentation plugin plus a tiny report CLI for TypeScript/JavaScript services. It answers one question nobody can currently answer: of all the defensive code in this repo, which branches have ever actually executed in production?

## Problem
Defensive code accretes and never leaves. `if (!user) return null`, `catch { return [] }`, `opts.timeout ?? 30_000` — every one is a claim about reality, and none is ever checked. Test coverage tells you what your tests did, not what production does. So teams simultaneously carry hundreds of impossible branches they're afraid to delete, and ship fallbacks that quietly became the real code path months ago.

## How it works
A compiler plugin tags every guard site: null/undefined comparisons in `if`, `??` and `||` fallbacks, `catch` blocks, and `default:` cases. Each gets a stable ID = hash of (normalized condition AST + enclosing function name + module path) — deliberately not line numbers, so IDs survive reformatting.

At runtime each site increments a slot in a preallocated `Int32Array` (taken / not-taken). A background flush writes deltas every 60s. The report then classifies:
- **Never taken in N days** → deletion candidate, or convert to a typed invariant
- **Always taken** → your "default" is your production behavior; the non-default path is dead
- **Rarely taken (0.01–5%)** → a real edge case with, almost certainly, no test

The mischief: `can't-happen fix` rewrites never-taken null guards into `assertUnreachable()` so the next deploy tells you loudly if you were wrong, and flags any `??` whose fallback fires over half the time as "this default is lying to you."

## Technical approach
v1 is a Babel plugin for iteration speed, with an SWC (Rust) port once the ID scheme is stable. Counters live in one flat `Int32Array` indexed by numeric slot — roughly a couple of nanoseconds per hit, so no sampling is needed. A build sidecar maps slot → `file:line:condition-text` for the report; the runtime never carries strings. Flush sink is pluggable: JSON file, better-sqlite3, or an HTTP endpoint into ClickHouse for multi-instance aggregation. Report CLI is plain Node reading the sidecar plus the counter dump.

Hard parts: (1) hot-loop overhead — mitigated by an adaptive rule that stops exact counting at 1e6 hits and marks the site "hot/always"; (2) ID continuity across deploys, since a one-token edit to a condition orphans its history — fall back to fuzzy re-match on function name plus neighboring site hashes, and show a "history reset" badge rather than silently lying.

## v1 scope
- Babel plugin, two node types only: `if` with a null/undefined comparison, and `??`
- Counters dumped to a JSON file on SIGTERM and every 60s
- `cant-happen report` prints the three lists as text
- No dashboard, no aggregation across instances

## Out of scope
Other languages, auto-PRs, distributed rollups, flame graphs, IDE integration.

## Risks & unknowns
The real adoption barrier is that nobody wants a modified build in prod — staging plus load tests is the beachhead. "Never fired" is not "impossible": rare disaster paths and `catch` blocks are exactly the ones that must never be auto-deleted, so the tool must rank them as *candidates* and refuse to auto-fix catch blocks at all.

## Done means
Run on a real Express service for 7 days; the report names ≥10 guards that never fired; deleting three of them keeps the full test suite green; and measured p99 latency overhead stays under 1%.
