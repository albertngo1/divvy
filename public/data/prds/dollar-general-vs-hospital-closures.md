## Overview

A single county-level map that settles an argument: as rural hospitals close, does Dollar General move in before or after? Divvy renders 2010–2024 as a rolling animation where each U.S. county lights up on two channels — DG store openings and rural hospital closures — and a companion scatter plot shows the lead/lag in months per region. The story is not "here are two datasets" but a *temporal race*: nobody has framed DG expansion and hospital collapse as a question of which arrives first, and whether that ordering flips between the Deep South, Appalachia, the Plains, and the Rust Belt.

## Problem

Rural healthcare deserts and dollar-store saturation are both heavily reported, but always separately and always statically. The public intuition ("dollar stores show up when towns die") is untested folklore. There is no artifact that lets you *see* the sequence — whether DG is a leading indicator of a county giving up, a lagging vulture, or coincidental. A screenshot that ends the argument is inherently shareable across urbanist, public-health, and rural-policy audiences.

## How it works

The viewer lands on an animated choropleth of the continental US, county granularity, with a year scrubber (2010→2024). Two visual channels: a diverging fill (net DG store count change) and closure markers (a hospital glyph that appears the year a facility shuts). Hovering a county opens a card: DG store count over time, closure date(s), and the computed lead/lag ("DG arrived 14 months *before* the closure"). A second view is a per-region scatter — x = months between events, y = region — so the flip is legible in one glance. Primary shareable is a PNG export of any frame or the full-region scatter.

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: static site, Vite + TypeScript + D3 (or Observable Plot) for the choropleth and scatter; no backend — all data pre-baked into JSON/Arrow at build time. County geometry from the US Census cartographic boundary files (TIGER/Line, 20m simplified) with FIPS as the join key.

Data sources: **Dollar General store list** — DG publishes a store locator; scrape or use the periodically-mirrored full store list (address + open date where available), geocode to county FIPS via Census Geocoder batch API. **Rural hospital closures** from the **UNC Cecil G. Sheps Center for Health Services Research** closures list (downloadable CSV: facility, county, closure date, closure type "complete" vs "converted"). Both join on county FIPS.

Data model: `county[fips] = { year: { dg_count, dg_opened[] } }` plus `closures[] = { fips, date, type }`. Precompute per-county `lead_lag_months = dg_first_open_date − nearest_closure_date`.

Key algorithm: event alignment. For each closure, find the DG open event minimum in absolute time distance within the same county (or adjacent counties for a "trade-area" variant), sign it, bucket by Census region. Caveat: DG open dates are patchy — where missing, fall back to first-appearance-in-scrape as a lower bound and flag it.

The hard part: getting reliable DG *open dates* (not just current locations) and geocoding tens of thousands of stores cleanly to FIPS without rate-limit pain.

## v1 scope (humiliatingly small)

- One region (start with the Deep South / Sheps Center's densest closure cluster).
- Static choropleth, single "final frame" (2024) — no animation yet.
- Lead/lag computed only for counties with both a closure and a dated DG open.
- Hover card + PNG export.

## Out of scope (for now)

- Animation/scrubber, trade-area (adjacent-county) matching, non-DG dollar chains (Dollar Tree/Family Dollar), causal claims, mobile-optimized layout.

## Risks & unknowns

- **Prior-art verdict: Open.** Both datasets exist separately; the lead/lag join is un-built. Clean runway.
- DG open-date coverage is the single biggest risk — if too sparse, pivot to "presence by year" from dated scrapes.
- Geocoding error at county boundaries; correlation-not-causation framing must be explicit in copy.
- "Rural" definition varies — inherit Sheps Center's own rural classification.

## Done means

- Deployed static page renders a US (or one-region) county choropleth from real DG + Sheps Center data.
- At least one county's hover card shows a correct, verifiable lead/lag against a known closure.
- Per-region scatter renders and a PNG can be exported. Numbers reconcile against the raw Sheps CSV row count.
