## Overview
Rack Rate is a used-GPU pricing index — a Kelley Blue Book for datacenter accelerators and homelab hardware. For AI startups liquidating training rigs, brokers, r/homelabsales flippers, and buyers who have no idea whether a $9k H100 SXM is a steal or a scam.

## Problem
The HN thread 'Nobody knows what a used GPU cluster is worth' nails it: this is a thin, opaque, high-dollar market with no reference price. Sellers post wishful numbers, buyers overpay or ghost, and there's no depreciation curve for an H100 the way there is for a Civic. The data to price it *exists* — it's just scattered across eBay sold listings, subreddit sale threads, and liquidation surplus sites.

## How it works
Aggregate sold-price signals per canonical SKU, produce a recency-weighted median 'fair range,' a 90-day trend sparkline, and days-on-market. A cluster estimator lets you stack nodes (GPU count, interconnect, chassis/PSU) into a rough total. Each SKU page: fair range, trend, sample size, and the underlying comps.

## Technical approach
Python scrapers + eBay Browse/Finding API for completed/sold listings (the LabGopher trick), Reddit API for r/homelab & r/homelabsales, and a few liquidation surplus sites (UnixSurplus, TheServerStore). Postgres `listing(source, raw_title, sku_id, price, condition, sold_ts)`. The genuinely hard part is entity resolution: mapping messy free-text titles ('LOT OF 4 nVIDIA A100 80G SXM4 tested pull') to canonical SKUs — regex + fuzzy match + a small LLM classifier for the ambiguous 10%. Pricing = EWMA of median with MAD-based outlier rejection to kill scam listings and parts-only lots. Static Next.js frontend reading a nightly-built JSON.

## v1 scope
- 10 hot SKUs (H100 SXM/PCIe, A100 40/80, 4090, 3090, L40S...)
- eBay sold comps only, weekly refresh
- One price-range + sparkline page per SKU
- Manual SKU→title mapping rules to start

## Out of scope
- Real-time price alerts
- Full cluster BOM valuation with networking gear
- Non-GPU server parts

## Risks & unknowns
eBay API terms and sold-comp access limits; exotic SKUs have too few comps for a stable median; scam/parts listings poison the data if outlier rejection is weak.

## Done means
Loading the 'A100 80GB PCIe' page shows a fair-price range and 90-day trend computed from ≥20 real sold comps, auto-refreshed weekly, with the comps viewable underneath.
