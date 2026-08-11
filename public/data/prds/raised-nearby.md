## Overview
A fast, beautiful, zoomable map of US private-securities offerings, built entirely from SEC Form D filings. Type an address; see every company that has raised private capital near you since 2009, with amounts, industry, and the humans named on the filing. For nosy neighbors, local journalists, angel investors, commercial-real-estate people, and anyone who has ever wondered what the unmarked office above the dry cleaner actually does.

## Problem
Form D is one of the richest public datasets in American finance — issuer street address, industry group, total offering amount, amount sold, date of first sale, and the names of executives and promoters — and it is filed for essentially every private raise in the country. It is also completely unusable: EDGAR gives you XML per accession number, no geocoding, no aggregation, no map. Crunchbase-style products cover venture darlings and ignore the long tail of local funds, real-estate syndications, and church bond offerings that make the dataset interesting.

## How it works
Search or drop a pin. The map renders offerings as dots sized by amount sold and colored by industry group (Pooled Investment Fund, Real Estate, Tech, Health Care, Other). Scrub a year slider to watch the 2021 fund boom bloom and drain. Click a dot: issuer name, amount, exemption claimed (506(b) vs 506(c) — the latter means they're allowed to advertise), related persons, and a link to the raw filing. A "per capita" toggle normalizes by census tract population so downtown doesn't drown out everything.

## Technical approach
Ingest: EDGAR quarterly `full-index/YYYY/QTRn/form.idx`, filter form type `D` and `D/A`, fetch each `primary_doc.xml` (respecting SEC's 10 req/s and User-Agent rule). Parse into a flat table (~1M rows) in DuckDB, exported to Parquet. Geocode addresses through the Census Bureau Batch Geocoder (free, 10k rows/batch), falling back to Nominatim for misses. Tile with tippecanoe into PMTiles, served from R2/S3 and rendered by MapLibre GL — no map server, no per-tile cost.

The genuinely hard part is address truth. A large fraction of Form D issuer addresses are registered agents, fund administrators, GP counsel, and coworking desks — 251 Little Falls Drive in Wilmington would be the densest square inch of finance in America. Solution: cluster identical normalized addresses, flag any address with more than N distinct issuers as an agent hub, and default them off with an "agent hubs" toggle that makes the shell-company geography visible on purpose. Amount fields also need care: `totalAmountSold` vs `totalOfferingAmount`, and "Indefinite" is a legal value.

## v1 scope
- One metro area, filings 2015–2026
- Dots + sidebar detail + year slider
- Agent-hub filter with a naive threshold
- Static site, no accounts, no backend

## Out of scope
- Entity resolution across issuers and their funds
- Form ADV / 13F joins
- Alerts, email digests, saved searches

## Risks & unknowns
Geocode hit rate on messy addresses; SEC rate limits during backfill; the "so what" problem if a given neighborhood is empty (mitigate by opening on a dense default view).

## Done means
Enter a residential address in the pilot metro and get, in under two seconds, an accurate map of Form D issuers within five miles, with agent hubs suppressed and every dot clicking through to the real EDGAR filing.
