## Overview

Paste a lat/lon (or drop a pin) and get a vertical "species pillar" rising out of that exact spot: every fungus, lichen, beetle, bird, plant, and mammal ever logged within a 50m radius of it. Scrubbable by season. The primary artifact is one shareable PNG — a portrait of the life visible from *your* bench, doorstep, or campsite. Every viewer gets a unique image tied to coordinates they care about.

## Problem

Biodiversity data is vast (hundreds of millions of observations) but experientially inert. iNaturalist and GBIF let you query a radius, but the output is a paginated table or a dot-on-a-map — nothing that feels like *this place*. There is no artifact that answers "what lives right here, at arm's reach?" in a single glance and turns it into something you'd post. The magic is scale collapse: the whole tree of life, filtered to one bench.

## How it works

1. User provides a coordinate (map click, paste, or "use my location").
2. App queries iNaturalist + GBIF for all research-grade/verifiable observations within 50m.
3. Records are grouped by taxonomic class and stacked into a vertical column, each species a labeled band with a representative thumbnail and observation count.
4. A season scrubber (spring/summer/fall/winter) filters by observed_on month, so the pillar changes shape across the year.
5. Sparse spots trigger a "zoom to 500m" affordance.
6. Export renders the current view to a single high-res PNG with the coordinate and a total species count in the footer.

## Technical approach — stack, data, model, hard part

**Stack:** Static SPA (Vite + vanilla TS or Svelte), Canvas/SVG for the pillar, Mapbox GL JS for the pin picker. No backend needed for v1 — call APIs client-side; cache responses in localStorage.

**Data sources:**
- iNaturalist API v1: `GET /v1/observations?lat=&lng=&radius=0.05&per_page=200&order_by=species_guess`, plus `/v1/observations/species_counts` for the ranked species list and counts. Free, no key, 100 req/min.
- GBIF Occurrence API: `GET /v1/occurrence/search?decimalLatitude=&decimalLongitude=&geoDistance=50m` to backfill museum/eBird records iNat misses. Free.

**Data model:** `Observation { taxonKey, scientificName, commonName, iconicTaxon, month, photoUrl, count, source }`. Aggregate to `SpeciesBand { taxon, class, count, monthsObserved[], thumb }`.

**Key algorithm:** Merge iNat + GBIF on taxonKey (GBIF backbone) to dedupe; sort bands within each iconic-taxon group by count; lay out as a fixed-width stacked column, band height ∝ log(count) so a single rare beetle still shows.

**Hard part:** De-duplicating across two APIs with different taxonomies (map iNat taxa to the GBIF backbone), handling radius sparsity gracefully, and rate/pagination limits when a dense urban park returns thousands of records — cap and summarize the long tail.

Ships as one shareable PNG.

## v1 scope (humiliatingly small)

- Single hardcoded 50m radius, no 500m toggle.
- iNaturalist only (skip GBIF merge).
- Season scrubber = 4 static buttons, no animation.
- One column layout, no map basemap in the export — just the pillar + coord.
- Paste-lat/lon input only; add map picker later.

## Out of scope (for now)

- User accounts, saved locations, comparison of two spots.
- Real-time observation streaming.
- Mobile-optimized interactive; PNG is the shareable.
- Audio, 3D, or globe views.

## Risks & unknowns

- **Prior-art verdict: Open.** iNat radius search and Geomodel exist as *capabilities*, but the species-pillar PNG artifact does not — this is genuinely un-built.
- iNat coverage is dense in US/CA/EU, sparse rural — the 500m fallback is essential eventually.
- API rate limits under viral load; may need a caching proxy if it takes off.
- Taxonomic merge complexity if GBIF is added.

## Done means

- Enter a coordinate in a dense park → a stacked species pillar renders in under 5s with ≥1 band per iconic taxon present in the data.
- Season buttons visibly change which bands appear.
- "Export PNG" produces a single image with the pillar, coordinate, and total species count, downloadable in one click.
