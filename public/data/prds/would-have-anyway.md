## Overview
A local desktop app for people with years of self-tracked data — Apple Health, Garmin, Oura, a mood CSV, a focus-hours log — who keep concluding that a change worked. It computes what your own data would have done *without* the intervention, and reports only the residual. Solo, offline, deliberately unflattering.

## Problem
You start tracking when you feel bad. You intervene when a metric is at its worst. Metrics regress toward their own mean regardless. So every intervention started at a trough looks like it worked — cold plunges, magnesium, a new sleep schedule, deleting an app. This is the same statistical artifact that may explain the entire Dunning–Kruger effect: autocorrelated data plus selection on extremes manufactures an effect out of nothing. Every consumer health app amplifies this by showing raw before/after bars. Nobody ships the null model, because the null model is the part that says "no."

## How it works
1. **Import.** Apple Health `export.xml`, Garmin Connect via `garminconnect`, Oura API v2, or any CSV with a date column. Everything lands in a local SQLite table `observation(metric, date, value, source)`.
2. **Log interventions.** Free text plus a start date, and optionally a stop date: "started magnesium, 2025-11-02", "stopped alcohol on weeknights, 2026-01-14". Backdating is allowed and marked.
3. **Baseline.** Per metric, fit a nuisance model on pre-intervention data: day-of-week effects, a slow seasonal term, and an AR(1) autocorrelation coefficient. This is the "you, doing nothing" generator.
4. **Placebo-in-time test.** The core move. Slide the intervention's start date to every other feasible date in your history, recompute the same pre/post effect statistic each time, and see where your real start date lands in that distribution. If 40% of random start dates produce a bigger "improvement" than yours, your p is 0.40 and the verdict is *Would have anyway*.
5. **Report.** Each intervention gets: raw before/after (shown small and grayed), null-adjusted effect with a moving-block bootstrap CI, placebo p-value, and a multiplicity-corrected verdict across everything you tested. Verdicts are three words: **Held up**, **Too noisy**, **Would have anyway**.
6. **Prospective mode.** Design the next one properly: n-of-1 crossover, randomized ABAB blocks with washout, and a power calculation from your own metric's measured variance — it tells you up front "you need 11 weeks to detect a 3ms HRV change, or don't bother."

## Technical approach
Python + DuckDB for the analytics, Tauri front end, all local — no account, no upload. Statsmodels for the AR(1)/seasonal decomposition; the placebo test and moving-block bootstrap (block length ≈ 2×the estimated autocorrelation time) are ~120 lines of NumPy. Effect statistic is a difference in post-window mean vs. counterfactual forecast, windowed to a user-set lag so "it takes 3 weeks to kick in" is expressible. The genuinely hard part is honest multiplicity: users fish, retroactively logging every intervention they can remember, so the app must track the *number of hypotheses actually examined* and apply Benjamini–Hochberg across them — including the ones the user quietly deleted after seeing a bad verdict.

## v1 scope
- One import path: Apple Health `export.xml`
- Three metrics: resting HR, sleep duration, HRV
- Interventions typed manually into a table
- One output: the placebo p-value plus a three-word verdict

## Out of scope
- Prospective experiment designer
- Correlation hunting across metrics
- Any recommendation about what to try
- Sync, cloud, sharing

## Risks & unknowns
- People may hate being told their routine did nothing and uninstall it — tone of the verdict copy is load-bearing
- Slow, long-horizon effects (a year of lifting) are genuinely hard to separate from trend
- Wearable firmware updates silently shift baselines and will look like real interventions; needs a device-change detector

## Done means
Feed it a synthetic series that is pure AR(1) noise plus a fake intervention placed at the running minimum; the app reports a raw "improvement" and a placebo p-value above 0.3 with the verdict *Would have anyway*. Then inject a true 5% step change and watch p drop below 0.05.
