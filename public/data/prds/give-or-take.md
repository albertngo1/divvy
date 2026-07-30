## Overview
A macOS menubar widget for people who have stopped believing their own machine. It replaces point-estimate ETAs — battery "time remaining", build durations, download finishes — with *calibrated prediction intervals* derived from your own logged history, and keeps a running receipt of how often those intervals were actually right.

## Problem
"1:47 remaining" is a fiction produced by dividing current draw into remaining charge. It swings by an hour when you open Slack. Same for `npm install` ETAs and Xcode's progress bar. These are all point estimates from tiny, drifting, non-stationary data — exactly the regime where a point estimate is the wrong object. Nobody ships intervals because nobody wants to admit the width. That's the joke and the product.

## How it works
Collectors log outcomes with features. For battery: every 60s record charge %, screen brightness, foreground app bundle id, active CPU package power (`powermetrics`), thermal pressure — and later, the observed wall-clock time to reach 5%. That completed observation becomes a training row.

Prediction is two-stage. A cheap base model ŷ(x) — k-NN over standardized features, k≈15 — gives a mean estimate. A difficulty model σ̂(x) (k-NN mean absolute residual of neighbors) normalizes it. Then split conformal: keep a calibration set of normalized residuals |y−ŷ|/σ̂, take the ⌈(1−α)(n+1)⌉-th order statistic Q, and emit [ŷ−Qσ̂, ŷ+Qσ̂]. Because your battery *ages*, coverage drifts, so run Adaptive Conformal Inference online: α_{t+1} = α_t + γ(α − err_t) with γ≈0.02, which provably drags long-run coverage back to nominal under arbitrary drift.

The menubar shows no number — a small horizontal bar with a soft-edged band, width = interval width. Click for a "coverage receipt": empirical coverage of the last 100 closed predictions per estimator, red when it dips under nominal. The widget shaming itself is the feature.

## Technical approach
Swift menubar shell (`NSStatusItem`, custom `NSView` for the band) + IOKit `IOPSCopyPowerSourcesInfo` for battery; a Python sidecar (`uv`-managed, launchd `KeepAlive`) doing storage and inference. SQLite with two tables: `observations(ts, estimator, features_json, y)` and `predictions(ts, estimator, lo, hi, alpha, y_actual, closed_at)`. Conformal math is ~80 lines of NumPy — no MAPIE needed, though its test suite is a good oracle. Build-time estimator ships as a shell wrapper that times `make`/`cargo`/`npm` and records `git diff --name-only | wc -l` plus cold/warm cache as features.

Hard part: cold start. With n<40 calibration points the quantile is garbage, so v1 must fall back to a visibly "uncalibrated" hatched bar and refuse to claim coverage.

## v1 scope
- Battery only, one estimator, α=0.1
- Six features, k-NN base + k-NN difficulty, split conformal, ACI update
- Menubar band + coverage receipt popover
- Hatched "not yet calibrated" state under 40 observations

## Out of scope
Build/download estimators, iCloud sync, gradient boosting, Windows/Linux, exporting anything.

## Risks & unknowns
Battery discharges to 5% may be rare (weeks to collect n=40) — may need interval-censored partial discharges, which complicates conformal. Feature drift from OS updates. Users may find honest widths depressing rather than delightful.

## Done means
After 3 weeks on one laptop, the last 100 closed 90% intervals cover the true value between 85% and 95% of the time, and the receipt panel proves it without hand-editing the DB.
