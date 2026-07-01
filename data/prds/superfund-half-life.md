## Overview

How long does a town remember its poison? Divvy takes EPA Superfund sites and asks whether the stigma fades — plotting the 5-year change in home prices within 1-mile rings of each site, then rendering per-region decay curves. Does contamination memory have a half-life, and does it differ between the Rust Belt, the coasts, and the South? The output is a grid of decay-curve small-multiples, one per region, that reads as "how fast the market forgives."

## Problem

Superfund cleanups are a decades-long public expense, but whether they actually restore property value — the implicit promise — is under-visualized for the public. Existing work is either academic hedonic-pricing papers or single-site case studies. There is no clean cross-region "does the market forget, and how fast" artifact. The intellectual hook is strong; the *methodological* honesty is the whole game here (see Risks).

## How it works

Each Superfund site is centered; a 1-mile ring captures nearby ZIPs/tracts. For each site, compute the trailing 5-year delta in median home price and align sites by their cleanup/delisting milestone (t=0). Aggregate into per-region decay curves: x = years since milestone, y = price recovery relative to a baseline. Small-multiples grid, one panel per Census region, with the fitted decay/half-life annotated. Hover a curve to see contributing sites. PNG export of the grid.

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: Vite + TypeScript + Observable Plot / D3 for small-multiples; a Python (pandas + geopandas) build step for the spatial join and the diff-in-diff, output baked to JSON.

Data sources: **EPA Superfund** — the National Priorities List and SEMS/Superfund site data (site name, lat/lon, status, proposed/listed/deleted dates) via EPA's public site data downloads. **Zillow** research data (ZHVI median home value time series by ZIP) for the price signal. Join on the ZIPs whose centroids fall within the 1-mile ring of each site.

Data model: `site[id] = { latlon, milestone_dates, ring_zips[] }`; `price[zip] = monthly ZHVI series`; derived `recovery[site] = f(years_since_milestone)`.

Key algorithms: (1) spatial ring join (buffer each site 1mi, intersect ZCTA centroids); (2) event-time alignment on cleanup milestone; (3) **diff-in-diff** — this is mandatory, not optional. Superfund sites sit on already-cheap, non-randomly-selected land, so raw "prices recovered" is confounded. Each ring ZIP must be compared against a *matched* non-Superfund control ZIP (similar pre-period price level, region, urbanicity), and the estimate is the difference of the two differences (ring vs control, before vs after). Report the DiD estimate, not the raw ring trend.

The hard part: building a credible control-ZIP matching set — get this wrong and the whole thing is confounded noise dressed as a finding. This is genuinely a week of careful work, not a weekend.

## v1 scope (humiliatingly small)

- One region, ~10–20 sites with clear delisting dates.
- 1-mile ring join at ZIP granularity.
- A single DiD estimate against hand-matched control ZIPs, one decay curve.
- Static chart + PNG.

## Out of scope (for now)

- National coverage, animation, tract-level (vs ZIP) precision, rent data, demographic covariates, interactive site search.

## Risks & unknowns

- **Prior-art verdict: Exists.** A Pennsylvania ArcGIS StoryMap already shows home-value change by Superfund ring over time. This idea must be *re-angled* to survive — the only defensible novelty is the **cross-region decay-curve comparison + honest diff-in-diff**, not "prices near a Superfund site." Consider killing unless the DiD/multi-region cut feels genuinely new.
- The confounding trap (non-random siting) is the central risk; without matched controls the result is meaningless.
- Zillow ZIP coverage is thin in exactly the rural areas many sites sit in.

## Done means

- A per-region decay curve rendered from real EPA + Zillow data, with a computed half-life annotation.
- The estimate is a diff-in-diff vs documented matched control ZIPs — the matching method is written down and reproducible.
- Copy explicitly states the confounding caveat and the re-angle vs the existing PA StoryMap. PNG export works.
