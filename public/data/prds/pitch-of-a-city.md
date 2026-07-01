## Overview

The pitch of a city collides two archives that were never meant to meet — bird-song recordings and urban traffic-noise measurements — on the one axis they secretly share: frequency in Hz. For a chosen city block, you see the spectral band that traffic fills as a wall of low-frequency noise, and the call frequencies of the bird species recorded nearby stacked on the *same* y-axis. The species whose voices land inside the traffic band are, visibly, the ones getting drowned out. The recognition moment — "the pigeons are the only ones left because they're the only ones loud enough" — lands in a single glance.

## Problem

Acoustic masking of urban birds is heavily documented in academic literature, but it lives in papers, not in a thing you can point at. There's no interactive artifact that lets a person pick their own neighborhood and *see* which birds got squeezed out of the spectrum. The datasets to build it are open and free; nobody has joined them block-by-block on a shared Hz axis.

## How it works

Pick a city, then a block. The left panel is a map with noise-sensor readings colored by sound pressure level (dB). The right panel is a dual spectrogram: the ambient traffic noise band drawn as a filled region (frequency on y, intensity as opacity), and over it, horizontal brackets for each bird species recorded near that location, positioned at that species' dominant call frequency. Species inside the traffic band are flagged "masked." Hover a species to play its Xeno-canto clip; a running tally shows how many recorded species sit inside vs. above the traffic floor.

## Technical approach — specific & technical

Stack: static site, Vite + TypeScript + D3 for the spectrogram/brackets, MapLibre GL for the map. No backend needed for v1 — precompute everything into JSON.

Data sources by name:
- **Xeno-canto** API (`xeno-canto.org/api/2/recordings`) — 1M+ recordings, 12.9k species, queryable by geographic box (`lat`/`lon`/`box`). Each recording carries a species name and an mp3 URL.
- **NYC DOT / Chicago / SF noise-sensor open data** — e.g. NYC's SONYC (Sounds of New York City) sensor network publishes SPL time series with lat/lon. Where live sensors are sparse, fall back to the **US DOT National Transportation Noise Map** (raster GeoTIFF of modeled road/aviation dBA), sampled per block.

Dominant call frequency per species: compute offline from Xeno-canto mp3s with a Python pipeline (librosa → STFT → spectral centroid + peak-frequency histogram across N recordings per species), cached to `species-freq.json`. This is the hard part — bird recordings are noisy, multi-note, and vary by call type; the fix is to take the median peak frequency across many recordings and label it a range, not a point.

Data model: `blocks[{id, lat, lon, spl_band:[{hz,db}], species:[{name, peak_hz_low, peak_hz_high, clip_url, masked:bool}]}]`. `masked` computed by overlap of species range with the traffic band's upper edge.

Key algorithm: masking = does species peak-Hz range intersect the frequency band where traffic dB exceeds threshold T. T is tunable.

## v1 scope (humiliatingly small)

- One city (NYC), 5–10 hand-picked blocks.
- Precomputed `species-freq.json` for ~30 common urban species.
- Static dual-spectrogram + one shared Hz axis; hover-to-play.
- Traffic band from the DOT noise raster (skip live sensors).

## Out of scope (for now)

- Multiple cities, live sensor feeds, temporal animation.
- Actual acoustic masking modeling (attenuation, distance, directivity).
- Any policy/"neighborhoods that lost birds" extension.

## Risks & unknowns

Prior-art verdict: **Partial**. Heavy academic literature on song-frequency masking exists; a block-by-block interactive map on a shared Hz axis does not. Fresh angle = the *shared physical axis* made visible and personal (pick your block). Unbuilt part: the interactive artifact itself. Risks: Xeno-canto recordings are geolocated where the bird was recorded, which skews rural — urban species coverage may be thin; mitigate by expanding the geo box and labeling sparse blocks. Peak-frequency extraction is genuinely fiddly.

## Done means

A visitor picks an NYC block, sees the traffic band and species brackets on one Hz axis, hovers a species to hear it, and can read off which species are masked. Deployed as a static site with all data precomputed.
