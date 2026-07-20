## Overview
Thread Count is a nightly cron daemon that turns your smart bed's temperature log into a slowly-accreting generative textile artifact. For homelabbers who own a water-cooled/heated mattress pad (Eight Sleep, ChiliPad, or a DIY rig with a bedctl-style API) and already sync a Garmin, it quietly weaves one horizontal 'pick' per night into a year-long 'thermal quilt' you can print, or literally send to a TAJ/AxiDraw/knitting machine on New Year's.

## Problem
The water-cooled bed knows something intimate—how hard your body fought its thermostat every night—and throws it away. Sleep dashboards render this as forgettable line charts nobody revisits. There's no artifact, no accumulation, no reason to look back at the year of nights you actually lived.

## How it works
Each morning the daemon pulls (a) the bed's setpoint + the pump's actual heating/cooling duty cycle across the night, and (b) Garmin sleep stages, restlessness, and skin/HR data for the same window. It renders one horizontal band ~4px tall: warp position = time-of-night (dusk left, dawn right); hue = bed water temp (cool blue → warm amber); saturation = how hard the pump worked to hold setpoint (effort = conflict); vertical thread-jitter/noise = movement and wake events. Bands stack top-to-bottom; by December you have a 365-row tapestry where insomniac summer nights fray and calm winter nights lie flat and even. A tiny always-on wallpaper shows the growing weave.

## Technical approach
Python daemon on the homelab. Data: bedctl-style local HTTP API (or Eight Sleep unofficial API) for setpoint + duty-cycle time series; Garmin via the existing `garmin` MCP (`get_sleep_data`) for stages/restlessness. Store per-night vectors in SQLite (one row per night, JSON blob of the resampled minute series). Render with a small canvas library (Pillow / skia-python) writing an ever-growing PNG plus an SVG export for pen-plotter/loom. Color mapping is a perceptual CIELAB ramp so effort reads honestly. The genuinely hard part: aligning two clocks with different sampling rates and gaps (bed pump events are sparse/event-driven; Garmin is minute-binned) into one coherent per-night lattice, and making a year of rows stay legible without becoming mush—needs a fixed visual budget per night decided up front.

## v1 scope
- Read one night of bed duty-cycle + one night of Garmin sleep from local files/APIs
- Render a single band and append to a PNG
- Cron it nightly; wallpaper symlink updates
- Hard-code the color ramp and layout

## Out of scope
- Physical loom/knit output
- Multi-person beds / dual zones
- Any cloud service or sharing

## Risks & unknowns
- Bed API availability varies wildly by vendor; duty-cycle data may not be exposed
- A year is a long feedback loop—need a 'fast-forward from historical data' seeding mode to feel real on day one
- Aesthetic risk: could look like noise, not a quilt

## Done means
Running nightly for 14 real days produces a 14-band PNG where you can point at a specific rough night and it visibly differs (more jitter, hotter effort) from a calm one, plus a `--backfill` that reconstructs the last 30 days from stored data.
