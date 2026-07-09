## Overview
Off the Map is a single-page interactive atlas for the historically curious. Where worldmonitor renders the world as it frantically *is*, Off the Map renders the world as it *was and isn't* — a base map that shows only settlements, polities, and colonies that have been disestablished, abandoned, drowned, or renamed out of existence. The "New Sweden" HN piece is the seed: a real US colony most people never knew existed.

## Problem
Historical geography is scattered across Wikipedia infoboxes and dead-link gazetteers. There's no single canvas where you can *watch* the political and settlement map dissolve and reform over time. Existing history maps show borders as they were; almost none foreground the negative space — what's gone.

## How it works
A full-bleed map with a bottom **century scrubber** (1500→2026). At any year the map shows only entities whose "end date" is at or before the cursor: ghosted markers for abandoned towns, faded polygons for dissolved states, blue-tinted shapes for reservoir-drowned settlements. Clicking a marker opens a card: name, lifespan, cause of death (annexed / drowned / depopulated / renamed), and a source link. A **cause filter** lets you isolate, say, only towns lost to dams, or only colonies. A "surprise me" button flies to a random obscure entity. The emotional payload is the scrub animation: watching New Sweden blink out in 1655, whole Aral Sea fishing towns strand in the 1980s.

## Technical approach
Static site: MapLibre GL JS + a dark, label-light base style. Data harvested offline via a SPARQL query against Wikidata for instances of `former country`, `abandoned village`, `ghost town`, and `former colony` that have a `dissolved/abandoned date (P576)` and coordinates (P625); enrich with `cause of destruction`. Bake the result to a single GeoJSON/PMTiles file so there's zero runtime API dependency. Data model: `{id, name, lat, lon, start, end, category, cause, wikidata_url}`. The hard part is data quality — Wikidata dates are messy (circa, ranges, missing) and dedup between overlapping entity classes; needs a normalization pass and a manual curation layer for ~50 hero entries with good stories.

## v1 scope
- One baked GeoJSON of ~500 vetted vanished places
- Century scrubber + cause filter + click cards
- "Surprise me" random flight
- Fully static, deployable to a CDN

## Out of scope
- Editable/crowdsourced entries
- Reconstructed historical borders as animated polygons (points + rough polys only)
- Multi-language labels

## Risks & unknowns
- Wikidata coverage is uneven; the map may feel sparse without heavy curation.
- Date parsing for pre-modern entities is genuinely fiddly.
- Risk of being "pretty but shallow" — the story cards are what make it stick.

## Done means
The scrubber correctly hides/reveals markers by year for a hand-checked set of 20 entities, New Sweden appears and vanishes on the right dates, and the whole thing loads and renders in under 2 seconds from static hosting with no API calls.
