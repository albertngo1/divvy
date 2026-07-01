## Overview
Cost Golf is a daily browser puzzle for backend and data engineers. Every day you get one schema, one seeded dataset, and one slow query. Your job: make it fast. You add indexes, rewrite the SQL, restructure joins — and the game scores you on the *actual* execution cost reported by a real Postgres engine. It's Wordle for people who've ever stared at a query plan and whispered "why are you doing a sequential scan."

## Problem
Query optimization is a genuinely useful skill that almost nobody practices deliberately. You learn it accidentally, in production, at 2am. Reading the Postgres internals (as the HN post does) is illuminating but passive. There's no batting cage — no low-stakes, repeatable place to *feel* the difference between a nested loop and a hash join. Meanwhile developers happily grind Advent of Code and typing races. The itch: make the serious tool a toy you compete over.

## How it works
You load today's puzzle: a table schema, ~100k seeded rows, and a target query returning fixed results. A split editor shows the query on the left and live `EXPLAIN (ANALYZE, BUFFERS)` output on the right. You add `CREATE INDEX` statements, tweak the query, hit Run. The engine validates your output still matches the reference rows (no cheating by changing results), then scores you on total cost / execution time. "Par" is a hand-tuned expert solution. You get a letter grade, a share card (`Cost Golf #142 🏌️ -3 under par ⛳`), and a global leaderboard. Streaks for consecutive days under par.

## Technical approach
Stack: static SvelteKit front-end + a stateless scoring worker. The genuinely hard part is running real Postgres safely per-submission at scale. Use **pglite** (Postgres compiled to WASM) *in the browser* for instant, sandboxed, zero-server execution — each puzzle ships as a SQL seed script the client runs locally, so `EXPLAIN ANALYZE` is real Postgres, not a simulator. Leaderboard scores are re-verified server-side in an ephemeral Postgres container (Neon branch or a throwaway Docker pg) before they count, to stop tampering. Data model: puzzles are `{id, date, schema.sql, seed.sql, target_query, reference_hash, par_cost}`. Scoring compares result-set hash for correctness, then ranks by planner cost. Puzzle generation: an offline authoring script perturbs template schemas (missing index, bad join order, function-wrapped WHERE defeating an index) so each day has one clear intended lesson.

## v1 scope
- 10 hand-authored puzzles, one unlocking per day
- pglite in-browser execution with live EXPLAIN ANALYZE
- Result-correctness check + cost score vs par
- Shareable emoji result card
- Local streak tracking (localStorage)

## Out of scope
- Accounts and global leaderboard (v2 — v1 is single-player)
- MySQL / SQLite engines
- User-submitted puzzles
- Multi-query / stored-procedure puzzles

## Risks & unknowns
- pglite planner costs may differ subtly from server Postgres versions; must pin versions and warn.
- ANALYZE timing is noisy on WASM — may need to score on planner *cost* (deterministic) rather than wall-clock.
- Authoring good puzzles is labor-intensive; the fun lives entirely in puzzle quality.

## Done means
A visitor opens the site, sees today's slow query, adds an index, watches the EXPLAIN flip from Seq Scan to Index Scan, drops under par, and gets a share card — all client-side, with no login, in under two minutes.
