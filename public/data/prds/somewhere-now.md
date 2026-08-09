## Overview
Somewhere Now is a screensaver / background audio toy for one person. Press play and it teleports you: it samples a random terrestrial coordinate, looks up what actually lives and is happening there, and synthesizes a ten-minute field recording of a place you will never visit, as it is *right now*. Never the same twice — the seed is the coordinate and the current UTC minute.

## Problem
Ambient generators are either canned loops ("rainforest.mp3") or pure synthesis with no referent. Neither gives you the small thrill of *this is a real place and it is 4am there and the frogs are up*. The raw data to do it properly is all free and public; nobody has wired it together.

## How it works
1. Rejection-sample a lat/lon until it lands on land (Natural Earth land polygon, shapely `contains`).
2. Fetch a **place profile**:
   - Land cover class → ESA WorldCover 10m via a local COG, `rasterio` windowed read (forest / cropland / built-up / wetland / snow).
   - Elevation + terrain roughness → Copernicus DEM tile; roughness drives reverb size and wind character.
   - Current weather → Open-Meteo `/v1/forecast` (no key): wind speed, precip mm/h, temp, cloud cover.
   - Sun/moon → `astral` for local solar altitude; this is the master switch for who is awake.
   - Fauna → GBIF occurrence API filtered to a 25km box, `class=Aves` + `Amphibia` + `Insecta`, ranked by occurrence count and month-of-year, giving a ~12-species cast.
3. Build a **soundscape score**: each species becomes a stochastic voice with a call template, a diel activity window (dawn chorus weighting for passerines, night for owls/frogs/orthoptera), a call rate that scales with temperature (crickets literally do — Dolbear's law), and a random distance → lowpass + gain + delay.
4. Beds are synthesized, not sampled: wind through canopy = filtered pink noise whose band and modulation depth come from wind speed × land cover; rain = a Poisson rain of impulses convolved with a small IR whose brightness comes from surface type; a distant-road layer only if WorldCover says built-up.
5. Render to a stereo bus with a convolution reverb sized by terrain openness. On screen: a minimal card — coordinate, local time, temperature, and the species names as they sound.

## Technical approach
Python + `sounddevice` + `numpy` for a real-time DSP graph, or offline render to WAV for a screensaver bundle. Bird calls: rather than shipping samples, v1 uses parametric synthesis (frequency-swept sine chirps with per-species envelope, harmonic count, and repeat pattern hand-authored for ~20 archetypes: whistle, trill, buzz, hoot, croak, stridulation), and maps each GBIF species to the nearest archetype via its family. Cache place profiles in SQLite keyed by rounded coordinate. The hard part is **plausibility without samples** — parametric birds sound like a synth unless envelopes and timing jitter are right, so the archetype library is where the craft goes.

## v1 scope
- CLI: `somewhere-now` prints the coordinate, renders 60 seconds to a WAV
- Land mask, Open-Meteo, GBIF birds only
- Five archetype voices + wind bed + rain bed

## Out of scope
- Xeno-canto sample streaming (licensing, size), visuals, macOS screensaver bundle, ocean coordinates

## Risks & unknowns
- GBIF is wildly biased toward Europe/North America; Siberia will be silent. Fall back to a biome-typical cast.
- Parametric calls may sound cheap; test early before building the pipeline around them.
- Open-Meteo rate limits on rapid reroll.

## Done means
Running it twice within a minute yields two different coordinates, and a blind listener can correctly say which of two renders is the nighttime one and which is the windy one, for 8 of 10 pairs.
