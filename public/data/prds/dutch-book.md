## Overview
A solo CLI + small dashboard that continuously ingests live order books from Kalshi and Polymarket, builds a **logical constraint graph** over the markets, and flags price sets that violate the axioms of probability. Not "same market cheaper elsewhere" — that arb is picked over in milliseconds by bots. This looks for *structural* incoherence: partitions that don't sum to one, implications priced backwards, conjunctions priced above their conjuncts. For a retail trader who wants an edge that comes from reading resolution criteria carefully rather than from latency.

## Problem
Prediction-market pricing is coherent within a market and wildly incoherent across them. "Will X be nominated?" and "Will X be nominated AND win?" live in different series, sometimes different venues, and nobody arbitrages the implication. Human traders don't see it because there are thousands of live markets; bots don't chase it because it requires reading English resolution text to know two markets are actually related. That gap is the whole opportunity — and it's exactly the kind of thing a careful person with a laptop can mine.

## How it works
1. **Ingest.** Poll open markets and top-of-book from both venues on a loop.
2. **Candidate generation.** Embed market titles + resolution text; for every market, retrieve the 20 nearest neighbors. This keeps the expensive step bounded — no O(n²) LLM calls.
3. **Relation labeling.** For each candidate pair, an LLM emits a strict-schema label: `EQUIVALENT | IMPLIES | IMPLIED_BY | MUTUALLY_EXCLUSIVE | PARTITION_MEMBER | UNRELATED`, and is **required to quote the exact resolution sentence** supporting the claim plus the resolution source and date for each side. Any mismatch in date or source auto-downgrades confidence.
4. **Coherence check.** Over the resulting graph:
   - Partition: Σ best_ask over an exhaustive mutually-exclusive set < 1 − fees ⇒ buy all legs, guaranteed payout.
   - Complement: ask(A) + ask(¬A) < 1 − fees.
   - Implication A⇒B: constraint P(A) ≤ P(B); violated when bid(A) > ask(B) ⇒ sell A, buy B.
5. **Sizing & fees.** Walk each book to compute max size before the edge evaporates. Kalshi's fee is `ceil(0.07 × contracts × p × (1−p))`, which is worst exactly at p = 0.5 where most of these live; Polymarket charges no trading fee but you eat spread and gas.
6. **Output.** A ranked table: legs, edge in bps after fees, executable size, and a big red **basis-risk flag** when the two legs resolve on different sources or dates.

## Technical approach
- Python + `httpx` + SQLite (WAL) for the market/book snapshots; markets table keyed by `(venue, ticker)` with a `resolution_text` blob and an `embedding` BLOB.
- APIs: Kalshi `GET /trade-api/v2/markets` and `/markets/{ticker}/orderbook`; Polymarket Gamma `GET /markets` + CLOB `GET /book`.
- Constraint graph in networkx; coherence check as a small LP when a component has >3 nodes (feasibility of a probability distribution consistent with all bids/asks — infeasible ⇒ arbitrage exists, and the LP dual tells you which legs to trade).
- Genuinely hard part: **resolution-criteria mismatch is the real risk, not the math.** Two markets that look identical can differ on "as reported by AP" vs "as certified by the state," or on a settlement date one day apart. A Dutch book that isn't a Dutch book because one leg resolves NO on a technicality is how you lose money confidently. The system must treat every flagged opportunity as guilty until the resolution texts are diffed, and it should surface that diff inline rather than a score.

## v1 scope
- Kalshi only, single venue, no LLM.
- Partition check only, using Kalshi's own event→market grouping as ground-truth mutual exclusivity (free, exact, no inference).
- CLI that prints violated partitions with post-fee edge and executable size.
- Log every hit to SQLite so you can backtest whether they'd have persisted long enough to fill.

## Out of scope
- Auto-execution, order placement, key custody.
- Sports and crypto price markets (too fast, too efficient).
- Cross-venue and LLM relation labeling — v2, once the boring version proves hits exist.

## Risks & unknowns
- The obvious violations may simply not exist, or exist only at sizes too small to matter after fees. This is a real possibility and v1 exists to find out cheaply.
- LLM relation labeling will produce confident false positives; the quote-the-text requirement helps but doesn't fix it.
- Venue terms of service and regional access restrictions vary; check before trading, not after.

## Done means
A week of logged Kalshi partition scans produces a concrete answer with numbers: N violations found, median post-fee edge in bps, median persistence in seconds, and max fillable size — enough to decide whether v2 is worth building or the whole thesis is dead.
