## Overview
A small B2G data service that produces defensible sidewalk-slope inventories for municipalities from public LiDAR. Buyers: public works departments and ADA coordinators in cities of 50k–300k people, plus the civil engineering consultancies who currently bill those cities for the fieldwork.

## Problem
Under PROWAG and the DOJ's Title II rule, cities must maintain an ADA transition plan backed by an actual inventory of pedestrian-facility barriers. Cross slope over 2.0% and running slope over 5% (where it doesn't match adjacent roadway grade) are the two headline failures. Today that inventory is produced by a crew walking every block with a smart level and a clipboard, or by a $200k–$800k consultant engagement. Most mid-size cities have either nothing or a scanned PDF from 2013. Meanwhile structured settlements in Chicago, LA, Seattle and Portland have set the precedent that a remediation schedule is coming, and nobody knows which 4% of their sidewalk network to fix first.

## How it works
Pick a city. We pull USGS 3DEP LiDAR (QL1/QL2) from the public `usgs-lidar-public` COPC/EPT buckets, sidewalk centerlines from city open data or OSM (`highway=footway` + `footway=sidewalk`), and any existing curb ramp inventory. For each ~3m segment: buffer the centerline, pull ground-classified returns (Classification 2), fit a local plane by RANSAC, decompose the normal into running slope (along centerline) and cross slope (perpendicular). Flag against PROWAG thresholds and grade breaks.

Deliverable is a web map colored by severity, plus a per-segment evidence card (point count, plane RMSE, confidence band), GeoJSON/CSV export, and — the part they actually pay for — a prioritized remediation list weighted by pedestrian demand: transit stop proximity from GTFS, school/clinic adjacency, and ACS S1810 block-group disability rate.

Pricing: $12k–$60k/yr per city by population tier. Consultancies license the API as pre-field triage per square mile so their crews only measure the ~8% of segments we mark uncertain — that's the wedge, because it makes us their margin rather than their competitor.

## Technical approach
PDAL for point cloud reads (COPC reader + `filters.range` + `filters.hag_nn`), Python/GeoPandas/Shapely for geometry, PostGIS for storage, tippecanoe → PMTiles → MapLibre for the frontend. Core table: `segment(id, geom, source, slope_running, slope_cross, n_points, plane_rmse, confidence, flags[])`.

The hard part is honest error bars. Curbs, parked cars and tree canopy corrupt ground returns; a 1.5m sidewalk at QL2 spacing gives only 10–20 usable points per segment, which puts the cross-slope uncertainty uncomfortably close to the 2% threshold itself. The product has to publish confidence and explicitly defer to field measurement in the gray band — a tool that overclaims is legally worse than useless.

## v1 scope
- One city, 20 blocks, one LiDAR tile
- Cross slope only (skip running slope, skip grade breaks)
- Static PMTiles map + CSV, no login
- Ground-truth 30 segments personally with a $60 digital level

## Out of scope
Curb ramp detection, obstruction/vegetation encroachment, mobile field app, non-3DEP geographies.

## Risks & unknowns
LiDAR vintage (a 2018 flight vs. a 2024 reconstruction); municipal procurement cycles run 9–18 months; a consultancy could build this in-house.

## Done means
On the 20-block pilot, ≥85% of segments agree with field-measured cross slope within ±0.5 percentage points, the gray band is correctly flagged, and one real ADA coordinator says the prioritized list is something they'd put in a transition plan.
