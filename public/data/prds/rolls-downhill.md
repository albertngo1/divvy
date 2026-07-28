## Overview
A browser explorable that computes and renders the **gravity watershed of a street grid**. Not "here's a slope map" — an interactive answer to "where does my block drain to?" Pick any address; a marble animates downhill along real gutter lines to its terminal sink, and the map shades every street by how much of the neighborhood funnels through it. For city nerds, cyclists, skaters, flood-anxious homeowners, and anyone who's watched a plastic bag decide where to live.

## Problem
Elevation data is everywhere and useless in raw form. Contour maps and hillshades tell you *steepness* but never answer the question people actually have, which is topological, not metric: **what is downstream of me?** Municipal flood models answer it, cost six figures, and are never public or interactive. Meanwhile every street has an obvious, invisible drainage tree that determines where puddles, ice, trash, and standing water appear — and residents learn it only by living there for a decade.

## How it works
1. Load a neighborhood's street centerlines. Offset each to two **gutter lines** (centerline ± half the roadbed width) — roads are crowned, so the true flow path is at the curb, not the middle. This detail is what makes results match reality.
2. Sample bare-earth LiDAR elevation at every gutter vertex.
3. Build a directed graph: each gutter segment becomes an edge pointing downhill.
4. Flow-accumulate: each segment contributes its own surface area as load, pushed downstream via topological sort of the DAG.
5. Render: street width/color = accumulated flow; sinks = pooling blobs sized by catchment. Click anywhere → marble animation traces the descent path, with a running "you are 340 m and 11 m of fall from your sink" readout.
6. Validation layer (the fun part): overlay real 311 "Catch Basin Clogged" and "Street Flooding" complaints. Predicted sinks should light up with real complaints. Where they don't, something is wrong — a hidden drain, a bad DEM, or a genuinely under-served basin.

## Technical approach
- Data: USGS 3DEP 1 m DTM (or NYC's 1 ft LiDAR DTM via NYC OpenData); OSM/LION street centerlines with `width`/lane-count heuristics; NYC 311 Socrata endpoint `data.cityofnewyork.us/resource/erm2-nwe9.json` filtered on catch-basin descriptors; DEP catch basin point layer.
- Preprocessing in Python: rasterio + geopandas + shapely for the offset lines, `scipy.ndimage` for DEM smoothing, networkx for the DAG.
- Flats and pits break naive steepest-descent. Use **priority-flood depression filling** (Barnes 2014) applied to the graph, not the raster: resolve flat runs by breadth-first from the outlet so ties drain consistently instead of forming spurious lakes at every intersection.
- Output a precomputed GeoJSON/binary tile set; frontend is MapLibre + deck.gl `PathLayer` + a small requestAnimationFrame marble integrator.
- Genuinely hard part: **bridges, overpasses, and stoops.** A street graph is planar; drainage isn't. Overpass segments must be excluded from flow inheritance or every highway becomes a river. Second hard part: canopy contamination in DSM-derived elevation — must use bare-earth DTM and still median-filter along-street.

## v1 scope
- One neighborhood (~200 blocks), precomputed offline into a single JSON.
- Centerline-only elevation (skip gutter offset) to prove the pipeline.
- Steepest-descent sinks + flow accumulation coloring.
- Click-to-drop marble with an animated path.
- Static 311 complaint dots as a toggle layer.

## Out of scope
- Real rainfall/infiltration modeling; storm-sewer network interiors.
- Nationwide coverage, tiling infra, user accounts.
- Mobile GPS "you are here" mode.

## Risks & unknowns
- 1 m DTM vertical error (~10 cm) is close to real curb-to-crown differences; results may be noise on genuinely flat grids (much of Manhattan below 14th). Flat cities may simply produce mush.
- Street width guessing from OSM tags is unreliable outside dense cities.
- 311 correlation might be dominated by reporting bias (rich blocks complain more) rather than hydrology — that itself is an interesting finding, but it weakens validation.

## Done means
On a chosen neighborhood, clicking ten random addresses produces ten marble paths that terminate at plausible low points, and the top-10 predicted sinks contain at least 5 locations with above-median 311 catch-basin/flooding complaint counts — with a screenshot comparison published in the README.
