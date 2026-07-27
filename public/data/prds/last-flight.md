## Overview
A B2B lookup service for anyone who has to carry something heavy from a truck to a door: furniture and appliance delivery, movers, medical-equipment providers, keg and water distributors. POST an address, get back a Door Difficulty Score with a breakdown and a predicted minutes-and-crew delta. Sparked by the Gridnberg topography-aware pedestrian routing dataset — the same slope data that routes wheelchairs also prices a sofa.

## Problem
Delivery quoting software models the road network beautifully and then stops at the curb. But the margin lives in the last thirty meters: a fourth-floor walk-up over a seven-step stoop with a 28-inch door is a ninety-minute two-extra-people job that was quoted as a twenty-minute drop. Today this is handled by a dispatcher's guess, a "stairs fee" negotiated badly at the door, or a driver eating it. Nobody has the underlying data assembled.

## How it works
`POST /score {address}` returns:
- **Score 0–100** plus a component breakdown: walk-up floors, stoop steps, curb-to-door grade, curb ramp present, door clear-width class
- **Predicted dwell delta** in minutes and recommended crew size
- **Per-field confidence and provenance** (this matters — buyers will not trust a black box)
- A one-line driver brief: "4F walk-up, no elevator, 6-step stoop, bring straps — dolly won't clear"

Drivers tap worse / right / better after the stop. That becomes labeled ground truth and is the actual moat.

## Technical approach
FastAPI + Postgres/PostGIS. NYC first because the open data is unusually complete:
- **PLUTO** for NumFloors, YearBuilt, BldgClass, and footprint geometry
- **DOB NOW elevator device records** (Socrata) joined on BBL for elevator presence
- **NYC 1-ft lidar DEM** for the curb-to-door grade sampled along the snapped path
- **NYC Pedestrian Ramps** and sidewalk centerlines for the slope-aware approach graph
- **Mapillary API v4** street-level imagery by bbox, with a CLIP linear probe predicting stoop step count in buckets (0 / 1–3 / 4–7 / 8+)

Data model: address → BBL → building → entrance geometry → feature rows, each with source and confidence.

The genuinely hard part is the entrance. A footprint centroid is not a door. You need to pick the façade segment facing the street, snap it to the sidewalk graph, and handle corner lots, rear entrances, and courtyard buildings. Second hard part: an elevator permit does not mean a working elevator, and pre-1901 walk-ups are exactly the addresses that hurt.

## v1 scope
- Brooklyn only
- One endpoint, one static API key, no dashboard
- Stoop steps from a heuristic (year built + building class + footprint setback) — zero ML
- A CSV batch-upload page that returns a scored CSV

## Out of scope
Nationwide coverage, interior floor plans, measured door widths, routing/dispatch, a mobile app.

## Risks & unknowns
Mapillary coverage is patchy on residential side streets. Elevator data goes stale. The real commercial question: is the buyer a two-truck mover with no budget, or an enterprise with a nine-month sales cycle? And this may be a feature Onfleet or Route4Me ships rather than a company.

## Done means
On 200 held-out Brooklyn stops with logged actual dwell times, predicted minutes-delta correlates r > 0.5 with real dwell overage and measurably beats a floors-only baseline.
