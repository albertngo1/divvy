## Overview
A nostalgia-tinged data-viz toy riffing on the IEEE 'LEDs and our night skies' story. Point at any location and it reconstructs how light-polluted the sky above it has become over the last decade, translated into the language amateur astronomers actually use — the Bortle scale and estimated naked-eye star count. For dark-sky advocates, amateur astronomers scouting sites, and anyone homesick for a sky they remember.

## Problem
Nighttime-radiance satellite data is public and rich, but it lives in multi-gigabyte GeoTIFFs that no layperson can open. The people who'd care most — someone arguing against a stadium light retrofit, or just missing their childhood Milky Way — can't get a plain-English answer to 'how much darker was it here when I was a kid?' Cheap for me to sample; meaningful to them.

## How it works
Search or drop a pin. Bortle samples annual nighttime-lights composites (2012→latest) at that point plus a small surrounding kernel, converts radiance to sky-brightness (mag/arcsec²) via a published fit, and maps that to a Bortle class and an approximate limiting magnitude / visible-star count. Output: a slider-scrubbable animation of the sky glowing brighter year over year, a headline number ('Bortle 4 → Bortle 6, ~60% of naked-eye stars lost'), and a shareable postcard image. Bonus 'find the dark' mode: nearest point within driving distance still at Bortle ≤3.

## Technical approach
Preprocess VIIRS DNB annual composites (NOAA/Colorado School of Mines, public GeoTIFFs) into a compact quadtree/PMTiles pyramid of radiance so the client can sample any point without the raw rasters. Radiance→sky-brightness via the Falchi/Cinzano-style relation; sky-brightness→Bortle and limiting magnitude via lookup. Stack: a static site + PMTiles served from object storage, MapLibre for the pin, a tiny WASM/JS sampler. Data model: `year -> tiled radiance`. Hard part: honest uncertainty — VIIRS saturates in bright cores and can't see below the horizon-glow floor, so the naked-eye-star number must be clearly an estimate with error bands, not false precision.

## v1 scope
- One region (e.g. continental US) preprocessed to PMTiles
- Point sample + 3x3 kernel, 2012→latest annual frames
- Bortle class + estimated star-count headline + scrub animation
- Static export postcard PNG

## Out of scope
- Global coverage, monthly resolution
- Real observing forecasts (moon, weather, aerosols)
- Accounts, saved locations

## Risks & unknowns
- Radiance→Bortle fit accuracy at a single point; risk of overclaiming
- VIIRS sensor changes / intercalibration across years
- PMTiles size vs. resolution tradeoff

## Done means
A user drops a pin on their hometown, sees a smooth year-by-year brightening animation with a Bortle-then vs Bortle-now headline and star-loss estimate, and exports a shareable postcard — entirely from preprocessed public radiance tiles, no server-side compute at request time.
