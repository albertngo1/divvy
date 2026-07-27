## Overview
An ambient desktop artifact for anyone who likes infrastructure. Every synchronous machine on an AC grid is a hand on one enormous shared clock: the frequency is 60.000 Hz (or 50) only when generation exactly matches load, and it sags when the continent is drawing more than it makes. Time Error runs that clock in your menubar. It shows how many seconds the grid is behind or ahead of real time, accumulated since you installed it, and it grows a year-long ribbon of the grid's heartbeat.

## Problem
Grid frequency is the most honest real-time economic indicator in existence, published for free, and essentially nobody looks at it. The existing viewers are engineer dashboards with axes and legends. There is no artifact that makes you *feel* that the lights staying on is a continuous 24/7 balancing act, and no consumer-grade thing that says "something big just tripped offline."

## How it works
- Poll a grid frequency feed at 1 Hz. Integrate the deviation: `error += (f − f0)/f0 · Δt`. Display the running total: `grid −8.34 s`. It wanders slowly all day, sagging in the evening ramp, recovering overnight.
- Event detection: over a 500 ms sliding window compute ROCOF (rate of change of frequency). A step below a per-interconnect threshold means a generator or a big load just disconnected. Estimate the magnitude from the swing equation, `ΔP ≈ 2·H·S_base·(df/dt)/f0`, with `H·S_base` a calibration constant per interconnect. Notification: "03:42 — Nordic grid lost roughly 700 MW."
- The ribbon: one pixel column per hour, hue mapped to mean deviation, luminance to variance, a dark notch per detected event. After a year you have a poster where you can see winter evenings, storm days, and the handful of moments something broke.

## Technical approach
- Feeds that are genuinely free and fast: Statnett's Nordic frequency JSON (1 s), Fingrid open data API (3 s, key required), National Grid ESO's GB system frequency (1 s). EIA-930 is hourly and useless here.
- The mischievous path for North America, where high-rate frequency is not openly published: measure it yourself. An ESP32, a 6 V AC wall transformer, and an optocoupler zero-cross detector gives you mains frequency at roughly 1 mHz resolution using the ESP32's hardware timer capture. Your outlet is a sensor for the whole interconnect — a generator trip in Ohio is visible in a Brooklyn kitchen.
- App: Swift menubar host, tiny Rust core for the ring buffer + ROCOF filter, SQLite for the hourly rollups, Metal shader for the ribbon.
- Hard part: rejecting false trips. Local measurement is noisy from harmonics and clipping, so you need a median-of-differences filter and a persistence requirement (deviation must hold for N samples) before declaring an event; magnitude estimation is only order-of-magnitude honest and the UI must say so.

## v1 scope
- One hardcoded feed (Statnett — no API key, 1 s, CORS-friendly).
- Menubar text: accumulated time error, nothing else.
- SQLite hourly rollup + a static PNG ribbon rendered by a script.
- Event detection ships as a log line, not a notification.

## Out of scope
Multi-region comparison, the ESP32 build guide, phase-angle stuff, alerting integrations, mobile.

## Risks & unknowns
API terms and rate limits on the Nordic/GB feeds. Whether accumulated time error is legible to a normal person or just a weird number. Whether the DIY sensor is accurate enough for ROCOF (it may only be good for the slow clock). Utilities also perform deliberate time-error correction, which will confound the accumulator.

## Done means
The menubar shows a number that visibly moves during the evening demand ramp, a 30-day ribbon renders, and at least one detected event lines up with a publicly reported grid disturbance.
