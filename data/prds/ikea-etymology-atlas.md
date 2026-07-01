## Overview

IKEA name etymology atlas takes every IKEA product name — BILLY, POÄNG, KALLAX, EKTORP — and traces it back to its origin: a Swedish place-name, a Norse word, a Finnish lake, a Sami term. IKEA's naming system is a documented taxonomy (bookcases get boys' names, textiles get Scandinavian place-names, chairs get men's names, and so on). Plotted on a map and animated by catalog year, you watch the catalog's naming geography *migrate north* over 70 years and see the linguistic core-sample of a corporation's imagination.

## How it works

Each product name resolves to a geographic point (for place-name products) or a word origin (for the semantic categories). The main view is an animated map: dots for every named product, colored by product category, positioned at their Swedish/Nordic place-of-origin. A year scrubber advances the catalog; new dots bloom as products launch. A side lineage tree shows, for a selected name, its etymology chain (word → language → meaning → geographic anchor). The claim to test on screen: does the naming geography shift north/east over the decades.

## Technical approach — specific & technical

Stack: static site, Vite + TypeScript, MapLibre GL for the animated map, D3 for the lineage tree.

Data sources by name:
- **IKEA historical catalog** — scrape product names + launch years from the digitized **IKEA Museum** catalog archive and community datasets (the naming *system* is well documented; product-name lists circulate as CSVs). Also mine `lar5.com`'s existing static name→place mapping as a seed.
- **Wiktionary** etymology dumps — parse the `etymology` sections (via the Wiktionary API or a `wiktextract`/Kaikki JSON dump) to get word origin and donor language for the semantic-category names.
- **GeoNames** (`geonames.org`) — free gazetteer; geocode Swedish/Norwegian/Finnish/Sami place-names to lat/lon, filtered to Nordic country codes to avoid false matches.

Pipeline (offline, Python): build `products.csv` (name, category, first-catalog-year) → for place-name categories, look up name in GeoNames restricted to SE/NO/FI/DK → for word categories, hit Wiktionary for etymology → assemble a resolved record with confidence flag. Manual review of ambiguous matches.

Data model: `products[{name, category, year, kind:"place"|"word", lat, lon, origin_lang, gloss, geonames_id, confidence}]`. Timeline built from `year`.

Key algorithm: geocoding disambiguation — Swedish place-names are common and repeat; resolve by (a) restricting GeoNames to Nordic feature classes, (b) preferring populated places, (c) confidence scoring by string-match exactness. The hard part is that many names are *not* clean place-names (compound words, invented names, boys'/girls' names), so a large fraction won't geocode — accept partial coverage and label unmapped names in the lineage tree only.

## v1 scope (humiliatingly small)

- ~150 products from the most-documented categories (bookcases, textiles, beds) with launch years.
- Geocoded place-name dots on the map + a working year scrubber.
- Lineage tree for the geocodable subset.
- Precomputed JSON; no runtime scraping.

## Out of scope (for now)

- Every product ever (thousands); non-geocodable name categories on the map.
- Live catalog updates, purchase/popularity data.
- Multilingual UI.

## Risks & unknowns

Prior-art verdict: **Partial**. Static name→place maps exist (e.g. lar5.com); the *time-animated "migrates north"* dimension is unbuilt. Fresh angle = the temporal migration of the naming geography, not just a static map. Unbuilt part: the animation over catalog years. Risks: reliable per-product *launch years* are the weak link — the catalog archive may not cleanly date every SKU; mitigate by scoping to products with confirmed launch dates. Geocoding precision for repeated Swedish place-names will be imperfect; surface a confidence flag rather than hiding it. The "migrates north" thesis may not hold — be ready to report the actual pattern honestly.

## Done means

An animated map of ~150 geocoded IKEA products with a working year scrubber renders in-browser, each product traceable to a lineage tree, and the actual temporal geography pattern (north-migration or not) is legible and stated — all data precomputed.
