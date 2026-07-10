## Overview
Quiet NaN is a debugging tool for data/ML engineers who lose hours to the question 'where did this NaN come from?' It instruments a pandas/polars pipeline, records provenance for every missing/NaN value, and answers: which source op created it, and which of my final numbers it corrupted.

## Problem
A single NaN or null enters a join, a divide-by-zero, or a bad parse, then propagates through means, merges, and model inputs until an entire column is garbage — or worse, silently plausible. The Lobsters 'two case studies of NaN' post nails how these hide. Today you bisect by hand with `df.isna().sum()` sprinkled everywhere. arXiv's ImputeViz visualizes *where* data is missing but not *how it spread*.

## How it works
You wrap your pipeline: `with quietnan.trace(): result = build_features(raw)`. Every NaN-producing op (parse failure, `0/0`, left-join miss, `.astype`, resample gaps) stamps the value with a provenance token: (source_op, source_row, reason). Arithmetic and reshape ops propagate and merge tokens. At the end you get a report: 'Column `ltv` has 412 NaNs; 390 trace to op#7 (join on `user_id`, unmatched keys); 22 to op#3 (int parse of `age`).' A Plotly Sankey shows NaN flow op→op→column; click a poisoned output cell to see its full origin chain.

## Technical approach
Python, hooking pandas/polars via monkeypatched wrappers (or the pandas extension-array interface). Core data structure: a sparse provenance sidecar aligned to each DataFrame — a `dict[(col, row_hash) -> ProvToken]`, updated by intercepting a curated set of ~30 ops (arithmetic, `merge`, `concat`, `groupby.agg`, `fillna`, `astype`, `to_datetime`). NaN merge semantics: any op consuming a tainted input yields a token that unions parents (bounded fan-in to keep it O(1) per cell). The genuinely hard part is provenance through reshapes and aggregations without O(n²) blowup — use row-index lineage and cap chains at depth K, summarizing beyond that. Report renders as a standalone HTML (Plotly Sankey + a lineage inspector). Ships as a `pip` package + optional pytest fixture that fails a test when a 'clean' column gains NaNs.

## v1 scope
- pandas only
- Instrument ~10 highest-value ops (merge, arithmetic, astype, to_datetime, groupby.agg)
- Provenance token with source op + reason, no full row lineage
- One HTML report: per-column NaN counts attributed to source ops
- `pytest` assertion helper: `assert_no_new_nans(before, after)`

## Out of scope
- polars/Spark/SQL engines
- Real-time streaming
- Auto-fixing / imputation suggestions
- Non-NaN 'bad value' classes (inf handled but not sentinels like -999)

## Risks & unknowns
- Monkeypatching pandas is brittle across versions; may need to pin.
- Overhead on large frames could be prohibitive — needs sampling mode.
- Aggregation provenance may explode; depth-cap heuristics untested on real pipelines.

## Done means
On a seeded 5-op demo pipeline where a NaN enters via an unmatched join, the report correctly attributes ≥95% of final-column NaNs to that join op, and the Sankey renders the flow, in under 2× the pipeline's normal runtime for a 1M-row frame.
