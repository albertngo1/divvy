## Overview
A full-screen, dark-mode web map of the ~120,000 FCC-registered antenna structures in the United States, drawn not as dots but as *lights* — each one flashing red or white at the rate and color its FAA determination actually requires. For map nerds, aviation people, radio hobbyists, and anyone who wants a screensaver made of real regulation.

## Problem
The FCC Antenna Structure Registration database is public, complete, and hideous: a pipe-delimited weekly ZIP nobody renders. It encodes something genuinely beautiful — a nationwide, federally-choreographed light show with rules about color, intensity, and beats per minute — and the only way anyone experiences it is by driving at night. Meanwhile a parallel feed (NOTAMs) says which of those lights are *broken right now*, and nobody has ever joined the two.

## How it works
The map opens on the continental US at night. Towers under 350 ft with red lighting glow steady-red; L-864 red beacons flash at 30 flashes/minute; L-865 medium-intensity white strobes fire at 40/min; L-856 high-intensity systems fire at 40/min and are visibly brighter. Structures registered as part of one wind farm flash **in phase**, because FAA requires synchronization — so at zoom-out, wind farms read as breathing clusters against a field of random-phase solo towers. Two toggles: **Dark Tonight** overlays active obstruction-light-outage NOTAMs, killing those lights and ringing them in amber. **ADLS** highlights farms approved for aircraft-detection lighting, which stay off until a plane comes — whole counties that used to blink and now don't. A year-scrubber replays registration and dismantle dates, so you watch analog TV masts thin out and wind farms bloom across Iowa and West Texas.

## Technical approach
Ingest: `wireless.fcc.gov/uls/data/complete/r_tower.zip` weekly (RA/CO/EN records) → DuckDB → a Parquet/PMTiles bundle with lat/lon, overall height AGL, painting-and-lighting code, FAA study number, status, and dates. Map the ASR lighting code and the FAA AC 70/7460-1M chapter references to a small enum of fixture types (L-810/864/865/856/857/885) and a flash rate in Hz. Render with MapLibre + deck.gl using a single instanced ScatterplotLayer; flash phase and duty cycle are computed **in the shader** from `u_time` plus a per-instance phase seed, where the seed is `hash(wind_farm_id)` for clustered structures and `hash(asr_number)` otherwise — 120k animated lights at 60fps with zero per-frame CPU work. Outages: poll the FAA NOTAM API, regex ASR/structure numbers and `LGT OTS` phrasing out of free-text NOTAMs, resolve to registration numbers. The hard part is that lighting codes are inconsistently coded across four decades of filings; needs a rules table plus a fallback inference from height and structure type, with an honest "lighting unknown" render (dim grey).

## v1 scope
- One state's ASR extract, static Parquet, no live refresh
- Three fixture types: steady red, flashing red, flashing white
- Shader-driven flash with wind-farm phase locking
- Click a light → registration card (owner, height, FAA study number)

## Out of scope
NOTAM outage layer, ADLS layer, year-scrubber, mobile, Canada/Mexico.

## Risks & unknowns
Lighting-code coverage may be worse than expected; NOTAM text parsing is fuzzy; 120k simultaneous strobes could be genuinely unpleasant to look at (needs an intensity floor and a bloom budget).

## Done means
On a laptop at 60fps, zoomed to the Texas panhandle, you can see wind farms pulsing in unison against random-phase broadcast towers, and clicking any light shows its real registration number.
