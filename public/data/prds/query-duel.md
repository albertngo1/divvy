## Overview
Query Duel is head-to-head competitive SQL: two players get the same schema, the same natural-language question, and race to write the query that returns the correct result set first. Everything runs client-side against a full OLAP engine compiled to WebAssembly — no server database, no setup. It's for data analysts, DE candidates prepping for interviews, and people who think SQL is a sport.

## Problem
SQL practice sites (LeetCode-style) are solitary, slow, and server-bound. Nobody makes SQL *social or fast*, and analytics teams have no light way to sharpen or show off query skills. Meanwhile ClickHouse-in-WASM now makes a genuinely fast columnar engine available in the tab — so there's finally no reason a duel needs a backend at all.

## How it works
A lobby pairs two players. Both load the same dataset (bundled Parquet) and question ("Which 5 products had the biggest week-over-week revenue drop?"). Each writes SQL in their own editor; on run, the query executes locally and the result is hashed and compared to the canonical answer. First correct hash wins the round; ties break on execution time or query brevity. Best-of-5 match, then an Elo update. Spectators can watch both editors live.

## Technical approach
chdb-wasm (ClickHouse compiled to WebAssembly) runs the OLAP engine in a Web Worker so the UI stays responsive; datasets ship as Parquet loaded into an in-memory table. Editor is Monaco with SQL highlighting. Answer checking hashes the sorted result set (canonicalized column order/types) so different-but-equivalent queries both pass. Realtime pairing/sync via a tiny WebSocket relay (the *only* server component) carrying lobby state and "I finished" signals — never the data. Elo per player in a small KV store. Hard part is fair result-equivalence checking (ordering, floating-point, null handling) and preventing hard-coded literal answers that bypass real querying.

## v1 scope
- 1v1 lobby via shareable link
- 3 curated datasets + questions with canonical answers
- In-browser chdb-wasm execution + result-hash checking
- Best-of-5 with a win screen
- Basic Elo persisted per nickname

## Out of scope
- Anti-cheat against hard-coded answers (flag it as known)
- Tournaments/brackets
- User-uploaded datasets
- Mobile editing

## Risks & unknowns
- chdb-wasm bundle size and cold-start may be heavy for a quick match
- Result-equivalence checking is fiddly (ordering, floats, nulls)
- Players hard-coding literals instead of querying
- Whether SQL-as-esport has any real audience beyond a novelty

## Done means
Two browsers join a lobby, both load the dataset, and when one submits a semantically-correct query its hashed result matches the canonical answer, that player is awarded the round, Elo updates, and a query that hard-codes the literal output is (at minimum) flagged as not executing against the table.
