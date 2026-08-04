## Overview
An address-level yield and shading estimator for German balcony solar (*Balkonkraftwerk*, the 800 W plug-in kits legal since Solarpaket I). For renters on floors 1–5 who can legally hang two panels off a railing and have no idea whether their particular railing sees any sun.

## Problem
Every existing calculator is built for roofs: it asks for tilt and azimuth you don't know, assumes an unobstructed horizon, and ignores the single dominant variable for a third-floor Berlin courtyard balcony — the six-storey building 14 metres away. Nobody sends a surveyor for a €400 kit, official Solarkataster products cover rooftops only, and the renter is left guessing whether payback is 4 years or never. Meanwhile the inputs to answer this properly are all free public data, just unusable by a normal person.

## How it works
1. Type an address; the map flies there over a 3D building view.
2. Drag a pin onto your balcony, set your floor (or drag height in the 3D view).
3. Drag an arrow for the railing's outward normal; pick mounting (vertical against railing, or 30° bracket).
4. The app ray-traces the sky hemisphere against surrounding building geometry, producing an hourly horizon mask, convolves it with satellite irradiance climatology, and returns kWh/yr, a monthly bar chart, and the money shot: an annual sun-path diagram with *your actual skyline* drawn over it plus an hour × month heatmap of when you're shaded.

## Technical approach
**Geometry:** state open-geodata LoD2 CityGML building models (Berlin, NRW, Bavaria, Hamburg publish these free), converted with `citygml-tools`/`cjio` to a triangle soup stored as GeoParquet, queried by bbox in DuckDB spatial. **Irradiance:** CM SAF SARAH-3 hourly SIS/SID (0.05° grid) with DWD TRY as a cross-check; Erbs decomposition to DNI/DHI, Perez transposition onto the tilted/azimuthed plane via `pvlib`. **PV model:** `pvlib` ModelChain, generic 430 W module, NOCT cell temperature, AC clipping at 800 W (which matters a lot for a vertical south wall — it barely clips, a selling point). **Shading:** build a 360×90 binary horizon mask by marching rays against a BVH over triangles within 300 m, including self-shading from the slab of the balcony above. Stack: FastAPI + DuckDB, MapLibre for 2D, a small Three.js view for vertical pin placement, per-1 km-cell irradiance precomputed so a query is <2 s. **Hard part:** LoD2 tells you the building but not which face your balcony is on, and balconies protrude beyond the LoD2 footprint — the UI has to make arrow-dragging feel obvious, and validate the normal against the nearest wall plane. Second hard part: trees are absent from LoD2, so an "add a tree here, this tall" pin is a required escape hatch.

## v1 scope
- One city (Berlin) with its free LoD2 dataset
- Vertical railing mount only, fixed 800 W kit
- Output: kWh/yr + the sun-path-with-skyline chart
- No accounts, no saving

## Out of scope
Rooftops, other countries, self-consumption and payback modelling, Marktstammdatenregister registration help, affiliate buy links.

## Risks & unknowns
LoD2 coverage, currency, and licence vary by state. Users mis-placing the arrow produces confidently wrong numbers — needs a "does this skyline look like what you see?" confirmation step. Balcony protrusion and railing opacity are unmodelled. Unclear whether renters will find it before buying rather than after.

## Done means
For five balconies the builder can photograph, the predicted shaded-hours pattern matches the photographed skyline within ±10° azimuth, and annual yield lands within 15% of a hand-run `pvlib` calculation.
