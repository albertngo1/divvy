## Overview
Dead Reckoning is a single-player survival/journey sim for endurance athletes who already wear a Garmin. You are one person alone in a tiny rowboat attempting a real great-circle ocean crossing (default: Monterey → Honolulu, ~2,400 nautical miles). The catch: nothing in the game is a minigame. Your actual training data — distance, sleep, HRV, resting heart rate — is the entire physics engine. Sparked by the HN story of the woman who rowed California to Hawaii solo, crossed with Project Zomboid's grind and the Garmin MCP already on this box.

## Problem
Fitness apps gamify with hollow abstractions: badges, streaks, confetti. None of them make a *missed* day feel like a cost, or make good recovery feel like it kept you alive. There's no ambient, weeks-long stake that turns your real body into a protagonist.

## How it works
Each morning the sim pulls yesterday's data. Distance covered in any locomotive sport converts to nautical miles along the route at a tuned exchange rate (~1 real km = 1 nm of progress). But the ocean pushes back: a modeled prevailing current subtracts a fixed daily drift, so a zero-distance day means you *lose* ground. Garmin sleep hours refill a 'crew rest' meter that caps how many miles you can bank; overnight HRV and resting HR set a 'morale/health' stat that, if it bottoms out, triggers events (equipment failure, a storm you must 'ride out' by resting). A daily deadpan captain's-log entry (LLM) narrates position, weather, and how close land is.

## Technical approach
Stack: local Python daemon + SQLite + a static SvelteKit map. Data via the Garmin Connect MCP (`get_activities_by_date`, `get_sleep_data`, `get_hrv_data`, `get_rhr_day`) and optionally Strava MCP as fallback. Route is a precomputed great-circle polyline (pyproj geodesic); progress is a scalar arc-length position rendered as a marker on a Leaflet/MapLibre map with a wake trail. Current/weather model is a small deterministic function seeded by date + lat/lon (no live marine API in v1). Log text from a cheap local prompt. Hard part: tuning the exchange rate and drift so the crossing takes a *believable, motivating* number of weeks for this specific athlete without feeling rigged — a calibration pass over their last 90 days of history.

## v1 scope
- One hardcoded route, one athlete (Albert's Garmin)
- Daily cron pulls yesterday's data, advances position, writes a log line
- Static map with marker + wake, single 'you are here / X nm to Hawaii' number
- Drift + crew-rest cap; no storms yet

## Out of scope
- Live marine weather, multiplayer regattas, mobile app, storms/events

## Risks & unknowns
- Garmin API gaps on rest days could stall or corrupt progress
- Exchange-rate tuning may feel punishing or trivial
- Novelty could wear off before the crossing completes

## Done means
After 7 consecutive days of real Garmin data, the map marker sits at the correctly computed arc-length position, at least one zero-activity day visibly moved it backward, and each day produced a coherent captain's-log entry.
