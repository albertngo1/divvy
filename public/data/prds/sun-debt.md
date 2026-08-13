## Overview
Sun Debt is a solo, local-first analyzer that takes your phone's location history and computes how many minutes of *direct, unshaded, unclouded* sunlight actually landed on you — per day, per season, per route. It is for people in dense cities who suspect their winter mood has less to do with latitude than with the fact that their commute runs down the north side of a street lined with six-storey buildings.

## Problem
Circadian and mood research keeps pointing at daytime light dose, not step count. Every consumer tracker measures motion; none measure photons. "Time outdoors" is a terrible proxy: 40 minutes walking a shaded canyon at 9am in February is close to zero useful lux, while 8 minutes on a south-facing bench is not. Nobody can tell you which of their habitual routes is the bright one.

## How it works
You drop in a Google Takeout location export (or an iOS `Significant Locations`/GPX file). For every timestamped point, the tool computes solar azimuth/elevation, then casts a ray from you toward the sun and asks: does it clear the buildings and terrain between here and the horizon? Multiply the sunlit boolean by a clear-sky irradiance model attenuated by that hour's real cloud cover, and you get an estimated lux-minutes ledger. Output is three things: a daily bar chart of sunlit-minutes against a 30-minute target, a heatmap of your city colored by "where you personally caught sun", and the punchline — a ranked list of your recurring routes with a *side-of-street* recommendation for each hour of the day.

## Technical approach
Python + DuckDB for the point store, deck.gl for the map. Building footprints and `height`/`building:levels` from an Overpass extract clipped to your bounding box, rasterized into a 2m DSM with GDAL; terrain from Copernicus GLO-30 for the far horizon. Solar position via `pvlib` (NREL SPA). Shadow test = march the DSM along the sun azimuth in 2m steps out to 400m, comparing required elevation angle against surface height — the standard shadow-marching trick, but evaluated at ~100k scattered personal points rather than over a viewport. Clear-sky DNI/GHI from `pvlib`'s Ineichen model, scaled by hourly `cloud_cover` and `direct_normal_irradiance` from Open-Meteo's free ERA5 archive endpoint. Convert W/m² to lux at ~110 lm/W.

The genuinely hard part is indoor/outdoor classification. GPS accuracy radius, point density, and dwell duration are weak signals; a dwell >20min inside a building polygon is treated as indoors and zeroed, which will be wrong sometimes. Second hard part: `height` tags are sparse in most OSM cities, so `building:levels × 3.2m` and a per-city fallback median are load-bearing.

## v1 scope
- One city bounding box, hardcoded, downloaded once
- One Takeout JSON, one calendar year
- CLI that prints a per-day sunlit-minutes table and writes a PNG calendar heatmap
- No indoor detection beyond "is the point inside a building footprint"

## Out of scope
- Live/predictive mode, phone app, notifications
- Melanopic weighting, spectral modeling, tree canopy
- Anything that uploads your location anywhere

## Risks & unknowns
GPS in urban canyons is off by 20-40m, which is exactly the scale of the shadows being tested — errors are correlated with the thing measured. Takeout's schema changes. Health framing must stay descriptive, not prescriptive.

## Done means
Running `sundebt 2025.json` on a year of history produces a calendar heatmap plus a sentence like "Your 8:40am walk to the train got direct sun 11 days out of 94 between November and February; the opposite sidewalk would have made it 61."
