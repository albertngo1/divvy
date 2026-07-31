## Overview
A solo web app that forecasts your next 24 hours of alertness from your actual sleep data, then lets you play against it — placing caffeine doses, naps, and bright-light exposure on a timeline and seeing the predicted curve reshape in real time. Airlines run this model on their pilots (SAFTE-FAST, FAA-blessed fatigue risk management). You get the same instrument for one person: you.

## Problem
You already know you crater around 14:30, and you already respond by drinking coffee at whatever hour you happen to notice. There is no feedback loop, because the effect of a 13:00 espresso on your 21:00 sleep onset is invisible at the moment of decision. Every consumer sleep app shows you a *score for last night* — backward-looking, non-actionable. Nothing shows you tomorrow as a thing you can steer.

## How it works
Overnight it pulls your sleep timings; each morning it renders a curve: predicted alertness 06:00→02:00, with the afternoon trough marked and a shaded uncertainty band. You drag countermeasure chips onto it — `☕ 80mg`, `☕ 160mg`, `😴 20min`, `☀️ 10k lux 30min` — and the curve responds instantly, including the cost: a 16:00 double espresso visibly raises your evening and visibly delays predicted sleep onset. You commit a plan. Two or three times a day it nudges you for a 90-second PVT (psychomotor vigilance test: a dot appears at random 2–10s intervals, you tap). Those measurements are ground truth. Weekly, it refits the model to you and reports *your* numbers: your caffeine half-life, your circadian phase, your personal trough time.

## Technical approach
Core is the Borbély two-process model. Process S: exponential homeostatic pressure, building with τ_w ≈ 18.2h awake and decaying with τ_s ≈ 4.2h asleep. Process C: 24h fundamental plus a 12h harmonic with phase φ. Alertness = C − S, mapped to predicted PVT mean reciprocal reaction time and lapse count (RT > 500 ms) via a linear link. Caffeine is a one-compartment PK model (ka ≈ 1/h, t½ 3–7h) acting as a multiplicative attenuation of S's weight, following the published open-form caffeine module from the Reifman group. Light nudges φ through a Kronauer-style phase response curve.

Fitting: MAP estimate over (τ_w, φ, caffeine t½, PVT intercept/slope) with `scipy.optimize.least_squares` against 30 days of (sleep intervals, logged doses, PVT results); population priors keep it sane with sparse data.

Stack: FastAPI + SQLite backend, React + SVG front end, sleep from the Garmin Connect API (a Garmin MCP already runs locally on 8003), caffeine logged by three taps.

The genuinely hard part is browser PVT validity — input and compositor jitter add tens of ms. Mitigate by scoring *lapse count* and *median* RT rather than mean, timestamping with `event.timeStamp` against `requestAnimationFrame`, and running a one-time per-device latency calibration so a phone and a laptop aren't compared naively.

## v1 scope
- Manual sleep entry (bed/wake), no Garmin
- Fixed population parameters, no per-user fitting
- One draggable caffeine dose, one nap
- PVT that records to SQLite and plots measured vs predicted

## Out of scope
Raw-accelerometry sleep staging, alcohol, meals, shift rosters, any clinical claim or diagnosis.

## Risks & unknowns
Self-reported dosing is mush; two-process refits need weeks of PVTs to beat the prior; and a daily alertness number can curdle into anxiety — so the UI shows a plan, not a grade.

## Done means
Fourteen consecutive days logged where the morning forecast's predicted trough time lands within ±45 minutes of your measured PVT trough, and dragging a simulated espresso from 13:00 to 16:00 visibly changes both the evening curve and predicted sleep onset.
