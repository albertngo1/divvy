## Overview
Cold Plan is a daily one-minute guessing game for database people: given a schema and two innocent-looking queries, bet on which runs faster and why. Reading Postgres internals is usually a solitary, passive rabbit hole; Cold Plan turns 'I think I understand the planner' into a testable, shareable, faintly humiliating daily score. For backend devs, DBAs, and anyone who's been burned by a missing index.

## Problem
Query-plan intuition is folklore. People read the Postgres source, nod along about seq scans vs index scans, then confidently write the slow query in prod. There's no cheap feedback loop that pits your gut against the actual planner. And plan-reading is consumed passively (blog posts, `EXPLAIN` dumps) with no scorekeeping.

## How it works
Each day: a small realistic schema (users, orders, events), some pre-seeded data, and a challenge — usually 'Query A vs Query B: which is faster?', sometimes 'predict the top node of the plan' or 'will this use the index?'. You lock in a guess and a confidence. Only *then* does it reveal the real `EXPLAIN ANALYZE` for both, animated node-by-node, with a one-line 'why' (e.g. 'B's `LIKE '%x'` can't use the btree, so seq scan'). Score is streak-based, Wordle-style, with a copyable result. A twist mode: 'add one index to make B win' and it re-plans live.

## Technical approach
Surprisingly, ship real Postgres in the browser via pglite (WASM Postgres) — no server, fully static, and it produces *genuine* plans, not faked ones. On load, the daily bundle (`/days/<date>.json`) contains schema DDL + seed data + the query pair; pglite runs `EXPLAIN (ANALYZE, FORMAT JSON)` client-side. Parse the plan JSON into a node tree, render as a collapsible flame-ish tree, and diff the two. The 'why' explanations are pre-authored per day (hard to auto-generate trustworthy prose). Daily seed is fixed so timings are stable-ish; to avoid noisy `ANALYZE` timings deciding winners, rank by planner *cost estimate* (deterministic) and show real time as flavor. The genuinely hard part: crafting query pairs where the intuitive answer is wrong *and* the reason is a single teachable concept — that's content design, not code.

## v1 scope
- pglite running EXPLAIN in-browser
- 5 handcrafted daily challenges (A-vs-B)
- Guess → reveal both plans as trees
- One-line authored 'why'
- Streak counter + shareable emoji result

## Out of scope
- Auto-generated explanations
- Other engines (MySQL, SQLite)
- User-submitted challenges
- Accounts / global leaderboard

## Risks & unknowns
- pglite bundle size and cold-start in-browser
- ANALYZE timing noise — mitigated by scoring on cost, not wall-clock
- Content pipeline: authoring genuinely counterintuitive pairs is slow

## Done means
Opening the page loads a schema, lets you pick 'Query A is faster', then runs real Postgres in your browser to reveal both EXPLAIN trees, tells you A used an index-only scan and you were right, bumps your streak, and hands you a shareable grid — with no server involved.
