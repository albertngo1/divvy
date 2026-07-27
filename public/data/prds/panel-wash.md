## Overview

**Panel Wash** is a self-hosted dashboard for one household with rooftop solar. It ingests your inverter's daily production, models what a *clean* array should have produced given that day's actual weather, and plots the widening gap as soiling accumulates. The headline is a single number: **cumulative dollars lost to dirt since your last wash**, with a break-even line for what a wash costs you (hose time, or a quoted service).

For the homeowner who has a solar app that shows pretty green bars and answers no useful question.

## Problem

Soiling loss is real (2–7%/yr in most of the US, far worse in dusty or agricultural areas) and completely invisible day to day, because production varies 10× with weather. Every inverter app shows you kWh. None of them separate "cloudy" from "filthy," so nobody knows whether to wash, and the internet's answer is a shrug plus a rainfall anecdote. This is a signal-extraction problem hiding inside a chores problem.

## How it works

Every night the job pulls yesterday's per-interval AC production from the inverter, and yesterday's actual irradiance + temperature for your coordinates. It computes an expected clean-array output via a standard PV performance model, then takes the ratio `actual / expected` = **performance ratio**.

A single day's PR is noisy. The trick is the *shape over time*: soiling produces a slow monotonic decline in PR, punctuated by sharp step-recoveries after rainfall >~5 mm. The dashboard fits that sawtooth explicitly — a piecewise-linear decay with breakpoints anchored at known rain events — which both de-noises the estimate and yields your site's personal soiling rate in %/day.

UI is three things: the PR sawtooth with rain events as vertical ticks; a cumulative $-lost-since-last-wash counter; and a projection card — *"at your current 0.11%/day and $0.14/kWh, washing pays for itself in 9 days; next forecast rain is in 3."* You log a wash with one button, which sets a breakpoint and starts the counter over.

## Technical approach

- **Production data**: whatever the inverter offers — Enphase Enlighten API (`/api/v4/systems/{id}/telemetry/production_micro`), SolarEdge monitoring API, or, for the offline case, a nightly CSV drop. Normalize to 15-min AC kWh.
- **Weather/irradiance**: Open-Meteo's free archive endpoint gives hourly `shortwave_radiation`, `direct_normal_irradiance`, `diffuse_radiation`, `temperature_2m`, and `precipitation` at 1–11 km resolution with no API key — the whole idea is only cheap because this exists.
- **PV model**: `pvlib-python`. ModelChain with the array's tilt/azimuth/DC rating; POA irradiance via Perez transposition, cell temp via SAPM, DC→AC via a PVWatts inverter model. This is the well-trodden path; don't reinvent it.
- **Fit**: per-day PR, then robust piecewise linear regression (Theil–Sen per segment) with breakpoints forced at days where `precipitation > 5 mm`, plus user-logged washes. Slope of each segment = soiling rate.
- **Stack**: Python + APScheduler nightly job → SQLite (`day`, `kwh_actual`, `kwh_expected`, `pr`, `precip_mm`, `wash_flag`) → FastAPI → a single Observable Plot page. Docker Compose, one container.
- **Hard part**: confounders. Shading from a growing tree, panel degradation, and inverter clipping all also depress PR. Mitigation: fit only on clear-sky, non-clipped, mid-day intervals, and treat any decline that *doesn't* recover after heavy rain as degradation rather than soiling — which is itself a useful alert.

## v1 scope

- One inverter vendor. One array orientation.
- Nightly ingest, PR series, rain ticks.
- "$ lost since last wash" number and a Log Wash button.
- Single static HTML page, no auth beyond the LAN.

## Out of scope

- Multi-array/multi-orientation homes; per-string diagnostics.
- Wash-service marketplace or scheduling.
- Anything mobile-native.

## Risks & unknowns

- Needs ~60 days of history before the sawtooth is legible; cold start is unsatisfying.
- Gridded irradiance may be badly wrong under broken cloud, inflating PR noise.
- Honest possibility that in a rainy climate the answer is permanently "never wash" — which is a true and useful answer but a short demo.

## Done means

Fed 6 months of my real production history, it produces a soiling rate in %/day with a stated confidence interval, marks at least one rainfall step-recovery that I can verify against the actual weather that week, and prints a break-even day count that changes correctly when I edit the electricity rate.
