## Overview
Storyboard turns a Postgres query plan into a comic strip. Paste an `EXPLAIN (ANALYZE, BUFFERS)` output and get a left-to-right sequence of panels — each plan node drawn as a little character doing its job — so you can *see* why the query is slow instead of squinting at nested text.

## Problem
The HN "just learn SQL" post is right, but the wall between a dev and SQL fluency is the query planner: EXPLAIN output is a dense, indented tree that beginners can't read and experts only skim. Meanwhile arXiv's "Data Comics for Education" shows sequential comics teach *process* better than static diagrams. Nobody has pointed comics at the single most intimidating dev artifact — the execution plan.

## How it works
Paste plan text (or connect and run a query). Storyboard parses the node tree and lays panels out in execution order — leaves first, flowing up to the root. Seq Scan is a laborer shoveling every row; Index Scan flips straight to a page; Hash Join is a matchmaker building a hash table then pairing rows; Sort stacks cards. Panel size scales with actual rows/time, and the node with the biggest self-time is circled red as "the villain." A caption under each panel narrates in plain English ("read all 2.1M rows, kept 14"). Hover a panel to see the raw node text.

## Technical approach
Static web app, TypeScript + SVG. Accept `EXPLAIN (ANALYZE, FORMAT JSON)` for reliable parsing (with a hand-written recursive parser for the text format as a fallback). Build an AST of nodes carrying `actual_rows`, `actual_time`, `loops`, and buffers. Layout: topological order; panel width ∝ log(rows); highlight ∝ share of total exclusive time. A small library of ~15 hand-drawn SVG sprites keyed by node type, with a generic fallback character. Narration is templated from node fields — no LLM needed for v1. The genuinely hard part is computing exclusive/self time correctly: Postgres reports inclusive time and per-loop timings, so self-time = node time × loops minus children, and parallel workers and CTEs complicate the arithmetic.

## v1 scope
- Paste-box for `EXPLAIN (ANALYZE, FORMAT JSON)`
- Parser → node AST with correct self-time computation
- SVG comic strip for the ~12 most common node types
- Red-circle the top-cost node + plain-English captions

## Out of scope
- Live DB connection, query editing, rewrite suggestions
- MySQL/SQLite/other planners
- Animated transitions, export/sharing

## Risks & unknowns
- Self-time math with loops, CTEs, and parallel workers is fiddly and easy to get subtly wrong.
- Uncommon node types look broken without dedicated art.
- May end up a delightful demo more than a daily-use tool.

## Done means
Paste a real slow-query plan and, without reading the raw text, a SQL beginner can point at the panel that's the bottleneck and say in one sentence why it's slow.
