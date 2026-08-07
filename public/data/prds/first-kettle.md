## Overview
First Kettle turns whole-home electricity data into a passive circadian log. It doesn't care about kilowatt-hours or saving money. It cares that your first kettle boil moved from 06:58 to 07:41 over the last six weeks, that you had three appliance events after 02:00 last Tuesday, and that your weekday/weekend midpoint gap — social jetlag — is now 94 minutes. For solo quantified-self people who've bounced off wearables because they forget to charge them or hate sleeping in a watch.

## Problem
Every circadian tool requires a device on your body. Wearables get taken off, batteries die, and the data has gaps exactly on the chaotic weeks that matter most. Meanwhile a meter in your wall has been recording a high-fidelity proxy for "a human is awake and doing things here" continuously for years, and the only software that reads it is trying to sell you a heat pump.

## How it works
Ingest a 1 Hz power series. Detect *events*: rectangular step changes above ~500 W with a start edge, a plateau, and a stop edge. Cluster events in (Δ watts, duration, time-of-day) space with DBSCAN; you hand-label the 4–6 clusters once ("kettle", "toaster", "shower pump", "washer"). Subtract the fridge and HVAC first — they're duty-cycle oscillators with a stable period and amplitude, so an autocorrelation-based filter removes them cleanly.

From the labeled event stream, derive a binary minute-level "activity" series and then compute the standard non-parametric actigraphy metrics on it: **IS** (interdaily stability, how repeatable your 24 h pattern is), **IV** (intradaily variability, how fragmented), and **M10/L5** (most-active 10 h and least-active 5 h windows). Wake time = first non-fridge event after the L5 window. These are real published metrics (Van Someren), just fed a novel sensor.

## Technical approach
Python + SQLite + a single-page local dashboard (uPlot for the day-strip chart). Data source, easiest first: Emporia Vue 2 or a Shelly EM pushing to a local MQTT topic at 1 Hz; fall back to utility 15-minute Green Button XML, which is too coarse for kettles but still gives wake/sleep envelopes. Storage: one row per detected event (`ts, delta_w, duration_s, cluster_id`) — a year fits in a few MB. Key algorithms: edge detection with hysteresis, DBSCAN clustering, autocorrelation-based periodic-load subtraction, and rolling 14-day IS/IV computation. The genuinely hard part is a single-person apartment vs. a household — with roommates the signal is a superposition and "your" wake time is unrecoverable without extra sensors.

## v1 scope
- Read a CSV of 1 Hz power for one week.
- Kettle-only detector: hardcoded 1,200–2,400 W, 60–360 s.
- Print wake time per day and the 7-day drift in minutes.
- No UI. A table in the terminal.

## Out of scope
Appliance-level billing, energy-saving advice, cloud sync, multi-occupant disambiguation, sleep *staging* (this measures behavior, not sleep).

## Risks & unknowns
Induction hobs and variable-speed appliances have non-rectangular signatures; always-on gaming PCs and servers raise the noise floor; someone who works from home has no clean L5 boundary. Validation needs a few weeks of parallel wearable data to check wake times.

## Done means
Over 14 logged days, the detected wake time is within ±15 minutes of a manually kept log on at least 12 of them, and the dashboard shows a drift number you can point at.
