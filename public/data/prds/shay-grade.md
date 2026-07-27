## Overview

**Shay Grade** is a solo, browser-based logging-railroad tycoon set on *real terrain*. You pick a real drainage in the Pacific Northwest or Appalachia (Willamette, Coos Bay, New River Gorge), and the game hands you a 1/3-arcsecond USGS elevation tile, a stand of merchantable timber, one battered Shay locomotive, and a debt. Everything after that is a fight against gradient.

For players who liked the route-planning half of Transport Tycoon but found the terrain fake and the physics decorative.

## Problem

Rail tycoons treat terrain as cosmetic bumps you bulldoze away with money. The actual historical drama of logging railroads was that terrain won constantly — that's *why* the geared Shay locomotive exists: it trades speed for the ability to crawl up 10% grades on hastily-laid, badly-ballasted track. No game models the thing that made those railroads interesting: the temptation to build a route you cannot safely descend loaded.

## How it works

You draw a polyline on a shaded-relief map. The game samples elevation along it and immediately shows you the **grade profile** as a ribbon under the map, color-graded from green (<2%) to arterial red (>8%). Cheap track hugs the contour and is long; expensive track cuts, fills, trestles, and switchbacks.

Then you *run* it. A tractive-effort sim decides the outcome: the Shay's geared drive gives huge low-speed tractive effort but a hard ~12 mph ceiling, so a gentle 40-mile contour route may earn less per day than a vicious 6-mile climb. Descending loaded is the knife-edge — brake heat accumulates as an integral of potential energy dumped per mile, and if you exceed the shoe's thermal budget you get a **runaway**: cars in the creek, crew dead, insurance rates up, that stand written off.

Each season the stand you've reached gets cut out and the timber price index moves. You extend, re-grade, or abandon spurs. The run ends when the drainage is logged out; your score is board-feet delivered per dollar of grading moved, with a scoreboard of your own past runs on the same real watershed.

## Technical approach

- **Terrain**: USGS 3DEP 1/3-arcsec DEM via the National Map's `elevation.nationalmap.gov` TNM Access API, pre-clipped to ~15×15 km GeoTIFF tiles, reprojected to UTM with GDAL and shipped as a 16-bit PNG heightmap + precomputed hillshade. Timber stands seeded from NLCD forest-cover classes so the woods are where the woods are.
- **Stack**: TypeScript + deck.gl (TerrainLayer + PathLayer) over a Vite app; sim in a Web Worker at fixed 20 Hz. State in a plain reducer, saves as JSON in IndexedDB.
- **Track cost**: each 20 m segment computes cut/fill volume against the DEM as a trapezoidal prism; grade >7% forces switchbacks, side-slope >60% forces a trestle priced by span×height. Route validity check is a Dijkstra over a graph of DEM cells with edge weight = earthwork cost, so "suggest a route" is free.
- **Physics**: `F = TE(v) - Rr - W·sin(θ)` with Davis resistance for rolling, Shay TE curve fit from published 1920s Lima catalog charts. Brake heat is `∫ m·g·sin(θ)·v dt` minus a convective cooling term.
- **Hard part**: making earthwork cost *legible*. A number is boring; the ribbon profile must let you feel, at a glance, that the shortcut is a mistake — that's UI work, not sim work.

## v1 scope

- One hardcoded drainage, one DEM tile, one Shay class.
- Draw a route, see grade profile + earthwork cost, build it.
- Run a loaded descent; brake-heat gauge; runaway is a game over.
- Three seasons, static timber price.

## Out of scope

- Multiple locomotive classes, rod engines, Climax/Heisler.
- Employees, town-building, competitor railroads.
- Any multiplayer.

## Risks & unknowns

- DEM tiles are heavy; may need aggressive downsampling for a 60 fps terrain mesh.
- The Shay tractive-effort curve is not cleanly published — may need to fit from a couple of data points and hand-tune.
- Risk that optimal play is always "hug the contour," collapsing the decision. Mitigation: seasonal timber-price decay makes slow routes lose money.

## Done means

On the shipped drainage, I can draw two routes to the same stand — a 9-mile contour and a 3-mile 8% climb — see honestly different cost/time numbers, run both, and have the steep one actually kill me if I descend it at full load without pausing to cool the brakes.
