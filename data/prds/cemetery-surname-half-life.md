## Overview

Ethnicity has a half-life you can measure in headstones. Divvy joins cemetery polygons to the surnames of the living residents in the surrounding census tract, and asks: how long does the buried population's ethnic signature lag the neighborhood's? A tract that's turned over — say from Italian to Chinese, or German to Mexican — still holds its old names in the ground. The artifact is a per-cemetery time-decay glyph showing the gap between the dead and the living.

## How it works

For each cemetery, take the surname distribution implied by its surrounding tract's historical composition and compare it to the tract's *current* surname distribution from census surname tables. The "ethnic half-life" is how slowly the underground name-mix would converge to the aboveground one — a decay measured in the divergence between two surname vectors. Rendered as a per-cemetery glyph (a small decay curve or a two-ring dead/living comparison), with a map of cemeteries colored by their divergence.

## Problem

Neighborhood ethnic turnover is well-studied demographically but always through the living. Cemeteries are a frozen record of *who used to be here*, and the gap between the buried and the current residents is a vivid, tangible measure of turnover that no artifact captures. Cemetery-vs-census is a known teaching exercise, but there's no built "ethnic half-life" product. Lowest-virality, highest-intellectual-interest of the Round-4 set — grad-thesis energy, so scope tightly.

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: Vite + TypeScript + MapLibre/D3; Python (geopandas) build step for the spatial join, baked to JSON.

Data sources: **OSM Overpass API** — query `landuse=cemetery` / `amenity=grave_yard` polygons for a region (confirmed accessible without auth). **ACS surname tables** — the Census Bureau's "Frequently Occurring Surnames" dataset ties surnames to race/ethnicity distributions; combined with tract-level ACS ancestry/race data (via the Census API or tidycensus) to build the living surname/ethnicity vector per tract. Cemetery polygons join to their containing/adjacent tract.

Data model: `cemetery[osm_id] = { polygon, tract_geoid }`; `tract[geoid] = { current_ethnicity_vector, historical_ethnicity_vector }`; derived `divergence[cemetery] = distance(dead_vector, living_vector)`.

Key algorithm: represent both the "buried" (proxied by the tract's older-cohort / historical ancestry mix) and "living" populations as ethnicity vectors, then measure divergence (cosine or JS-divergence). The "half-life" is a framing device for how far apart they are — full longitudinal decay needs multi-decade data, so v1 measures the *current gap* and calls it the signature. Honest note in copy: without actual headstone-name transcription, the "dead" vector is a demographic proxy, not literal grave data.

The hard part: cemeteries don't cleanly map to one tract, and there's no public per-cemetery headstone-name dataset — so the "dead population" must be proxied from demographic history, which is the weakest link and must be stated plainly.

## v1 scope (humiliatingly small)

- One city with strong documented ethnic turnover (e.g. a NYC or Chicago neighborhood).
- OSM cemetery polygons for that city, each snapped to its containing tract.
- Living vs proxied-historical ethnicity vectors from ACS; one divergence number per cemetery.
- Static map colored by divergence + one per-cemetery glyph. PNG export.

## Out of scope (for now)

- Actual headstone transcription / Find A Grave scraping, true longitudinal decay curves, national coverage, animation, statistical significance testing.

## Risks & unknowns

- **Prior-art verdict: Open.** Cemetery-vs-census exists only as a teaching exercise; no OSM×ACS "ethnic half-life" artifact exists. Clean runway.
- Biggest risk: the "dead" population is a proxy (demographic history), not real grave data — the central claim is softer than the framing implies; be honest.
- Surname→ethnicity mapping (ACS surname table) is coarse and US-specific.
- Cemetery-to-tract assignment is ambiguous for large/edge cemeteries.

## Done means

- Static map for one city renders real OSM cemetery polygons, each with a computed divergence between living (ACS current) and proxied-historical ethnicity vectors.
- At least one cemetery's glyph is inspectable and the numbers reconcile against the source ACS tract data.
- Copy states the proxy caveat explicitly; PNG export works.
