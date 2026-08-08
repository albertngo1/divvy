## Overview
A macOS/Linux screensaver (and standalone fullscreen web page) that renders the 500 hPa geopotential height field of the actual atmosphere as a moving topological skeleton: maxima (ridges/highs) as slowly breathing filled discs, minima (troughs/lows) as wells, and saddle points — *cols*, the real meteorological term for the pass between two highs — as small rotating X marks. Nothing else is drawn. No landmasses, no temperature colors. For anyone who wants ambient art that happens to be a literal forecast.

## Problem
Weather visualization is saturated with pretty rainbow rasters that convey almost nothing structurally. Meanwhile the thing forecasters actually reason about — where the highs are, whether a block is forming, where the steering flow splits — is a *topology* of a scalar field, and it is invisible in a heatmap. Also: screensavers are dead. The good ones (Aerial, After Dark) were art with no information; dashboards are information with no art.

## How it works
Every 6 hours a background fetch pulls the GFS 0.25° run. The app extracts one scalar field (500 hPa geopotential height) over a lat/lon grid, computes its critical points, filters them by topological persistence, tracks them frame-to-frame, and animates the result at ~1 forecast hour per second, looping the full 384-hour run. A single line of caption text appears only when a tracked feature crosses a threshold: "a col is collapsing over the North Atlantic in 4 days." Click-through drops you into a scrub bar; otherwise it just plays.

## Technical approach
- Data: NOAA NOMADS GRIB2 filter endpoint (`filter_gfs_0p25_1hr.pl`) with `lev_500_mb` + `var_HGT` — ~1 MB per timestep instead of the 500 MB full file. Decode with `eccodes` or `wgrib2` in a small Python fetcher; publish a compact binary (Float32Array + header) the renderer streams.
- Critical points: build the merge tree / join tree over the grid graph using a union-find sweep in descending height order; persistence pairs fall straight out of it. Discard pairs below ~40 gpm persistence — that threshold is the whole tuning game between confetti and an empty screen.
- Sphere handling: the grid is periodic in longitude and degenerate at the poles. Wrap the union-find neighbor lookup in longitude; collapse each pole row into a single node. Getting this wrong produces phantom saddles at the dateline.
- Tracking: bipartite matching between consecutive frames on (great-circle distance, persistence, type), Hungarian algorithm, with birth/death handled as unmatched. Tracks give the features identity so they can fade in and drift rather than pop.
- Render: WebGL2 in a fullscreen page; wrap as a macOS `.saver` via a WebView host, or run it as a kiosk browser on Linux.

## v1 scope
- One field (500 hPa height), one GFS run, Northern Hemisphere only
- Persistence-filtered maxima/minima/saddles as three glyph types, no ridge lines
- Plays 0–120 h, loops, black background, one accent color
- Runs as a fullscreen web page; screensaver wrapper is a stretch goal

## Out of scope
Multiple pressure levels, ensembles, place names, forecast text generation, mobile, any interactivity beyond a scrub bar.

## Risks & unknowns
The persistence threshold may need to vary by season and latitude (winter fields are far more energetic). Saddles on a sphere are notoriously noisy; if the picture reads as jitter, the idea dies. NOMADS rate-limits aggressively and occasionally reshuffles runs — needs backoff and a cached last-good run.

## Done means
Leave it running for a week. The tracked high that sits over your region for 5 days on screen is the same high that shows up as a clear sky in real life, and you can point at the X between two discs and say "that's where the storm track splits."
