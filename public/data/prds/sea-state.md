## Overview
A full-screen ocean simulation whose every wave is derived from live measurements at a real NOAA buoy. Pick a buoy (or let it pick the nearest coastal one); your screen becomes that patch of sea, this hour. When a storm 2,000 miles away sends long-period swell into a local windsea, you see the two systems cross on your monitor before anyone posts about it. For people who live near water, surf, sail, or just want a screensaver that is *about something*.

## Problem
Every ocean shader in existence is driven by a Phillips or JONSWAP spectrum with a wind-speed slider — a plausible-looking sea that is nowhere in particular. Meanwhile NDBC publishes real directional wave spectra, hourly, free, for ~200 buoys, and literally nobody renders them. The data exists as ASCII tables read by three surf forecasters; it has never been made beautiful.

## How it works
Fetch the buoy's spectral files, reconstruct the 2-D directional spectrum, sample ~256 wave components from it, and sum them as Gerstner waves on a GPU heightfield. Sky and sun position come from local solar geometry so dawn/dusk match your clock. A tiny corner readout: buoy ID, significant wave height, dominant period, and how many distinct swell trains are currently present.

## Technical approach
Sources (plain text, no key, hourly):
- `ndbc.noaa.gov/data/realtime2/<ID>.data_spec` — energy density S(f) in m²/Hz over ~47 bands, 0.033–0.485 Hz
- `.swdir`, `.swdir2`, `.swr1`, `.swr2` — the α1, α2, r1, r2 directional Fourier coefficients

Reconstruct direction with NDBC's own truncated form: `D(f,θ) = (1/π)[0.5 + r1·cos(θ−α1) + r2·cos(2(θ−α2))]`. Importance-sample 256 (f, θ) pairs weighted by `S(f)·D(f,θ)·Δf`, amplitude `√(2·S·D·Δf·Δθ)`, random phase, deep-water dispersion `ω² = gk` so animation is physically correct and needs no keyframing. Three.js + a vertex shader doing the Gerstner sum; 128×128 patch, tiled and fogged to horizon.

Hard part: the measured spectrum stops at 0.485 Hz, so the sea looks unnaturally smooth — you must graft a synthetic `f^-4` equilibrium-range tail above the cutoff, scaled to match at the seam, or it reads as CGI oil. Second hard part: hourly updates mean you must cross-fade component amplitudes over ~60 s or waves pop.

## v1 scope
- One hardcoded buoy ID in a config constant
- Browser page, F11 for fullscreen (no macOS `.saver` bundle yet)
- Parse `.data_spec` + `.swdir`/`.swr1` only; ignore r2/α2 (broader spread, still fine)
- Fixed noon sun, single blue palette
- Poll every 20 min, cache last good fetch to disk

## Out of scope
Sound. Boats. Shoreline/bathymetry refraction. Buoy picker map. Wallpaper-engine integration. Forecast (this is *now*, not WaveWatch III).

## Risks & unknowns
Many buoys report only bulk parameters (no `.swr1`) — need a fallback that spreads a JONSWAP fit around the reported mean direction. Some buoys go offline for months. Whether a 47-band spectrum has enough resolution to make crossing swells visually distinguishable is genuinely unknown until rendered.

## Done means
On a day when NDBC reports two swell trains ≥30° apart in direction, a screenshot shows visibly crossing wave fronts, and swapping to a flat-calm buoy produces visibly glassy water — without touching any tuning parameter.
