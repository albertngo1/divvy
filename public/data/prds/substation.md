## Overview
Substation is a self-hosted watcher + map for homeowners, journalists, and small-town council-watchers who want to know when a hyperscale data center (or the substation/transmission upgrade that feeds one) is being proposed near a pinned address — while it's still a line item in a queue, not a done deal.

## Problem
The HN/Redfin story is that Americans overwhelmingly oppose nearby AI data centers, but by the time opposition organizes, land is optioned and permits are filed. The signals that a data center is coming exist in *public* data — grid interconnection queues (large-load additions of 50–500MW), utility rate-case filings, and county rezoning/special-use agendas — but they're scattered across a dozen incompatible portals in PDF and spreadsheet hell. No normal person can monitor them. That's the arbitrage: cheap for a scraper, invaluable to the person whose backyard is the site.

## How it works
You pin an address and radius. Substation ingests large-load interconnection requests from ISO/RTO queues (CAISO, PJM, MISO, ERCOT, SPP publish these), geocodes the point of interconnection, and cross-references county Legistar/Granicus meeting agendas for rezoning items with matching parcel geometry. When a >50MW load request or a data-center-keyworded zoning item lands inside your radius, you get an alert with the filing, the projected MW, the meeting date, and a map pin. A trend view shows load requests clustering over time (the tell-tale sign of a data-center corridor forming).

## Technical approach
Python + SQLite + a small Leaflet frontend. Ingest: scheduled scrapers per ISO (most publish monthly queue XLSX/CSV; parse with pandas). Zoning: poll Legistar/Granicus REST endpoints and OpenGov agendas, keyword-filter ('data center', 'hyperscale', 'large load', substation names), NER on parcel IDs. Geocode POIs via Census/Nominatim; spatial join against your radius with Shapely. The genuinely hard part is entity resolution — matching a vaguely-worded interconnection request ('Project Willow, 300MW, ~Loudoun County') to an actual parcel and to a zoning agenda item, since filings deliberately obscure the end customer. Fuzzy match on MW + county + timing + shell-LLC name patterns; surface confidence, never assert.

## v1 scope
- One ISO (PJM — the Virginia data-center epicenter) queue parser
- One county's Legistar agenda scraper
- Pin address + radius, nightly cron, ntfy push on match
- Leaflet map with load-request pins and filing links

## Out of scope
- All ISOs / national coverage
- Automated shell-company unmasking beyond name heuristics
- Legal/organizing tooling, petitions

## Risks & unknowns
- Queue formats change and break parsers constantly
- False positives from generic large-load requests (factories, not data centers)
- Parcel↔filing matching may be too weak to be actionable in many counties

## Done means
For a seeded PJM/Loudoun test address, Substation surfaces at least one real historical large-load interconnection request within the radius, links its source filing, and fires an ntfy alert — with a map pin the user can click to the primary source.
