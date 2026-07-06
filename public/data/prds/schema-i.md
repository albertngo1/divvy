## Overview
Schema I (yes, a wink at Steam's *Schedule I*) is a browser puzzle game for backend engineers who half-believe the Lobsters gospel that "Postgres Is Enough." Each level hands you a product feature request and dares you to implement it with only Postgres primitives — no Redis, no Kafka, no Elasticsearch. It grades your SQL by actually running it.

## Problem
"Postgres is enough" is a great slogan and a terrible teacher. Engineers reach for a new dependency the moment they need a queue or a cache because they've never practiced the Postgres-native pattern (`SELECT ... FOR UPDATE SKIP LOCKED`, `LISTEN/NOTIFY`, `tsvector`, `pg_cron`, generated columns). There's no fun, safe sandbox to build that reflex.

## How it works
A level = a spec + a hidden test harness. Example: "Build a job queue where N workers each claim distinct rows without double-processing." You write the schema and the claim query in an in-browser editor. The game spins up a real Postgres in WASM, seeds it, then runs a concurrency-simulating test script (interleaved transactions, simulated crashes) and shows pass/fail per assertion plus a leaderboard on rows-of-SQL and query-plan cost. Levels escalate: rate limiter, materialized cache with invalidation, delayed jobs, pub/sub fan-out, fuzzy search, idempotency keys, an audit log.

## Technical approach
Frontend: React + CodeMirror SQL mode. Database: **PGlite** (Postgres compiled to WASM, ElectricSQL's build) running entirely client-side — no backend, no accounts, instant reset between attempts. Each level is a JSON manifest: `{ setupSql, workloadScript, assertions[] }`. The workload runner opens multiple PGlite connections/transactions and interleaves statements to expose race conditions (this is how a naive `SELECT then UPDATE` queue fails and `SKIP LOCKED` passes). Scoring: correctness (all assertions), then tiebreak on `EXPLAIN (FORMAT JSON)` total cost and statement count. The genuinely hard part is authoring *deterministic yet adversarial* interleavings in WASM so that wrong-but-plausible solutions reliably fail without flakiness — likely a scripted scheduler that yields at fixed statement boundaries.

## v1 scope
- 6 hand-authored levels, queue → cache → pub/sub → search → rate-limit → idempotency
- Client-only PGlite, no login, share-a-score string
- Pass/fail + statement-count score

## Out of scope
- User-submitted levels / editor
- Real multi-node Postgres, replication puzzles
- Persistent global leaderboard backend

## Risks & unknowns
- PGlite feature gaps (no `pg_cron`, limited extensions) may force level redesigns
- Deterministic concurrency simulation in single-threaded WASM is fiddly
- Balancing "teaches a real pattern" vs "golf the fewest characters"

## Done means
A player can load the queue level, submit a naive solution and watch it fail on a double-claim assertion, then submit the `SKIP LOCKED` version and pass — all in-browser with zero server calls, and get a shareable score.
