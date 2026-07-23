## Overview
A CLI for analysts, data engineers, and PMs that scans a dataset for Simpson's paradox and other aggregation lies: cases where an overall trend reverses (or vanishes) once you split by a lurking variable. Pipe in a CSV or a SQL query result and it tells you which cut betrays your headline number.

## Problem
'Your analytics are lying to you' is a genre because aggregate metrics routinely reverse under grouping — the classic kidney-stone / UC Berkeley admissions trap. Every dashboard shows a comforting line going up; nobody re-checks whether that line inverts inside each segment. Spotting it is manual, ad-hoc, and usually happens *after* someone ships a bad decision. There's no `git diff`-style tool that just flags it.

## How it works
You point it at a table and name (or let it infer) an outcome column and a treatment/comparison column: `reversal data.csv --outcome converted --by variant`. It computes the marginal effect (variant A vs B overall), then re-computes the same effect conditioned on every candidate grouping column (plan tier, country, device, cohort month…). When the conditional effects agree in sign but the marginal disagrees — the signature of Simpson's paradox — it emits a ranked report: 'Overall B wins by +4%, but B loses in 5/6 segments; the aggregate is driven by segment mix.' It renders a tiny terminal sparkbar per segment and, with `--html`, a fan chart showing the marginal line and the per-segment lines diverging. Exit code is nonzero when a reversal is found, so it drops into CI over a metrics query.

## Technical approach
Python + Polars (fast group-bys on millions of rows) + Typer for the CLI; DuckDB adapter so you can feed it a `SELECT` directly against Parquet/Postgres. Core: for a binary or continuous outcome, compute marginal difference-in-means (or log-odds), then for each low-cardinality column compute the Cochran–Mantel–Haenszel pooled effect and the per-stratum effects; flag when sign(marginal) ≠ sign(pooled) or sign(majority of strata). Rank by effect-size swing and stratum support. Continuous confounders get auto-binned by quantile. Hard part: candidate-confounder selection and multiple-comparison sanity — avoid crying wolf on tiny strata (require minimum support and a bootstrap CI on the swing before flagging).

## v1 scope
- CSV/Parquet input, `--outcome`, `--by`, optional explicit `--confounders`
- Binary and continuous outcomes; auto-bin numeric confounders
- Ranked text report with per-segment sparkbars and nonzero exit on flag
- Minimum-support + bootstrap guard against false alarms

## Out of scope
- Full causal DAG inference, propensity scoring
- Streaming/live data, a hosted UI, DB write-back

## Risks & unknowns
- False positives from noisy small strata (the guard is load-bearing)
- High-cardinality confounders explode the search — needs sane defaults
- Users may confuse 'a reversal exists' with 'here's the causal truth'

## Done means
On a bundled fixture reproducing the UC Berkeley admissions data, `reversal` reports the sign flip between overall and per-department admit rates, exits nonzero, and names 'department' as the driving variable — while exiting zero on a control fixture with no paradox.
