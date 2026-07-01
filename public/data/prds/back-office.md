## Overview
Back Office is a browser-only analytics app for solo marketplace sellers. You drag in the CSV export your platform already gives you (Etsy orders, eBay transactions, Shopify, Discogs), and it produces the profit/trend/SKU dashboards those platforms hide behind enterprise tiers — with zero upload, because chDB (ClickHouse compiled to WASM) crunches everything client-side.

## Problem
Small sellers have rich sales data trapped in CSV exports and no good way to analyze it. Platform analytics are shallow or paywalled; spreadsheets choke past a few thousand rows; and the 'just upload your data' SaaS tools require trusting a stranger with your revenue. There's a real distrust of uploading financials post-Sony-deletes-your-stuff era.

## How it works
Open the site, drop a CSV. Back Office auto-detects the platform's export schema, maps columns to a canonical order model, and loads it into an in-browser ClickHouse table. You get prebuilt views: revenue over time, profit by SKU (after fees), repeat-buyer rate, seasonality heatmap, and a free-form SQL cell for power users. Everything runs offline; a 'save workspace' button writes the parquet + config to a local file you re-open later.

## Technical approach
Stack: React + wasm.chdb.io (ClickHouse OLAP in WASM). Ingest: PapaParse for CSV → column fingerprinting against a library of known export schemas (regex + header-set matching) → INSERT into a chDB MergeTree table. Data model: canonical `orders(ts, sku, qty, gross, fees, ship_cost, buyer_hash)`; platform adapters normalize into it. Queries are plain SQL strings run against chDB; charts via a lightweight lib (uPlot/Observable Plot). The hard part is schema mapping — every platform's export differs and changes over time, so the fingerprinter needs a maintainable adapter registry and a graceful 'map these columns yourself' fallback. Also: keeping WASM memory sane for 100k+ row exports (stream inserts, avoid full-file JSON).

## v1 scope
- Etsy orders CSV only
- Three fixed dashboards: revenue/time, profit-by-listing, repeat-buyer rate
- One raw-SQL cell against the loaded table
- Entirely client-side; no backend at all

## Out of scope
- Multi-platform merge / cross-store dedupe
- Live API sync (CSV only for v1)
- Auth, accounts, cloud save

## Risks & unknowns
- chDB WASM bundle size and cold-start on mobile
- Export schemas drift and break adapters
- Is 'private analytics' a strong enough wedge to pay for, or a free tool?

## Done means
A seller drops a 20,000-row Etsy export and, with no network requests after page load (verifiable in devtools), sees an accurate profit-by-listing table and can type `SELECT sku, sum(gross) ...` in the SQL cell and get results in under two seconds.
