## Overview
By Heart is a daily one-draw guessing game for wearable owners: reproduce your own biometric curve from memory, then see how close you were. It borrows ShapeTalk's sketch-as-query idea but points it inward — the dataset you're guessing is *you*, yesterday.

## Problem
You wear a watch every waking hour and generate a rich stream of data, yet you have almost no *felt* sense of it. Dashboards are passive — you glance, you forget. There's no loop that forces you to build an internal model of your own rhythms, and no reward for getting better at reading yourself.

## How it works
Each morning the app picks one metric and window (yesterday's resting-to-active heart rate, last night's sleep stages, this week's step distribution). It shows a blank labeled axis. You finger-draw the curve you *think* happened. On submit, it animates in the real series over your sketch and scores the match — lower distance = higher "self-knowledge" score. Streaks build for consecutive days; a shareable card shows your curve, the truth, and your score. Over weeks you get measurably better at predicting your own body.

## Technical approach
Web app (SvelteKit + canvas). Data pulled via the Garmin Connect MCP (`get_heart_rates`, `get_sleep_data`, `get_daily_steps`) or Strava streams. The sketch is captured as a polyline, resampled to N evenly-spaced points, min-max normalized on both axes, and compared to the normalized actual series with Dynamic Time Warping so horizontal misalignment is forgiven but shape errors are penalized. Metric selection is date-seeded for determinism. Hard part: making DTW scoring *feel* fair and legible across metric types with very different shapes (spiky HR vs. blocky sleep stages).

## v1 scope
- Heart rate only, yesterday's window
- One draw per day
- DTW score + overlay reveal
- Local streak counter

## Out of scope
- Multiple metrics / metric picker
- Social leaderboard
- Predicting *tomorrow* (forecasting mode)
- Non-Garmin data sources

## Risks & unknowns
- DTW score may feel arbitrary without careful normalization and tuning
- Garmin MCP reliability / rate limits for a daily fetch
- Audience is narrow — only wearable owners, and only ones who find introspection fun

## Done means
Open the app, finger-draw a curve on a blank axis, and get a DTW-scored overlay of yesterday's real Garmin heart-rate series with a numeric self-knowledge score.
