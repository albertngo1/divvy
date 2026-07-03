## Overview
A web map for boaters and anglers in the drought-stricken American West that tells you, ramp by ramp, whether a given reservoir's water level is currently high enough to launch a boat. Sparked by the Great Salt Lake Tracker — but instead of mourning a shrinking lake, it turns public water-level data into an actionable go/no-go for a specific niche who currently find out the hard way.

## Problem
Western reservoirs (Powell, Mead, Oroville, Folsom, dozens smaller) swing tens of feet seasonally. When the surface drops below a boat ramp's toe elevation, that ramp is unusable — you tow your boat two hours to find bare mud. The data to predict this is *public* (reservoir elevation is published daily) but *unjoined*: nobody maps live elevation against the surveyed elevation of each individual ramp. Anglers rely on stale forum posts and Facebook rumors.

## How it works
A map shows reservoirs as pins colored green/yellow/red. Tap one and you see: current surface elevation, each named ramp with its toe elevation, and a computed status ('Ramp usable — 6 ft of clearance' / 'Ramp high & dry — surface is 12 ft below'). A 30-day sparkline shows the trend so you can guess next weekend. Users can crowd-submit a ramp's toe elevation with a photo when official survey data is missing.

## Technical approach
Data: USGS Water Services + USBR Reclamation Information Sharing Environment (RISE) APIs for daily reservoir elevation; ramp locations from state Fish & Wildlife GIS layers and OSM `leisure=slipway`. The join key is *elevation*, and the hard part is that ramp toe elevations are rarely published — v1 seeds a hand-curated table for the top ~40 reservoirs, backfilled by community submissions (photo + phone GPS + a level read). Stack: a nightly Python cron pulls elevations into SQLite/Postgres; static frontend with MapLibre + a small JSON API. Status = surface_elev − ramp_toe_elev.

## v1 scope
- 15–20 hand-curated major western reservoirs
- Nightly pull of current surface elevation from USGS/RISE
- Static per-ramp toe-elevation table
- Green/yellow/red map + per-ramp clearance readout
- 30-day elevation sparkline

## Out of scope
- Crowd submissions & moderation (v2)
- Tides, rivers, coastal launches
- Boat-size/draft modeling beyond a flat clearance number
- Notifications/alerts

## Risks & unknowns
- Toe-elevation data is the whole moat and it's scattered/missing — curation is the real work.
- Datum mismatches (NAVD88 vs local) could produce dangerously wrong clearances.
- API coverage varies by state and agency.

## Done means
For three named reservoirs with known ramp elevations, the map shows the correct current surface elevation (matching the agency's published number within a foot) and correctly labels each ramp usable/unusable, verified against a same-day photo or report.
