## Overview
Book Value is a public index and explorable chart tracking the secondary-market price of datacenter accelerators (H100, A100, L40S, MI300, older V100/3090 rigs). For anyone holding depreciating GPU inventory — neoclouds, liquidators, CFOs, resale flippers — it's the missing reference price and "melt rate."

## Problem
The HN thread "Nobody knows what a used GPU cluster is worth" is literally true: there's no blue book. Prices hide in Discord DMs, broker spreadsheets, and one-off eBay lots. Buyers overpay, sellers write down blind, and lenders can't collateralize. Meanwhile the assets depreciate faster than almost any capital equipment in history, and the curve itself — how fast value evaporates as the next generation ships — is undocumented.

## How it works
Book Value scrapes and normalizes public listings and sold-comps, then publishes a daily index per SKU: median ask, median sold, spread, listing volume, and a 30/90-day "melt rate" (annualized depreciation). The hero is an explorable chart: value-over-time curves per SKU on one canvas, with vertical markers for supply shocks (a new-gen launch, a hyperscaler dumping fleet). A "half-life" readout estimates how many months until a card hits 50% of launch MSRP. A forward view fits the historical melt curve to project a 6-month salvage value with an honest confidence band. Weekly "melt report" email.

## Technical approach
Stack: Python scrapers (eBay Browse API for sold-comps, plus curated broker/marketplace pages) → Postgres time-series (SKU, condition, price, source, timestamp) → a small FastAPI + a static D3/Observable Plot front end. Normalization is the core algorithm: map noisy listing titles to canonical SKUs (regex + a small fuzzy classifier), strip outliers with a robust median (MAD filter), and weight sold-comps over asks. Melt rate = rolling log-linear regression of median sold price vs time; half-life derived from its slope. Forward projection: simple exponential-decay fit with bootstrap CIs — deliberately humble. The genuinely hard part is thin, noisy data: some SKUs get a handful of comps a week, so the index needs shrinkage toward a category prior and clear "low-confidence" flags rather than fake precision.

## v1 scope
- eBay sold-comps ingest for 5 SKUs (H100, A100 80GB, L40S, 3090, V100)
- Postgres schema + nightly job computing median sold, spread, 30-day melt rate
- One explorable value-over-time chart + a per-SKU half-life number

## Out of scope
- Whole-cluster valuation (networking, power, real estate)
- Private broker feeds or a trading/escrow marketplace
- Real-time intraday pricing

## Risks & unknowns
- Sparse comps make some SKUs statistically weak
- Scraper ToS and rate limits; sold-comp availability
- Condition/warranty variance not captured by price alone

## Done means
For at least three SKUs the index shows a defensible median sold price within a stated confidence band, updates nightly without manual touch, and the chart renders each SKU's melt curve with a half-life figure that matches a hand-checked sample of recent sold listings.
