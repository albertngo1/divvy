## Overview
An explorable 3D map of the buildings a city is *already allowed to build without asking anyone*. Real buildings render solid; the residual legal envelope — allowed floor area minus built floor area — renders as translucent ghost mass stacked on top. For urbanists, housing wonks, journalists, and anyone who has argued about zoning on the internet.

## Problem
The housing debate is conducted almost entirely in prose. "We should upzone" and "we already allow plenty" are both unfalsifiable to a normal person, because nobody can see the difference between what exists and what is permitted. The data to settle it is public, precomputed, and sitting in a CSV that almost nobody opens.

## How it works
You land on Manhattan at a low camera angle. Solid gray extrusions are the actual building stock. Above and around them, glowing translucent slabs are unbuilt as-of-right capacity. The Financial District looks nearly full. A block of one-story auto-body shops in Long Island City wears a shimmering eleven-story ghost. Click any parcel: address, lot area, built FAR, max FAR, residual square feet, and an estimate in dwelling units. A slider — "what if the city built out to N% of as-of-right capacity" — collapses ghosts into solids and updates a citywide unit counter. A toggle isolates parcels where built FAR is under 25% of allowed: the map turns into a treasure map of legal, permit-free capacity.

## Technical approach
Data: NYC MapPLUTO (Dept. of City Planning), which already carries `lotarea`, `bldgarea`, `builtfar`, `residfar`, `commfar`, `facilfar`, and `bbl` per tax lot — the residual is `max(residfar, commfar, facilfar) * lotarea - bldgarea`, no zoning-text parsing required. Join on BBL to the NYC Building Footprints layer (`heightroof`, `groundelev`) for the solid geometry.

Prep in DuckDB with the spatial extension: read the MapPLUTO shapefile and footprint GeoJSON, join, compute residual, convert to ghost height as `residual_area / lot_footprint_area * 10ft`, and emit a single Parquet/PMTiles bundle (~a few hundred MB raw, well under 100 MB tiled). Frontend: MapLibre GL basemap + deck.gl `PolygonLayer` with `extruded: true`, two instances — opaque built mass and an additive-blended ghost layer offset by `heightroof`. Aggregation on the slider runs client-side over a typed-array column store, so it's instant.

The genuinely hard part is intellectual honesty, not rendering. FAR is only sometimes the binding constraint: height caps, sky-exposure planes, setbacks, landmarking, already-sold air rights, and inclusionary bonuses all move the true envelope. v1 must label ghosts as "FAR-implied capacity" and show a per-district confidence badge rather than pretending it's a buildable massing.

## v1 scope
- One borough (Brooklyn), FAR-only residual, no bonuses
- Two deck.gl layers, click-to-inspect popup, citywide totals readout
- Static prebuilt tiles served from any dumb host

## Out of scope
- Height/setback/sky-exposure geometry, landmark exclusions, TDR ledgers, other cities, feasibility or pro-forma modeling

## Risks & unknowns
Ghosts will be wrong in contextual districts and someone will screenshot the worst case. Mitigation: prominent methodology panel and a per-parcel "why this may be overstated" note. MapPLUTO's built-area figures are self-reported and stale on some lots.

## Done means
Brooklyn loads in under 4 seconds, a hand-checked sample of 20 parcels matches ZoLa's stated FAR figures, and the citywide unbuilt-capacity number is stated with an explicit methodology and error discussion.
