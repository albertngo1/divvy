## Overview
Load Shed reframes daily energy management as running a small electrical grid. Your real biometric "charge" (Garmin Body Battery / HRV) is generation; your calendar events are loads with wattage; you dispatch capacity across the day and try not to black out. For quantified-self folks who ignore their recovery metrics because a number on a watch means nothing until it's a *game*.

## Problem
Garmin already computes Body Battery, but it's a passive gauge you glance at and forget. Nobody plans around it. Meanwhile you cheerfully stack four meetings, a hard workout, and a social dinner onto a day you woke up at 20%. The itch: make the mismatch between capacity and commitment *legible and consequential* before the day happens.

## How it works
Each morning the app pulls today's Body Battery forecast (start value + typical drain/charge curve) and your calendar. Events become loads on a horizontal timeline; each is auto-assigned a wattage (a 90-min deep-work block draws more than a coffee). You allocate your generation curve across loads by dragging. If summed demand exceeds available charge in any window, the grid shows an overload warning; commit anyway and later you can log the actual outcome (crashed / fine) to calibrate. A sleep/nap event is a battery recharge you can schedule as "peaker" capacity. End of day: a dispatch report — reserve margin, whether you shed load or browned out.

## Technical approach
Stack: local web app (SvelteKit) + the Garmin Connect MCP already running on the homelab (`:8003`) for Body Battery and sleep; calendar via ICS/CalDAV. Data model: `GenerationCurve` (per-15-min charge), `Load{event, watts, window}`, `Reserve = cumulative gen − cumulative demand`. Core algorithm is a simple cumulative-sum reserve check per interval plus a greedy "can this fit?" allocator; the interesting part is *learning per-user wattages* — start with heuristics (event duration × category multiplier), then regression against logged crash/fine outcomes so the model personalizes what actually drains you.

## v1 scope
- Pull today's start Body Battery + a fixed textbook drain curve (no live forecast)
- Manual wattage tags on calendar events (dropdown: light/medium/heavy)
- Cumulative reserve line with red overload zones
- End-of-day one-tap "crashed / fine" log

## Out of scope
- Live intraday re-forecasting
- Multi-day planning, streaks, leaderboards
- Auto-classifying event wattage via NLP

## Risks & unknowns
- Body Battery is proprietary and noisy; the morning "forecast" is really just start-value + assumptions — may feel arbitrary.
- Assigning wattage to life events is subjective; the personalization loop needs weeks of logs to pay off.
- Could become one more guilt-gauge you ignore, same fate as the raw metric.

## Done means
On a real morning, the app ingests my actual Garmin Body Battery and today's calendar, renders a reserve curve that flags at least one genuine overload window, and after the day I can log the outcome — and after two weeks the personalized wattages measurably beat the flat heuristic at predicting my "crashed" days.
