## Overview
Over/Under turns your quantified-self data into a daily calibration game shaped like a sportsbook. Every morning 'the house' — a small forecasting model fit on your own historical metrics — posts betting lines on the day ahead. You wager play-money on OVER or UNDER, and reality settles the ticket at midnight. For fitness-tracker owners who want their data to be a game they can actually *win*, and for anyone who read 'the unreasonable difficulty of time-series forecasting' and wants to feel it personally.

## Problem
Wearable apps show you yesterday and a flat trend line; nothing asks you to *predict* and holds you accountable. Yet you have private edge — you know you're traveling tomorrow, sleeping badly, racing Saturday — that no model has. The itch: a low-stakes daily ritual that rewards knowing your own body better than the algorithm does, and quietly teaches probabilistic calibration.

## How it works
Each morning you get 3–5 lines: 'Steps O/U 8,400', 'Resting HR O/U 54', 'Sleep O/U 6h50m', each with model-implied odds. You stake from a bankroll on each. At day's end the daemon pulls actuals and settles: beat the house line in your favored direction, you win at the posted odds. A running bankroll + a **calibration score** (Brier/log-loss on your implied probabilities) is the real leaderboard against yourself; a rolling 'season' resets the bankroll monthly. Roguelike flavor: a losing streak shrinks your max stake ('cold hand'), a hot streak unlocks parlays across metrics.

## Technical approach
Local Python daemon. Data via the Garmin Connect MCP already on the homelab (or Strava/Apple Health export) — pull daily steps, resting HR, sleep duration/stages. House model: per-metric baseline = seasonal-naive + a gradient-boosted residual model (day-of-week, recent 7/28-day windows, prior-night sleep as a feature for next-day HR) → predictive distribution → over/under line at the median and odds from the CDF. SQLite for tickets, bankroll, settled results. The genuinely hard part is honest lines: the model must be well-calibrated on YOUR sparse noisy history, so use conformal-style residual quantiles rather than trusting a point forecast, and widen odds where recent volatility is high.

## v1 scope
- 3 metrics (steps, resting HR, sleep duration)
- Seasonal-naive + quantile lines; simple bankroll
- One CLI/menubar prompt AM (bet) and PM (settle)
- Personal calibration score chart

## Out of scope
- Multiplayer / betting against friends
- Real money (never)
- Fancy ML; start with baselines

## Risks & unknowns
- Cold start: needs ~60 days of history for sane lines
- Garmin sync gaps → unsettleable tickets (void them)
- Self-fulfilling behavior (betting over then walking to win) — feature, not bug, but muddies calibration
- Could feel like a chore; the AM/PM ritual must be 15 seconds

## Done means
With 60+ days of Garmin history loaded, the app posts three settled over/under lines each morning, accepts stakes, auto-settles from actuals at day's end, and after two weeks shows a bankroll curve and a Brier calibration score comparing you to the house model.
