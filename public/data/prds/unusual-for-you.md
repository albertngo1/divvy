## Overview
A solo, local tool that learns the natural cadence of the recurring things in your life from timestamps you already generate, then reports only *deviation from your own history*. No target intervals, no streaks, no checkboxes. For people who bounce off habit trackers because the schedule was always someone else's invention.

## Problem
Every habit tool starts by asking you to declare a frequency: water the plants every 5 days, call home weekly. That number is a guess, and once you miss it the app becomes a scold and you delete it. But you already *have* a real cadence — you replace the water filter roughly every 7 weeks, you get a haircut every 5–9 weeks — and it's sitting in your bank statements, photo timestamps, and shell history. The useful signal isn't "you're late," it's "this gap is unusual **for you**."

## How it works
1. **Ingest event streams** you already have: CSV export from your bank (merchant descriptor + date), Apple Photos library timestamps + on-device scene labels, HealthKit workouts, `~/.zsh_history` with timestamps, calendar `.ics`, Strava/Garmin. Each becomes `(stream, label, timestamp)`.
2. **Cluster into recurring series.** Within a stream, group by normalized label (merchant string cleanup, fuzzy match on `rapidfuzz`); keep any series with ≥5 events spanning ≥90 days.
3. **Fit an interval distribution per series.** Gaps between consecutive events → fit a lognormal (robust to the long tail) and also keep the empirical ECDF. The current open gap is *right-censored*, so compute the conditional survival: given you've already gone 41 days, `P(gap > 41)` from the fitted distribution → the percentile.
4. **Report one line a day.** A menubar item and a plain-text daily file listing only series above the 85th conditional percentile, sorted by how anomalous they are. Clicking one shows the interval histogram with today's gap marked — a single sparkline, nothing else.
5. **Manual series** for things with no digital trace: a one-line CLI `did mom-call` appends a timestamp. That's the whole write interface.

## Technical approach
Python + SQLite (`events(stream, label, ts)`, `series(id, label, params_json, fitted_at)`). `scipy.stats.lognorm.fit` on gaps with a floor of 5 samples; fall back to the empirical ECDF below 12 samples. Photo labels via `osxphotos` (reads the Photos library directly, including Apple's on-device scene classifications — free semantic labels like "plant," "barbecue," "beach"). Bank ingest is CSV-only, no aggregator, no OAuth, everything on disk. Menubar via `rumps`. A weekly cron refits.

The hard part is **series discovery precision** — most auto-discovered series are junk (daily coffee, every commit). Heuristics that actually work: drop series with median gap < 3 days (too routine to be interesting) or > 200 days (too sparse to fit), require a coefficient of variation < 0.8 so genuinely irregular things don't generate noise, and let the user archive a series forever with one keystroke.

## v1 scope
- Two ingesters: manual `did <name>` CLI + a bank CSV
- Empirical ECDF only, no distribution fitting
- One command, `unusual`, prints the ranked list as text
- Archive-a-series flag

## Out of scope
- Notifications, reminders, or anything push. Silence is the product.
- Cloud sync, mobile app, sharing
- Causal claims ("you sleep worse when…")

## Risks & unknowns
- May be quietly cruel: surfacing "you haven't called your father in 210 days" is not neutral. Needs an easy permanent mute.
- Auto-discovered series could be 90% noise, making the tool worthless without manual curation.
- Bank CSV formats vary per institution.

## Done means
Seeded with 12 months of real bank CSV plus 30 manual events, `unusual` returns a list of ≤7 series and the user agrees, unprompted, that at least 4 of them are things they actually care about being behind on.
