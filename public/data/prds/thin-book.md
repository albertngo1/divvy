## Overview
A local dashboard that treats your closet, shelf, or long box as an illiquid portfolio and applies market microstructure to it. Instead of "your collection is worth $14,200," it answers the question that actually matters: *if I needed the money in 30 days, what would I get?* For collectors, resellers, and anyone whose net worth is quietly stored in objects.

## Problem
Every collection tracker sums the median sold comp and calls it value. That number is fiction three times over: it ignores marketplace fees and shipping, it ignores that half your items trade twice a month, and it ignores that dumping eight copies of the same item into a market that absorbs two per week tanks the price. Collectors routinely believe in a valuation they could never realize.

## How it works
Import inventory (CSV, or barcode scan via the phone camera). Each SKU is matched to a comps stream and fitted to a small microstructure model. The main view is a **liquidation waterfall**: items sorted most-liquid first, x-axis days, y-axis cumulative cash. The gap between the flat "sum of medians" line and your waterfall is the number nobody shows you. Side panels flag *thin book* positions — items where your quantity exceeds several days of market volume — and *stale marks*, where the last real trade was 200 days ago and the "price" is an unmet ask.

## Technical approach
Python + DuckDB for the comps store, small React/Vite front end, everything on localhost. Data sources: PriceCharting API (games, sealed, graded cards), Discogs API (which exposes real sale history, not just listings), Scryfall + TCGplayer for MTG, eBay Browse API for live asks, and eBay Marketplace Insights for 90-day solds where access is granted — with a fallback path of importing your own eBay sold-history CSV.

Per SKU: sold events `(t, price, condition)` → Theil–Sen regression on log price vs time for a robust drift and dispersion σ. `ADV` = sold count / 90 days. **Time-to-sell uses Kaplan–Meier survival estimation**, with currently-active listings entered as right-censored observations — this is the piece everyone gets wrong, because sold-only feeds are survivorship-biased and make everything look fast. Market impact from the square-root law: `impact = k·σ·sqrt(Q/ADV)`. Realizable price = `P · (1 − fee_rate) − shipping − impact`, with fee rates per marketplace.

Hard part: comp matching. "Loose vs CIB vs sealed vs graded 9.2" can swing price 5×, and titles are free text. Plan is deterministic ID matching where available (UPC, Discogs release ID, Scryfall UUID) and an embedding + rules fallback for the rest, with a manual confirm queue — never silently guess a variant.

## v1 scope
- CSV import, 20–30 items, PriceCharting only.
- Fees hardcoded to eBay standard + flat shipping.
- One waterfall chart and one flagged-positions table.
- No survival model in v1: time-to-sell = quantity / ADV.

## Out of scope
Auto-listing or selling, tax lots and cost basis, insurance appraisal export, multi-user or cloud sync.

## Risks & unknowns
API gating and ToS on sold-comp data is the main blocker; the CSV fallback must be genuinely usable. Rare items have too few trades for any model — those must render as "no book," not a fake number.

## Done means
Import 25 real items you own, and the app produces a waterfall showing 30-day liquidation value materially below the sum-of-medians (with the fee/impact split itemized), plus at least one position correctly flagged as exceeding five days of market volume.
