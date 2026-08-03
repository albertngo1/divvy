## Overview

A resolution-risk rating for prediction markets. Every open market gets a calibrated probability that its resolution will be *contested or surprising* — not that the underlying event happens, but that the rules as written fail to cleanly map reality to YES/NO. Free public leaderboard of the ugliest open markets; paid feed + alerts for traders with real size on.

For: mid-size prediction-market traders who can carefully read ten markets a week and are exposed to four thousand.

## Problem

The recurring way to lose money on Polymarket isn't a bad forecast, it's "resolved NO on a technicality." Timezone unstated, source of truth is "credible reporting," the tie case has no clause, the deadline is a different instant than the event. Everyone learns this anecdotally after getting burned. Nobody prices it *ex ante* — and the labels needed to price it are sitting in public, unjoined.

## How it works

The arbitrage: **the dispute record is on-chain and free, and nobody has joined it to rules text at scale.** Polymarket resolves through UMA's Optimistic Oracle on Polygon. Every `ProposePrice`, `DisputePrice`, and `Settle` event is a public log, and the `ancillaryData` blob decodes to the *exact resolution text* of that market. That is a labeled corpus of thousands of (rules text → was it disputed / did it flip) pairs, sitting there for the cost of an RPC call.

Pipeline:
1. Pull historical markets from `gamma-api.polymarket.com/markets` + Kalshi `trade-api/v2/markets` (rulebook variant + settlement source fields).
2. Pull UMA OOv2 logs via Alchemy/subgraph; decode `ancillaryData`; join on question ID.
3. Label: `disputed` = a dispute event fired. `surprise` = final resolution contradicted the 24h-pre-close midpoint by >30¢.
4. Featurize the rules text.
5. Score every *open* market nightly; publish.

## Technical approach

Python, DuckDB for the joined corpus, LightGBM over a hybrid feature set. Hand features do most of the work and are the actual product insight: named authoritative source with a resolvable URL vs. vague "credible reporting"; explicit timezone; explicit tie/void clause present; count of `or`/`and` branches in the condition; count of predicates with no operational definition ("significant," "officially," "announces"); event-time vs. resolution-deadline mismatch in days; whether the source of truth is itself social media.

Extraction of those features runs through an LLM pass that fills a strict **resolution contract** schema — `{source, source_url, timezone, cutoff_instant, tie_rule, void_conditions, actor}` — where a `null` field *is* the risk signal. Structured-output call, one per market, cached by text hash. TF-IDF char n-grams over the raw text ride alongside to catch template families.

Calibrate with isotonic regression on a time-forward holdout; report Brier score and reliability curve against the base rate publicly, because a risk score nobody can audit is worthless.

Hard parts: disputes are rare (~2–5%), so class imbalance and tiny effective sample. Worse, non-stationarity — platforms revise their rule templates, so a feature that predicted disputes in 2024 may be extinct. Mitigate with rolling-window retrain and template-family clustering so a new template flags as out-of-distribution rather than silently scoring 0.02.

## v1 scope

- Polymarket only, 300 resolved markets
- 8 hand features, logistic regression, no LLM pass
- One static HTML table of open markets, sorted by score
- Manually eyeball the top 20 to check they're actually ugly

## Out of scope

Event-probability forecasting. Auto-trading. Kalshi. Any claim of legal or financial advice.

## Risks & unknowns

Disputes may be dominated by one whale's behavior rather than text quality. `ancillaryData` decoding is undocumented and format-drifty. If the model just learns "political markets get disputed," it's a category average dressed as a model — the ablation against a category-only baseline is mandatory, not optional.

## Done means

On a time-forward holdout, the model beats a category-base-rate baseline on Brier score, and its top-decile open markets contain at least 3× the dispute rate of the bottom decile.
