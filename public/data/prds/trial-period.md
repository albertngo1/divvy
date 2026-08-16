## Overview

A CLI + HTML report that answers one question during a data vendor's free trial: **does this feed carry information about future returns that price history and the calendar don't already carry?** The answer is reported in bits per observation and in bits per dollar of the annual license fee. For small funds, family offices, prop desks, and solo quants who get 30-day trials of sentiment/satellite/card-spend/shipping feeds and currently evaluate them by eyeballing a backtest equity curve.

## Problem

Alt-data evaluation is where small shops get fleeced. A trial gives you a CSV and a sales engineer's Sharpe of 2.4. You run a backtest, it looks great, you sign a $60k/yr contract, and the edge evaporates — because the backtest was overfit, or because the vendor's historical file was restated after the fact and carries lookahead the live feed will never have. Big funds have a research team that catches this. Nobody else does.

## How it works

1. Point it at two CSVs: the vendor file (entity, timestamp, fields) and a symbol universe.
2. It pulls its own price history, builds a **baseline predictive model** of the sign/tercile of forward return over horizon *h* using only lagged returns, realized vol, day-of-week, and earnings-calendar proximity.
3. It builds a **candidate model** = baseline + vendor fields.
4. Score = mean log-loss difference in bits: `H(baseline) − H(baseline+feed)`, evaluated only out-of-sample on purged, embargoed walk-forward folds. This is exactly "compression is prediction" run backwards: a feed that helps is a feed that compresses the return tape.
5. **Lookahead detector:** re-run the whole thing with the vendor timestamps shifted forward by the latency the vendor claims in the contract (and by 1d, 2d). Real information decays smoothly. Lookahead collapses to zero the moment you honor the stated latency — that cliff is the tell, and it's the screenshot you send the sales engineer.
6. Report: bits/observation with a stationary-bootstrap CI, the shift curve, per-field ablation, and coverage/staleness stats (how many symbol-days are actually populated, not just the ones in the demo).

## Technical approach

Python, Polars for the join, DuckDB for the point-in-time asof-join (`ASOF JOIN ... ON feed.ts <= bar.ts - interval`), LightGBM with `multi_logloss` as the probabilistic model, and a hand-rolled purged K-fold with embargo (López de Prado) so overlapping label windows don't leak. Prices from Stooq/Tiingo/Nasdaq Data Link daily bars for v1. Stationary block bootstrap (Politis–Romano) over folds for the CI; deflated Sharpe / Benjamini–Hochberg across the field ablations so a 40-column vendor file can't win by luck.

Data model: one long table `(entity_id, event_ts, ingest_ts, field, value)`. If the vendor ships `ingest_ts`, use it; if they don't, say so loudly in the report — that absence is itself a finding.

The genuinely hard part is entity mapping. Vendor files key on tickers or messy company names; tickers get reused and reassigned. A bad mapping produces a *negative* bit count and looks like "the feed is useless" when it's really "the join is broken." v1 requires a user-supplied mapping file and refuses to score entities below a match-confidence floor.

## v1 scope

- Daily bars, US equities, one forward horizon (5d), sign-of-return label.
- Baseline features: 5 lagged returns, 20d realized vol, day-of-week.
- Bits/observation + bootstrap CI + the latency-shift curve, rendered to one self-contained HTML file.
- User-supplied ticker mapping CSV, required.

## Out of scope

Intraday, options, portfolio construction, position sizing, any actual trading, multi-vendor comparison, a hosted service.

## Risks & unknowns

Trial licenses often forbid "evaluation for publication" — the tool must stay local and never phone home. Feeds with genuine-but-tiny edge (0.002 bits) may sit inside the CI at trial-length sample sizes; the honest output is "this trial is too short to tell," and users may hate that answer more than a fake one. Bits do not equal dollars: a feed can be informative and uncapturable after costs.

## Done means

Given a synthetic feed constructed with a known 0.01-bit edge and a second synthetic feed built from a 1-day-forward peek, the tool reports the first as significant with a flat shift curve, and the second as significant-but-collapsing-to-zero at the honest latency, in under 3 minutes on a laptop for 500 symbols × 5 years.
