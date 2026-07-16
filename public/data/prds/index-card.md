## Overview
Index Card is a daily browser puzzle for developers who half-remember how indexes work. Each day you get a fixed schema, a workload of 4–6 SQL queries, and an index budget. Your job: choose which columns to index (order matters, composites allowed) so that every query is served by an index seek instead of a full table scan — under budget. Scored, shareable, one puzzle a day.

## Problem
Every backend dev has shipped a query that quietly does a `SCAN table` at 3am. People learn indexing by folklore. There's no low-stakes, fast-feedback way to build the intuition that a composite index's column order matters, that a leading-column mismatch kills the seek, or that an `OR` or a function on a column defeats it. Existing SQL games test query-writing; almost none test physical design.

## How it works
You see the schema and queries on the left, an index bench on the right. Drag columns to build up to N indexes. Hit Run: the app builds the schema in an in-browser SQLite (WASM), creates your indexes, and runs `EXPLAIN QUERY PLAN` on each query. Each query lights green (uses an index) or red (`SCAN`). You win when all green within budget; a lower index count / fewer total indexed columns yields a better star rating. Wordle-style emoji share (🟩🟩🟥🟩 = query outcomes) plus a global daily leaderboard ranked by budget efficiency. A "why" panel explains each red result ("leading column of idx is `status`, but query filters on `created_at` — no seek").

## Technical approach
Stack: static site + `sql.js` (SQLite compiled to WASM) entirely client-side — no backend needed for play. Puzzle format is a JSON blob: `{schema_ddl, rows_seed, queries[], index_budget}`. Grading parses `EXPLAIN QUERY PLAN` output for `SEARCH ... USING INDEX` vs `SCAN`. Deterministic daily seed drives both the puzzle-of-the-day selection and the synthetic row generator (so cardinalities that make SQLite actually choose scans are reproducible). The hard part is authoring puzzles that are pedagogically pointed: you must generate data whose statistics make SQLite's planner genuinely prefer the intended index — an offline generator + planner-check pipeline validates each candidate puzzle before it ships. Leaderboard is a tiny serverless function + KV store.

## v1 scope
- 20 hand-validated puzzles + a daily rotation
- Drag-to-build indexes, Run → per-query green/red via real EXPLAIN
- Budget star rating + emoji share string
- "Why red" explanation panel

## Out of scope
- Multi-engine (Postgres/MySQL planner differences)
- JOIN-heavy multi-table optimization
- Accounts, streaks, backend leaderboard on day one (local share first)

## Risks & unknowns
- SQLite's planner is simpler than Postgres's — puzzles teach real principles but caveat the engine
- Making "all green" achievable yet non-trivial requires careful data-stat tuning
- Discoverability: needs a strong day-one "share" loop to spread

## Done means
Open today's puzzle, build indexes, and a query that was red (`SCAN customers`) turns green (`SEARCH customers USING INDEX`) after adding the correct composite in the right column order — with a shareable result string that a friend can compare.
