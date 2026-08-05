## Overview
Full Scan is a browser roguelike deckbuilder for one player. Each run is a night of production traffic. Each combat is a query, drawn as a plan tree. Your deck is physical operators and indexes. The hook: the row counts printed on every enemy are *estimates* derived from your in-game statistics, and the true values are hidden until you commit. Being wrong is how runs end.

## Problem
Deckbuilders have exhausted "the numbers are random." Nobody has shipped "the numbers are *confidently wrong in a structured way*." Query planning is a genuinely deep resource puzzle that thousands of developers half-understand, and its central drama — the estimate said 40 rows, reality had 4 million, the hash table spilled — is already a boss fight. It just needs to be dealt as cards.

## How it works
Each room deals a query: a DAG of scans, filters, and joins. You play operator cards onto nodes.

- **Hash Join** — fast, costs 4 memory, and if true rows exceed what memory holds it *spills*, dealing latency damage back to you.
- **Nested Loop** — nearly free memory, cost multiplies with true inner rows. Fine on 40 rows. Catastrophic on 4 million.
- **Index Seek** — requires you own the matching index card.
- **Sort**, **Sort-Merge**, **Materialize**, **Bitmap Scan** round out the starting deck.

Commit the plan and true cardinalities resolve top-down with an EXPLAIN ANALYZE post-mortem screen: estimated versus actual, per node, every time. That screen is the teaching loop.

Between rooms you shop: **ANALYZE** (refresh one table's stats), **Extended Statistics** (fixes one correlated column pair — the classic underestimate), an **Index** (permanent, but adds write latency to every subsequent room, a real trade), or more **work_mem**. A drift meter mutates the underlying data each room, so stats you bought early rot.

## Technical approach
TypeScript + React, canvas for the plan tree, zero backend, seeded PRNG for shareable daily seeds.

Data model: `PlanNode { op, inputs[], estRows, trueRows, memory, cost }`. Cost constants are lifted from Postgres `costsize.c` — `seq_page_cost 1.0`, `random_page_cost 4.0`, `cpu_tuple_cost 0.01`, `cpu_operator_cost 0.0025` — so the arithmetic feels legitimate to anyone who has read an EXPLAIN.

The important design decision: estimation error is **emergent, not scripted**. A synthetic table generator produces columns with Zipf distributions plus injected functional dependencies. True cardinality is computed by actually evaluating predicates against the generated rows. The displayed estimate is computed separately by the textbook independence-assumption formula over fixed-bucket histograms of a possibly stale snapshot. The gap between the two falls out of the simulation on its own, which means players who learn *why* estimates fail can genuinely predict them.

The hard part is legibility: the player must feel the damage math within five seconds of a spill, or it reads as arbitrary punishment. Mitigations are the mandatory post-mortem screen and a one-per-room **Probe** action revealing one node's true count.

## v1 scope
- 8 operator cards, 4 index cards
- 6 rooms plus one boss: a five-way join with a correlated predicate
- EXPLAIN ANALYZE post-mortem screen
- No meta-progression, no unlocks

## Out of scope
Parsing real SQL, running against a real engine, multiple table schemas, mobile layout.

## Risks & unknowns
Audience skews developer-only and may read as homework. The estimation gap could feel like plain randomness if the correlations aren't discoverable from the shop cards.

## Done means
A playtester who has never tuned a database finishes three runs and explains, unprompted, why their hash join spilled.
