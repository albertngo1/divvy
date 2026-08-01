## Overview
An ambient desktop toy that renders a real, continuous, invisible physical process happening to the reader personally: the **solid earth tide**. The rocky Earth is elastic, so lunar and solar tidal forces deform it — your house, your desk, and you rise and fall by roughly ±20–30 cm on a semidiurnal cycle, larger at the equator, larger still at spring tide. The menubar shows your current vertical offset in centimeters and a trend arrow. Click it for a 48-hour curve with the fortnightly spring/neap envelope.

## Problem
Desktop toys are decorative noise — particles, clocks, another fake terminal. The good ones show you something true you didn't know. Almost every educated person believes tides are a water phenomenon; almost nobody knows the ground does it too, or that geodesists must correct GPS for it. That's a genuinely startling fact with a clean, computable number attached.

## How it works
1. Get Moon and Sun geocentric positions at time t (no network needed).
2. Compute the degree-2 tidal potential W₂ at your latitude, longitude, and height, plus the degree-3 term for the Moon (a few mm, but it's what separates a real implementation from a toy one).
3. Apply Love numbers: radial displacement Δr = (h₂/g)·W₂ with h₂ ≈ 0.6206, horizontal via l₂ ≈ 0.0836, gravity anomaly δg via the gravimetric factor δ ≈ 1.16 (k₂ ≈ 0.30).
4. Display: current Δr in cm relative to the 24h mean, arrow for sign of dΔr/dt, and a "you weigh least at 14:32" line in µGal for the mischief.
5. Optional later: sonify dΔr/dt as a very slow drone, and a full-screen "breathing horizon" screensaver whose horizon line is the actual tide curve at 3000× speed.

## Technical approach
Swift menubar app (or Electron/TS if you want the chart cheaply). Ephemeris from **astronomy-engine** (MIT, pure JS/Swift ports, arcsecond-level, zero network) — DE440s via Skyfield only for the offline reference implementation. Validation is the interesting engineering: generate a 30-day series and compare against **pygtide** (a Python wrapper around ETERNA 3.4, the standard tidal-prediction code), targeting <1% RMS on the body tide. Geodesy sign and convention errors are the whole difficulty here; without a reference you will ship something plausible and wrong.

Ocean loading is the messy part — near a coast, the weight of shifted seawater adds several centimeters and is *not* in phase with the body tide. v1 excludes it explicitly and says so in the tooltip; a later version can pull site-specific loading coefficients from the Onsala ocean-loading service (FES2014 grid) given lat/lon.

## v1 scope
- Manual lat/lon entry (or CoreLocation once, cached).
- Menubar: `↑ +14.2 cm`, updated once per minute.
- Click-through 48h sparkline, drawn with SwiftUI `Path`.
- Degree-2 lunar + solar only.

## Out of scope
Ocean loading, atmospheric pressure loading, pole tide, sonification, screensaver mode, iOS, any notion of ocean tide times (a support-question magnet — the tooltip must disclaim it).

## Risks & unknowns
The effect is unfelt and unverifiable by the user, so the toy lives or dies on trust — validation against pygtide has to be visible in the README. Users will conflate it with surf reports. And it may simply be too quiet: a number that changes slowly is easy to stop seeing, so the 48h chart and the spring/neap envelope are what give it a reason to be clicked.

## Done means
Agrees with pygtide to <1% RMS over 30 days at three latitudes (equator, 45°, 65°), updates every minute at under 1% CPU, and correctly shows the fortnightly amplitude envelope peaking within a day of new and full moon.
