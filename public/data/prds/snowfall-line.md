## Overview

Snowfall Line is an explorable explanation built around a single scalar nobody visualizes directly: the **snow level** — the altitude where falling precipitation transitions from snow to rain. You pick a mountain range, and it renders a terrain map with a colored contour band draped across the slopes at the freezing level, animated hour by hour through any storm since 1985. Scrub across decades and the band visibly creeps uphill.

For: skiers, hydrologists, hikers, anyone who has argued about whether "it used to snow more here."

## Problem

Climate visualizations are almost universally *anomaly maps* — blobs of red on a globe, in units nobody feels. The snow level is different: it's a number that is physically legible to anyone who's ever driven up a pass and watched the wipers change job. But no public tool renders it as a line on real terrain over real time. Existing forecast products show it for the next 48 hours, in a text bulletin, for one point, and then throw it away.

## How it works

1. Pick a region (v1: one range, e.g. the Wasatch or the Cascades). The app loads a 3D-ish shaded-relief basemap of the terrain.
2. A timeline scrubber runs 1985→present at hourly resolution, with storm events auto-detected and marked so you can jump between them.
3. For each hour, the app computes the freezing level over the region and draws it as a translucent band draped on the terrain: below the band, precipitation falls as rain (shown as a wet sheen); above, snow (white). Only rendered when precipitation is actually occurring — the rest of the time the band is a faint ghost line.
4. Secondary panel: for a chosen point (your ski hill's base lodge), a strip chart of "fraction of that winter's precipitation that fell as snow at this elevation," one bar per year, 40 bars. This is the punchline chart.

## Technical approach

- Data: **ERA5 reanalysis** hourly single-level and pressure-level fields from the Copernicus CDS API (`reanalysis-era5-pressure-levels`), 1985–present, ~0.25° grid. Needed fields: geopotential and temperature on pressure levels, plus total precipitation and 2m temperature.
- Snow level derivation: the naive 0°C isotherm is wrong — snow melts as it falls, so the snow level sits ~200–300m *below* the freezing level, and the offset depends on wet-bulb temperature and precipitation intensity. Compute wet-bulb from T and dewpoint (Stull's approximation), find the height of the 0.5°C wet-bulb surface by interpolating geopotential height between pressure levels, then apply an intensity-dependent melting offset.
- Downscaling: ERA5's 0.25° cells are ~28km — far coarser than a mountain range. Terrain comes from **SRTM/USGS 3DEP 30m DEM**; the freezing *height* field is smooth and interpolates cleanly, so you bilinearly interpolate the height surface to the DEM grid and intersect it with terrain elevation. That intersection contour is the drawn band. This is honest: the atmosphere is smooth even where the ground isn't.
- Precompute: for one range, 40 years × 8760 hours × a small grid is manageable — store the freezing-height field as a compressed float16 Zarr array; the client fetches only the hours it's scrubbing.
- Render: MapLibre GL with terrain-3d + a custom raster layer for the intersection mask, computed in a fragment shader as `step(terrain_elev, freezing_height)`. That shader trick is what makes scrubbing fast — the contour is never vectorized, it's just a per-pixel comparison.
- Hard part: making 40 years of hourly gridded data scrub at 30fps in a browser without a backend. Answer is tiling the freezing-height field into small time-chunked Zarr blocks and prefetching along the scrub direction.

## v1 scope

- One mountain range, one hardcoded bounding box.
- Pre-baked Zarr on static hosting (S3/R2), no server.
- Freezing level only (skip the wet-bulb melting offset in v1, note the caveat in the UI).
- Scrub one selected winter, not all 40.
- The 40-bar "snow fraction at this elevation" chart for a single hardcoded point.

## Out of scope

- Forecasting.
- Global coverage.
- Snowpack/SWE modeling (that's a different, much harder product).
- User accounts, sharing.

## Risks & unknowns

- CDS API throughput is slow and quota-limited; a 40-year hourly pull for even a small box may take days of queued requests.
- ERA5's terrain is a smoothed model orography, so its near-surface temps in valleys are biased — the derived line may be systematically off in deep canyons and needs a lapse-rate correction check against SNOTEL station observations.
- The 40-year trend might be visually underwhelming for some ranges; pick the pilot range where the signal is strongest.

## Done means

Scrubbing a known historical rain-on-snow event (e.g. a documented Pacific Northwest atmospheric river) shows the band climbing over the crest and back down, matching the NWS event summary's reported snow levels within 300m, at a sustained 30fps in Chrome on a laptop.
