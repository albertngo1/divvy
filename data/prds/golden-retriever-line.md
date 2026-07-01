## Overview

The suburban ring, decoded by dog. Divvy hypothesizes a concentric breed gradient radiating out from a city center: French Bulldogs and other apartment breeds dominate the dense core, Labradors and outdoorsy breeds dominate the exurban fringe, and Golden Retrievers own the middle donut — the classic single-family, quarter-acre-lot suburb. The artifact is a concentric-ring heatmap keyed to lot size, showing which breed "wins" each ring. One glance, one thesis, quote-tweetable by every urbanist on the timeline.

## Problem

"You can tell a neighborhood by its dogs" is a universal intuition with no data artifact behind it. Breed-by-geography visualizations exist but are framed as income correlations or flat choropleths — nobody has organized it as a *radial gradient tied to lot size*, which is the actual mechanism (breed choice tracks housing density more cleanly than income). It's low generative depth (essentially one great viz, not a tool) but extremely high share-propensity in the urbanism crowd.

## How it works

Pick a metro. Bin its ZIP codes into concentric distance rings from the urban centroid, but weight/order the rings by *median lot size* (the real independent variable). For each ring, compute the dominant / over-indexed breed and render it as a color band; a small-multiple lets you flip between metros. Hovering a ring shows the top-5 breed mix and the median lot size. The headline artifact is a single stylized concentric-ring diagram per metro ("the golden-retriever line") suitable for PNG sharing.

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: Vite + TypeScript + D3 for the radial/concentric rendering; static site, all aggregation pre-baked.

Data sources: **AKC** breed registration data — AKC publishes breed popularity by metro/region (national and city-level rankings); where fine-grained ZIP data isn't public, fall back to metro-level breed rank as the breed signal. **USPS** ZIP code data (ZCTA centroids from Census) for the geographic key and ring assignment. **Zillow** — ZHVI / lot-size data by ZIP (Zillow research CSVs) to derive median lot size per ZIP, the variable the rings are ordered on.

Data model: `zip[zcta] = { centroid, dist_to_core, median_lot_size, breed_rank[] }`; then `ring[k] = { lot_size_band, dominant_breed, breed_mix[] }`.

Key algorithm: (1) compute each ZIP's distance to the metro centroid; (2) bin ZIPs by lot-size quantile into rings; (3) per ring, find the over-indexed breed (breed share in ring ÷ national share) to surface *characteristic* breeds, not just the globally-popular Lab everywhere.

The hard part: AKC breed data granularity — true ZIP-level registration counts may not be public, so the honest v1 uses metro-level breed rank joined to lot-size rings, and the "gradient" is an inference to validate, not assume.

## v1 scope (humiliatingly small)

- One metro (pick one with a clean core→exurb gradient).
- Rings from Zillow lot-size quantiles + Census ZCTA centroids.
- Breed signal from best-available AKC granularity (metro rank acceptable).
- Static concentric-ring diagram + PNG export.

## Out of scope (for now)

- Multi-metro small-multiples, animation, income overlays, non-AKC/mixed-breed data, live address lookup, statistical significance testing of the gradient.

## Risks & unknowns

- **Prior-art verdict: Partial.** Breed-by-neighborhood viz exists as income correlation, not a concentric-ring / lot-size gradient — the radial-by-lot-size framing is the un-mined move.
- Biggest risk: AKC ZIP-level data may not exist publicly; the gradient could be weaker than the intuition once real lot sizes replace vibes.
- Zillow lot-size coverage is uneven across ZIPs.
- Registration ≠ ownership (AKC skews purebred/registered).

## Done means

- Static page renders one metro's concentric lot-size rings with a real dominant/over-indexed breed per ring from AKC + Zillow + Census data.
- The gradient is either visible (ship it) or measured-and-flat (report honestly in copy).
- Hover shows breed mix + median lot size; PNG export works.
