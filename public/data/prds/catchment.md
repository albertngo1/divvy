## Overview
Catchment is a web map that answers "where can I get in 30 minutes by transit?" *honestly* — as a probability field rather than a single polygon. For one address it draws three nested contour bands: p90 (you make it nine mornings in ten), p50 (typical), p10 (only if every connection lands). Aimed at anyone choosing an apartment, a school, or an office, and at transit planners who already know the single-blob map is fiction.

## Problem
Mapbox Isochrone, TravelTime, and every real-estate site's "commute" feature compute one departure time and render one hard-edged shape. But a route with 12-minute headways is a lottery: the same neighborhood is inside the blob at 8:03 and outside at 8:07. People sign year-long leases against a number that was true once. The uncertainty is not noise — it is the entire product.

## How it works
1. Enter an origin, a departure *window* (e.g. weekdays 07:30–09:00), and a time budget (30 min).
2. The engine runs one search per departure minute — 90 searches — producing, for every destination hexagon, a vector of 90 travel times.
3. Per hex, that vector becomes a distribution. The map renders percentile contours as nested translucent bands, drawn with a coherence pass so the bands never cross or fragment into confetti.
4. Hover a hex: a small histogram of the 90 travel times, plus the actual p50 itinerary next to the p10 itinerary. The reveal is usually that the lucky case hinges on one 4-minute transfer that exists twice an hour.
5. Toggle "spaghetti" to see individual per-minute contours overlaid — the ensemble that the bands summarize.
6. Enter a second address to get a difference view: shading where A beats B, and by how much reliability rather than how much median time.

## Technical approach
Engine: **r5py** (Python bindings over Conveyal R5), which natively does range-RAPTOR departure-time profiles — exactly the computation this needs, so 90 departures cost far less than 90× one search. Alternative: OpenTripPlanner 2 with its profile API. Inputs: agency GTFS (via transitland or the agency's feed URL) and an OSM extract from Geofabrik for the walk network.

Grid: H3 resolution 9 (~175m edge). Per query, output is hex_id → int16[90], reduced to percentiles and cached in parquet keyed by (origin, window, budget). Front end: MapLibre GL + deck.gl `H3HexagonLayer` for the raw field, and marching-squares contours (d3-contour over the projected percentile raster) for the smooth bands.

The hard part is band coherence: percentile fields computed independently per hex produce ragged, occasionally non-nested contours, and naive smoothing will happily smooth a real cliff (a river, a single bridge) into a lie. Recent work on coherent contour-ensemble rendering is the reference. Second hard part: this is on-demand compute, not a precomputed tile set — a whole-city precompute is out of reach, so query latency has to stay under a few seconds.

## v1 scope
- One hardcoded metro, one GTFS feed
- One origin at a time, 30-minute budget only, fixed 07:30–09:00 window
- Three fixed bands (p90/p50/p10), no spaghetti toggle
- Hover shows the histogram only

## Out of scope
Driving/cycling modes, multi-city, GTFS-RT historical delay data, shareable permalinks, accounts.

## Risks & unknowns
R5/JVM setup is genuinely annoying and may eat the weekend. Scheduled GTFS pretends every bus is on time, so the bands understate real spread — honest framing required. Biggest UX risk: three bands may read as harder than one blob; the phrasing "how often is this true" needs user testing.

## Done means
For a real address on a low-frequency corridor, the p90 band is visibly smaller than the p50 band, and clicking a hex in the gap between them surfaces an itinerary whose feasibility depends on a single transfer that runs twice an hour.
