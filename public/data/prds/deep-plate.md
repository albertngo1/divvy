## Overview
Deep Plate is a proptech screening tool for adaptive-reuse developers, architects, and city planners. It ingests public building footprints and assessor records, estimates each office tower's **floorplate depth** (distance from the building core to the nearest window line), and ranks which vacant offices are realistically convertible to residential — the single biggest go/no-go factor in office-to-resi conversions.

## Problem
Cities like Seattle are staring at years of empty 'zombie' office towers. Everyone says 'just convert them to housing,' but ~70% of office stock is un-convertible because the floorplate is too deep: apartments need light and air within ~28–35 ft of a window, and 1980s towers routinely have 60+ ft of windowless interior. Today the only way to know is to hire an architect to sketch test-fits building-by-building — slow and expensive. Developers can't cheaply triage a whole downtown for the few worth pursuing.

## How it works
1. Pick a city/district. 2. Deep Plate pulls building footprint polygons (OSM / county GIS), height/floor count (assessor + LiDAR), and use code (zoning). 3. For each building it inscribes a core, computes the perpendicular distance from a plausible corridor/core to the perimeter across the floorplate, and derives a **daylight-depth histogram**. 4. Score = share of floor area within 35 ft of glass, penalized for footprint concavity and floor count. 5. Output: a ranked map + one-page card per building (est. convertible SF, likely unit yield, red flags) and a CSV shortlist.

## Technical approach
Stack: Python + GeoPandas/Shapely for geometry, DuckDB spatial for joins, a Leaflet/MapLibre front end, FastAPI backend. Data: OpenStreetMap building=* polygons, county parcel/assessor APIs (King County, NYC PLUTO, etc.), Microsoft US Building Footprints, optional USGS 3DEP LiDAR for height. Core algorithm: compute the **medial axis / straight skeleton** of the footprint polygon; distance-to-boundary along the skeleton approximates core-to-window depth. Daylight-reachable area = buffer(perimeter, 35ft) ∩ footprint. Hard part: inferring the interior core location (elevators/stairs, which kill usable frontage) without floor plans — estimate from footprint centroid + shape, and let users correct it. Calibrate the score against a hand-labeled set of known successful/failed conversions.

## v1 scope
- One city (Seattle), offices only, footprint + floor-count data.
- Straight-skeleton depth score + daylight-area % per building.
- Ranked interactive map, per-building card, CSV export.
- Manual core-location override slider.

## Out of scope
- Actual test-fit unit layouts, plumbing/MEP feasibility, pro-forma financials, zoning entitlement analysis, multi-city coverage.

## Risks & unknowns
- Footprint geometry alone may mislabel L-shaped or atrium buildings — need the override.
- Data quality varies wildly by county; some have no digital footprints.
- Convertibility is multi-factor (window operability, column grid); depth is necessary not sufficient, so we must frame it as triage, not verdict.

## Done means
For 20 Seattle office buildings with known conversion outcomes, Deep Plate's top-quartile score correctly flags ≥80% of the ones that were (or were judged) convertible, and a developer can go from 'whole downtown' to a ranked 10-building shortlist in under two minutes.
