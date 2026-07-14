## Overview
Quarry is a self-hosted TUI that reframes database performance work as a Monster Hunter–style hunt. It reads `pg_stat_statements`, ranks your worst offenders, and renders each as a named 'beast' with a health bar equal to its cumulative execution time. You track it, wound it, and craft trophies. For solo devs and small backend teams who know they *should* profile but never do because a raw stats table is joyless.

## Problem
Query optimization is a chore with no feedback loop. `pg_stat_statements` is a wall of numbers; you fix a query, forget it, and never see the win. There's no sense of progress, no record of what you slew, no reason to come back tomorrow. The dopamine that makes people grind Monster Hunter is exactly what's missing from the unglamorous work of making software fast.

## How it works
On launch, Quarry snapshots stats and shows a 'hunting grounds' list: top-N queries as monsters, sorted by total time, each with a fingerprint-derived name and silhouette. You 'track' one to open its detail view — its EXPLAIN (ANALYZE) plan is drawn as a body diagram, each expensive node a breakable 'part' (Seq Scan = tough hide, Sort spill = a horn). You go fix it in your editor; on the next snapshot Quarry diffs the same query's timing and 'lands hits' proportional to the improvement, animating the health bar dropping and marking parts as broken. Slay it (drop below a threshold) and it joins your trophy wall with the date, the before/after plan, and the index or rewrite that killed it.

## Technical approach
Rust + ratatui TUI, connects via `tokio-postgres`. Core data source: `pg_stat_statements` (`queryid`, `total_exec_time`, `calls`, `mean_exec_time`) polled on demand, plus on-request `EXPLAIN (ANALYZE, FORMAT JSON)` for the plan tree. Local SQLite stores snapshots and the trophy log. The genuinely hard part is **stable identity across drift**: `queryid` changes when query text or schema changes, so a monster would 'respawn' as a stranger. Solution: normalize the query (strip literals via a lightweight SQL tokenizer), hash the AST shape into a durable `beast_id`, and fuzzy-link successive `queryid`s to the same beast via normalized-text similarity so a rewrite reads as 'wounding the same monster,' not a new one.

## v1 scope
- Connect, list top-20 queries as monsters with HP bars
- Track view with EXPLAIN plan drawn as breakable parts
- Snapshot/diff to register hits and slays
- Local trophy wall with before/after

## Out of scope
- MySQL/other engines
- Auto-suggesting fixes (you do the hunting)
- Multiplayer/leaderboards

## Risks & unknowns
- `pg_stat_statements` must be enabled (many hosts don't)
- Attribution across heavy refactors may still misfire
- Gamification could feel gimmicky to seasoned DBAs — needs a 'just show numbers' toggle

## Done means
Against a seeded demo DB, Quarry lists the 3 planted slow queries as monsters, and after I add the obvious index it shows the corresponding beast's HP drop and moves it to the trophy wall on the next snapshot — with the same beast_id preserved across the index change.
