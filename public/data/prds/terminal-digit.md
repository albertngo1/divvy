## Overview
A local, offline analysis pass over your personal health export (Apple Health, Garmin Connect, Oura, a smart scale) that answers one question no dashboard will: *is this change larger than the measurement error?* It outputs a single HTML report with your usual charts redrawn over a gray band of minimum detectable change, and a receipt listing which of your trends survive.

## Problem
Every tracker renders more precision than it possesses. A scale reports 0.1 lb while its actual lattice is 0.2 lb and your day-to-day within-subject SD is 1.4 lb. Sleep scores and readiness indices are unitless vendor composites with no error model at all. Meanwhile, manually-logged fields carry a documented human artifact — terminal digit preference, where weights pile up on 0 and 5 and blood pressures on even numbers. The result is that people chase, celebrate, and course-correct on quantization noise, and nothing in the ecosystem tells them.

## How it works
1. **Lattice detection** — for each metric, collect distinct values, and for each candidate step *s* score the fraction of values within epsilon of *k·s*; pick the largest *s* explaining ≥95%. Cross-check with a periodogram of the value histogram. Reports "claimed resolution 0.1, actual lattice 0.2."
2. **Terminal-digit test** — chi-square against uniform on the last significant digit, per metric and per data source. Flags human rounding and, when it appears only on manually-entered days, says so.
3. **Reliability** — estimate SEM from same-day repeated measurements where they exist, otherwise from residuals after a loess detrend over a 7-day window. MDC = 1.96·√2·SEM.
4. **Redraw** — every chart gets a ±MDC band; each streak, PR, and month-over-month delta is tagged *real* or *indistinguishable from noise*.
5. **Receipt** — one paragraph per metric in plain language, plus an honest "opaque index, no error model" verdict for vendor composites.

## Technical approach
Python + polars, runs entirely on your machine. Apple Health `export.xml` is gigabytes, so parse with `lxml.etree.iterparse` streaming into Parquet keyed `(metric, source_device, timestamp, value, entry_mode)`. Garmin via FIT files (`fitparse`) or the Connect CSV export; Oura via its v2 API. Stats with scipy; charts rendered as Observable Plot in a single self-contained HTML file. The hard part is separating instrument quantization from a genuine biological plateau — a flat week on a coarse lattice looks identical to a flat week, so the report must distinguish "below resolution" from "measured as unchanged" and refuse to claim the latter.

## v1 scope
- Apple Health export only, two metrics: body weight and resting heart rate
- Lattice detector + terminal-digit chi-square
- One HTML page: two charts with MDC bands, one text receipt

## Out of scope
Cloud sync, live API polling, multi-person comparison, any advice about what to *do* about the noise.

## Risks & unknowns
Vendors pre-smooth some series, which fabricates false precision and defeats residual-based SEM; devices change mid-history (new scale, new watch) and each needs its own lattice; small-N metrics won't support a stable SEM and must be declined rather than estimated badly.

## Done means
Run against a real multi-year Apple Health export, it prints the true step size for weight and resting HR, reports a p-value for terminal-digit uniformity, and marks at least one previously-celebrated streak as inside the noise band.
