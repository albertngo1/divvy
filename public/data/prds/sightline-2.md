## Overview
A civic transparency tool sparked by the ACLU's 'Flock credibility lost' story. It aggregates scattered-but-public evidence about automated license-plate-reader deployments in a given town and renders a shareable accountability sheet for the people who show up to city council meetings: local journalists, activists, and privacy-minded residents.

## Problem
The data to hold a surveillance vendor accountable *exists* but is fragmented across crowdsourced camera maps, meeting minutes, transparency portals, and public-records responses. No individual resident can assemble it before the Tuesday-night council vote — but assembling it is cheap if you have the pipes. Classic arbitrage: cheap for a machine, decisive for a niche.

## How it works
Enter a city or ZIP. Sightline pulls known ALPR camera locations from DeFlock.me / OpenStreetMap (`man_made=surveillance` + camera:type tags), plots them on a map with a coverage heat estimate, and pairs them with a timeline of that jurisdiction's public statements: council agenda items mentioning 'Flock', 'ALPR', 'Fusus', retention-period claims, data-sharing promises. It flags discrepancies — e.g. promised '30-day retention' vs. a later report of statewide sharing — as red 'divergence' cards, each linked to its source. Output is a printable one-pager plus a raw citation list you can read into the mic.

## Technical approach
Self-hosted Python + SQLite. Ingest: DeFlock/Overpass API for camera geometry; a nightly scraper over the target city's Legistar/Granicus agenda feeds (many US cities use these standard portals with predictable JSON/RSS) plus Flock's public transparency portal pages. NLP layer is deliberately light: keyword + regex extraction of retention numbers, sharing language, and vendor names, with an optional local LLM pass to summarize a minutes PDF into claim cards. Map via MapLibre + OSM tiles. Data model: `jurisdiction -> {cameras[], statements[], divergences[]}`. Hard part: normalizing the wildly inconsistent agenda-portal formats and avoiding false 'divergence' flags — every claim card must deep-link to a verifiable primary source, no synthesis without citation.

## v1 scope
- One portal type (Legistar) + DeFlock camera overlay
- 3–5 seed cities hand-verified
- Keyword divergence detection for retention + data-sharing only
- Printable one-pager with source links

## Out of scope
- Nationwide coverage, non-Legistar portals
- Any scraping of camera feeds themselves (data, not access)
- Editorializing beyond flagging sourced contradictions

## Risks & unknowns
- Portal format drift breaks scrapers; needs per-city adapters
- False divergence flags erode trust — precision must beat recall
- Crowdsourced camera locations are incomplete/stale
- Legal caution: only public records, clearly attributed

## Done means
For a seed city, a user enters the name and within seconds gets a map of documented ALPR cameras plus at least one correctly-flagged, source-linked divergence between a public promise and a public report, exportable as a one-page PDF.
