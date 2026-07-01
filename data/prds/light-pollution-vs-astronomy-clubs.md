## Overview

A dark-sky map of the US where the only bright things are people: astronomy clubs plotted as glowing halos on top of NASA's night-lights imagery. The thesis — "where is the sky still worth driving to?" — is answered by overlaying *human interest in the sky* (organized astronomy clubs) on *the loss of the sky* (satellite-measured skyglow). The tension: clubs cluster near cities (where members live) but the good sky is out where nobody is. The viz makes the drive visible.

## Problem

Light-pollution maps are everywhere and beautiful, but they're inert — they show darkness without showing who cares. Astronomy-club directories exist as boring lists. Nobody has joined the two to answer the actually-useful question a stargazer asks: given where clubs (and thus dark-sky sites, star parties, loaner scopes) are, where's the nearest genuinely dark sky, and how far is the drive? It's a niche but high-share-propensity audience (amateur astronomers repost relentlessly).

## How it works

A full-screen dark basemap using VIIRS night-lights as the texture (darker = better). Each astronomy club is a dot with a halo whose radius encodes membership or activity. A "worth the drive" layer: for any point (or the viewer's geolocation), draw a vector to the nearest sufficiently-dark cell (below a Bortle/radiance threshold) and label the distance. Hovering a club shows name, location, and the darkness at its typical observing site vs. its home city. Primary share: a regional PNG showing club halos stranded in the urban glow with arrows pointing to the dark.

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: Vite + TypeScript, deck.gl or MapLibre GL for raster + point layers, static hosting. Raster tiles pre-generated at build time.

Data sources: **NASA VIIRS Black Marble** (VNP46A-series annual composites via NASA Earthdata / LAADS DAAC — confirmed accessible, though the higher-res products need an Earthdata login token for download; the annual global mosaics are the input). Convert radiance GeoTIFF to web tiles. **Astronomical League** club rosters — the League publishes its member-society directory (society name, city/state, sometimes lat/lon); geocode where coords are missing via Census/Nominatim.

Data model: `clubs[] = { name, lat, lon, state, members? }`; raster = radiance-per-pixel. Precompute per-club nearest-dark-cell distance by sampling the radiance raster outward.

Key algorithm: nearest-dark search — from a club location, spiral/ring-sample the radiance raster until a cell below threshold is found; store distance + bearing. Optionally bin radiance into Bortle-like classes for legend legibility.

The hard part: turning multi-GB VIIRS GeoTIFFs into lightweight web tiles (downsample, log-scale radiance, colormap) so the page stays static and fast, and reconciling the Astronomical League's inconsistent location fields.

## v1 scope (humiliatingly small)

- One VIIRS annual composite, downsampled, one region (e.g. the Southwest — best contrast of dark sky vs Phoenix/Vegas glow).
- Club dots from the Astronomical League directory, geocoded.
- Static map, no geolocation; nearest-dark arrow computed for a handful of hand-picked clubs.
- PNG export.

## Out of scope (for now)

- Multi-year skyglow trend/animation, live geolocation "nearest dark from me," Bortle-class calibration, international clubs, cloud-cover or moon-phase overlays.

## Risks & unknowns

- **Prior-art verdict: Partial.** VIIRS light-pollution maps are saturated; none overlay club rosters — the join is the fresh part, so lean hard on the "where clubs are vs where the dark is" tension, not the map itself.
- VIIRS product access needs an Earthdata token; annual mosaic size/tiling is the main effort.
- Astronomical League directory completeness and geocoding accuracy.
- Radiance-to-Bortle mapping is approximate; avoid overclaiming.

## Done means

- Static page renders a VIIRS-derived dark basemap for one region with real Astronomical League club dots on top.
- At least one club shows a correct nearest-dark distance/arrow verifiable against the underlying raster.
- PNG export works; club count matches the source directory for that region.
