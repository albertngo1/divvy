## Overview
A CLI that audits an observability stack for lies of central tendency. It reads your Grafana dashboards and Prometheus alert rules, statically flags queries that are mathematically meaningless, then — the part nobody else does — runs the underlying series and proves the flagged panel is misleading using the actual shape of your data. For SREs, platform teams, and anyone who inherited 200 dashboards from someone who left.

## Problem
Dashboards are full of averages over distributions that averages cannot describe. Worse, they're full of operations that are *not defined*: averaging pre-computed p99s across instances, `histogram_quantile` over a sum that dropped the `le` label, `rate()` on a gauge, alerts thresholded on the mean of a bimodal latency. Nobody notices, because a graph that renders looks like a graph that works. Then an incident happens and the dashboard confidently shows a number that never occurred.

## How it works
`meantime scan --grafana https://... --prom https://...` walks every dashboard and rule, runs two passes, and emits a ranked markdown/HTML report.

Static pass — parse every PromQL expression into an AST and match antipatterns: `avg()`/`sum()` over a series carrying a `quantile` label or a recording rule named like a percentile; `histogram_quantile` whose inner aggregation lacks `by (le)`; `rate()`/`increase()` applied to a gauge; range selectors shorter than 4× the scrape interval; alert expressions comparing an `avg_over_time` to a fixed threshold; `irate` on a panel with a multi-hour window.

Dynamic pass — for each flagged panel, rewrite the AST to strip the outermost aggregation, recovering the pre-aggregation series, and query `/api/v1/query_range` over 14 days. Characterize the result: Hartigan's dip test for multimodality, lognormal-vs-normal fit by AIC for tail weight, and the fraction of mass within ±10% of the mean. Findings read like: *"panel 'API latency (avg)': mean 240ms. Distribution is bimodal at 41ms (cache hit, 78% of mass) and 910ms (cold, 19%). 3% of requests fall within 10% of the displayed number."*

Bonus finding, entirely earnest: if a PagerDuty or Grafana Incident source is configured, show MTTR's actual distribution and how far the mean moves when you delete the single longest incident. Usually a lot.

## Technical approach
Go, so it ships as one binary and can reuse Prometheus's own `promql/parser` — critical, because regexing PromQL is how you get false positives. Dashboards via the Grafana HTTP API (`/api/search`, `/api/dashboards/uid/:uid`); rules via `/api/v1/rules`. Statistics in Go with gonum (dip test implemented directly; it's short). Findings are typed structs with a severity, a rendered explanation, and a suggested rewrite.

The hard part is the AST rewrite that maps a panel's query back to its raw underlying series. Panels are layered — `avg(rate(x[5m])) by (job)` wrapped in a recording rule wrapped in a template variable — so you must resolve `$var` interpolations, expand recording rules from `/api/v1/rules`, and peel aggregations while preserving the selector's label matchers. Get it wrong and you query the wrong data and produce a confidently wrong finding, which would be extremely funny and fatal to trust.

The dangerous-usefulness turn: `meantime lint` runs against dashboards-as-code (Grafonnet, Terraform, JSON in git) as a GitHub Action, failing PRs that introduce a new avg-of-percentile.

## v1 scope
- Three static rules: avg-of-quantile, `histogram_quantile` missing `by (le)`, `rate()` on a gauge
- Dynamic pass: fraction-of-mass-near-mean plus the dip test
- One Grafana + one Prometheus, markdown report to stdout
- No auto-fix, no write access to Grafana

## Out of scope
Datadog/New Relic/InfluxDB, log-based metrics, tracing, auto-rewriting panels, Grafana plugin UI, alert-fatigue scoring.

## Risks & unknowns
Template-variable resolution is a swamp — multi-value and `All` variables may make a panel's query unresolvable without picking arbitrary values. Querying raw pre-aggregation series over 14 days can be expensive enough to hurt production Prometheus; needs sampling and a rate limit. Some flagged patterns are intentional and the report must let teams annotate a panel as "yes, we know."

## Done means
Pointed at a real Grafana with ≥50 dashboards, the scan completes without hammering Prometheus, every static finding is verified by hand as a true positive, and at least one dynamic finding names a panel where under 10% of the underlying data falls near the displayed mean — and a human on that team agrees the panel was misleading them.
