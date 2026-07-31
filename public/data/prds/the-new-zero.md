## Overview
An explorable map of vertical-datum change: type an address and see the ground elevation, the FEMA Base Flood Elevation, and your freeboard (the cushion between them) computed in the old datum and the new one, side by side. For homeowners, floodplain managers, surveyors, and anyone who enjoys watching a bureaucratic constant quietly invalidate a million published numbers.

## Problem
"Elevation" is not a fact, it's a model — a geoid surface someone fit to gravity data. NGVD29 became NAVD88 and every published elevation shifted by up to ~1.5 m. NAPGD2022 does it again. Meanwhile FEMA's Base Flood Elevations, airport approach minimums, building codes, and levee certifications are all stated in a datum, and almost nobody checks which one. The result: a house can go from 1.2 ft of freeboard to −0.3 ft without a single grain of dirt moving. There is no public tool that shows you the delta on a map.

## How it works
Drop a pin or search an address. The app shows three stacked numbers — ground, BFE, freeboard — each rendered twice (old datum / new datum), with the shift annotated as an arrow. A choropleth layer under it shows the conversion delta as a smooth field, so you can see the national structure of the change (it is not a constant offset; it's a warped sheet, ~ −0.5 m in the West, positive along parts of the East Coast). A "who flips" toggle highlights parcels whose freeboard sign changes.

## Technical approach
- Datum math: NGS VERTCON 3.0 grids for NGVD29→NAVD88 (real, public, downloadable), and the NGS NCAT/xGEOID beta grids for NAVD88→NAPGD2022. Where beta grids are unstable, fall back to the historical NGVD29→NAVD88 delta and frame the app as "this already happened once — here's how much."
- Ground elevation: USGS 3DEP 1/3 arc-second DEM (NAVD88), sampled via the 3DEP `identify` REST endpoint or a local COG.
- Flood data: FEMA NFHL ArcGIS REST MapServer, layers `S_BFE` (BFE lines) and `S_Fld_Haz_Ar` (zone polygons); BFE elevations carry a datum attribute that is frequently NGVD29 with the conversion buried in the FIS text.
- Rendering: MapLibre GL + a titiler/rio-tiler pyramid of the delta grid as float32 COG; address search via the free Census Geocoder.
- Hard part: BFE lines are lines, not surfaces. To get a BFE at a point you must interpolate between the two nearest BFE lines *along the flow direction of the mapped stream*, not by nearest-neighbor. Doing this honestly (and showing an uncertainty band when you can't) is the real engineering.

## v1 scope
- One state, one datum transition (NGVD29→NAVD88 via VERTCON).
- Address search → ground elevation in both datums, delta in feet.
- National delta raster as a background layer.

## Out of scope
Surveyor-grade output, tidal datums (MLLW/MHHW), Alaska/Hawaii/territories, elevation certificates, anything a bank would accept.

## Risks & unknowns
NAPGD2022 release timing keeps slipping; NFHL datum attributes are dirty; people may mistake this for legal advice — hard disclaimer required.

## Done means
For a known test address with a published Elevation Certificate, the app reproduces the certificate's NAVD88 ground elevation within 0.3 ft and correctly states the NGVD29 conversion factor printed on it.
