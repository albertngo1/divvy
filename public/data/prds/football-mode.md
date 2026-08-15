## Overview
A desktop wallpaper and menubar readout for one fact almost nobody feels: a magnitude 7.5+ earthquake excites the Earth's *free oscillations*, and the entire planet keeps ringing at millihertz frequencies for days afterward. The gravest spheroidal mode, ₀S₂ — nicknamed the **football mode** because the Earth alternately becomes a prolate and oblate spheroid — has a period of 53.9 minutes and a Q around 500, so it decays over roughly a week. This toy fits that ringing from live seismometer data and renders it in real time, at real speed. For people who like their ambient software to be reporting on something true.

## Problem
Earthquake apps show dots on a map for a day, then forget. The far stranger consequence — that the ground under you is still oscillating with a 54-minute breath, at an amplitude of microns, right now — has no consumer-facing surface at all. It's also the rare piece of physics that is genuinely *ambient*: it changes slowly enough that a glance an hour apart shows a different state.

## How it works
- A background job polls the USGS GeoJSON feed (`earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson`). An M≥7.5 event arms the toy.
- Starting ~6 hours after origin time (surface waves must pass), it pulls very-long-period vertical data from IRIS FDSN `dataselect` for station **II.BFO** (Black Forest Observatory, the classic normal-mode station), channel `VHZ` at 0.1 sps — 3+ days in one request is only ~26k samples.
- Instrument response is removed with the matching StationXML from `fdsnws/station`, then the record is tapered and run through a multitaper spectral estimate (Slepian, NW=4).
- Peaks are matched against PREM catalog frequencies (₀S₂ ≈ 0.3093 mHz, ₀S₃ ≈ 0.4685 mHz, ₀S₀ ≈ 0.8143 mHz). Fitted amplitude and phase for ₀S₂ become the wallpaper's state vector.
- The wallpaper renders a globe displaced by the Y₂⁰ spherical harmonic, exaggerated ~10⁷×, animating at the *actual* 53.9-minute period, with amplitude decaying on the fitted envelope. Menubar text: `Earth ringing · ₀S₂ 31% · day 4 of ~7`.

## Technical approach
Python worker (ObsPy for fetch + response removal, NumPy/`scipy.signal.windows.dpss` for the multitaper estimate, `lmfit` for the decaying-sinusoid envelope) writing a small JSON state file to disk every 30 minutes. Front end: three.js in a borderless always-on-bottom window (Tauri) reading that file; menubar via a tiny Swift `NSStatusItem`. SQLite caches raw traces so re-fits are offline.

The hard part is signal, not software. ₀S₂'s peak is a few µHz wide, so frequency resolution demands multi-day windows; the mode is also split by rotation and ellipticity into five singlets that smear the peak; and at 0.3 mHz you are fighting atmospheric pressure loading and solid-earth tides, which are far larger. Practical answer: high-pass above the tidal band, use the known catalog frequency as a prior rather than blind peak-picking, and fit amplitude only.

## v1 scope
- One station (II.BFO), one mode (₀S₂), one event at a time.
- Menubar text only — no globe. Ship the physics first.
- Manual trigger by event ID; automatic USGS polling comes later.
- Refit once an hour, cached.

## Out of scope
Mode splitting, toroidal modes, source inversion, multi-station stacking, audio.

## Risks & unknowns
Quiet years mean the toy sits dark for months (fallback: replay the 2011 Tohoku or 2004 Sumatra ringdown as a demo mode). Station outages. Fits may fail for events below ~M8 where ₀S₂ barely rises above noise — the honest behavior is to say "below detection" rather than draw a comforting line.

## Done means
Fed the 2011-03-11 Tohoku event and BFO's archived VHZ data, the tool recovers a ₀S₂ peak within 5 µHz of 0.3093 mHz, and its fitted decay envelope over the following 10 days is consistent with Q ≈ 500 (±30%).
