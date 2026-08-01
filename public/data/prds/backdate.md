## Overview
Backdate is a single-user habit and mood tracker whose storage is a real git repository. Retroactive edits are fully permitted — backfill a week, upgrade last Tuesday's rating, rewrite a note — and every one of them is permanently visible. The product is not the log; it's the *revision history of the log*. For anyone who has ever filled in five days of tracking on a Sunday and then quietly believed the resulting chart.

## Problem
Self-tracking apps present recalled data as if it were measured data. Backfill and post-hoc edits are silently absorbed into the same clean streak line, so the chart flatters you exactly where it's weakest. Meanwhile the edit behavior itself is a real signal — recall latency, revision churn, and mood-congruent rewriting of the past are documented biases, and no tracker surfaces them because every tracker is trying to sell you a streak.

## How it works
Store: `~/.backdate/`, a git repo, one file per day at `2026/08/01.yaml` holding `mood: 3`, `habits: [ran, read]`, `note: …`. Every write is a commit whose message carries a trailer `Logged-For: 2026-07-28`. Commit author time is wall-clock. Nothing is ever amended or rebased.

That gives, for free, four derived metrics from `git log --follow -- 2026/07/28.yaml`:
- **Latency**: commit time − subject date. Distribution, not an average.
- **Churn**: number of revisions per day-file.
- **Drift**: for revised days, the signed change in the numeric value.
- **Contamination**: correlation between drift direction and the mood *of the day you did the editing* — did a good week retroactively brighten a bad Tuesday?

Viz: a **blame wall**. Calendar heatmap where hue = value and alpha = staleness (how long after the fact it was first logged), with a caret on any cell revised later. Click a cell → a diff timeline of what past-you believed on each date it was touched. Streaks are computed twice and shown side by side: a naive streak, and a confidence-weighted streak counting only entries logged within 24h, with backfilled days ghosted.

## Technical approach
Rust or Node CLI (`backdate log`, `backdate blame 2026-07-28`, `backdate report`) shelling out to `git` — no libgit2 needed at this size. Parse `git log --follow --format=%H%x00%at%x00%B --patch` once, cache into SQLite (`entries(date, commit, at, value, note)`), regenerate incrementally by last-seen SHA. Report is a self-contained HTML file using Observable Plot; the calendar is an SVG grid keyed on date with `fill` from value and `fill-opacity` from a log-scaled latency.

Stats are deliberately humble: n is small, so use sign tests and bootstrap CIs on the drift-vs-editing-mood relationship and print n alongside every number. The genuinely hard part is UX rather than code — retroactive editing must feel *permitted and unjudged* at write time, or people will stop backfilling and the whole dataset dies; the judgment has to live only in the report. Second hard part: separating benign backfill (I was on a plane) from motivated revision, which needs an optional one-tap reason tag rather than an inference.

## v1 scope
- CLI with `log` (one numeric field + free text), writing YAML and committing
- `report` printing latency distribution, revision count, and drift direction counts
- One static HTML blame wall, calendar only
- No sync, no mobile, no reminders

## Out of scope
Multi-metric schemas, phone app, encryption, wearable imports, sharing, any coaching or advice.

## Risks & unknowns
Might moralize at the user and kill adoption; three weeks of data may be too sparse for the contamination stat to say anything; git repo grows one commit per entry (fine for decades, but `--follow` gets slow enough to need the cache).

## Done means
After 21 consecutive days of personal use, `backdate report` prints a latency histogram, a nonzero revision count, and a sign test on drift direction with its n; the HTML blame wall renders every day with correct staleness shading, and clicking a revised day shows its full belief timeline.
