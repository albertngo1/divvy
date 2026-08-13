## Overview

A subscription data service for small food importers, regional distributors, and independent grocers: a weekly ranked list of shelf-stable SKUs whose *depletion rate* has broken trend, with an estimated weeks-to-national-stockout. Sparked by the canned sardine squeeze — by the time a shortage is a news story, the pallet price has already tripled.

## Problem

A social-media-driven run on a shelf-stable category (sardines, tinned fish, a specific chili crisp, an electrolyte powder) plays out over 6–10 weeks. Big retailers see it in their own POS on day 3. A twelve-store independent chain or a two-person importer sees it when their distributor says "allocated." That gap is worth real money: buying six weeks early on a non-perishable is nearly risk-free inventory, and the same signal tells you when to *stop* buying before the crash.

## How it works

1. Nightly, poll store-level availability for a watchlist of ~3,000 shelf-stable SKUs across a geographically stratified panel of ~400 stores (a few hundred per retailer).
2. Per SKU, compute the fraction of panel stores in stock, and the transition rate (in→out per week). That transition rate is a proxy for shelf drain that nobody publishes.
3. Overlay attention velocity: Google Trends for the product term, Reddit/TikTok mention counts, and — the underrated one — a spike in *new* listings and price dispersion on eBay/Amazon third-party, which is arbitrageurs front-running you.
4. Fit weeks-to-stockout and email a Monday brief: 15 SKUs ranked, each with the in-stock curve, the attention curve, current case price from two wholesale sources, and a buy/hold/fade call.
5. Track every call publicly. The product is the track record.

## Technical approach

Python + Playwright for the store-availability panel (retailer store-locator/fulfillment endpoints return per-store availability for a SKU + ZIP; these are unauthenticated JSON in most cases), rotating residential egress, polite rates, and a per-retailer adapter so one breaking layout doesn't kill the panel. Postgres with a narrow fact table `(sku_id, store_id, ts, in_stock, price)` — roughly 1.2M rows/night, partitioned by week, plus daily rollups.

Core model: treat the panel in-stock fraction as a survival curve and fit a Weibull hazard per SKU; weeks-to-stockout is the time until in-stock fraction crosses 0.5. Baseline seasonality via STL decomposition on 12-month history so Thanksgiving cranberry sauce doesn't fire an alert. Attention series enters as an exogenous regressor with a lag search over 0–4 weeks.

Hard part: panel bias. Store availability endpoints mix "out of stock," "not carried here," and "delisted," and they lie during resets. Fix is to only count a store in the denominator once it has shown the SKU in stock at least twice in the trailing 90 days, and to drop stores whose whole-category in-stock fraction collapses at once (that's a reset, not demand).

## v1 scope

- One retailer, one category (canned/tinned fish), 200 SKUs, 150 stores
- Nightly scrape, plain Postgres, no ML — just the in-stock fraction curve and a slope threshold
- Google Trends only for attention
- A hand-written Monday email to 10 design-partner buyers

## Out of scope

Perishables, POS integration, purchasing/ordering, a web app, international.

## Risks & unknowns

Scraping durability and ToS friction (mitigate: small polite panel, no resale of raw availability, sell the derived signal). Whether the 6-week lead is real or whether distributor allocation bites earlier. Whether small buyers have the cash to act on a call at all — the first 10 conversations decide this.

## Done means

Six months of backtest on one category where the model's weeks-to-stockout call beats "it never goes out of stock" on Brier score, plus one live call that a design partner acted on and profited from, with the invoice to prove it.
