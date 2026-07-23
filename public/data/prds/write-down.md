## Overview
Write-Down is a pricing index and appraisal API for used datacenter accelerators (H100/H200/A100/L40S/MI300, plus DGX/HGX nodes and full pods). It answers one question the whole AI-hardware secondary market currently guesses at: *what is this GPU actually worth today?* Buyers are lenders financing GPU purchases, insurers, liquidators winding down failed AI startups, resellers, and CFOs booking depreciation.

## Problem
The HN thread 'Nobody knows what a used GPU cluster is worth' is literally true. There is no Kelley Blue Book for accelerators. A lender underwriting a $40M GPU-backed loan, an insurer writing a policy, or a bankruptcy trustee auctioning a dead lab's cluster all need a defensible number and have nothing but vibes and a broker's self-interested quote. Depreciation is brutal and non-linear (new-gen launches crater last-gen), so stale numbers are dangerous.

## How it works
We scrape and normalize every observable transaction: eBay/ServerMonkey/broker sold listings, liquidation auction results (GovDeals, bankruptcy dockets), cloud spot-price floors as a rental-yield proxy, and hyperscaler retirement schedules. Each data point is normalized to a canonical SKU + condition + firmware/NVLink topology. A hedonic regression + gaussian-process time model produces a fair-market value with a confidence band and a forward depreciation curve. Users hit a web form or API: enter SKU, quantity, condition, location → get value, comps, and a stamped one-page PDF appraisal.

## Technical approach
Stack: Postgres + TimescaleDB for the transaction time-series, Python (scikit-learn/statsmodels) for the hedonic model, Playwright scrapers on a nightly cron, FastAPI for the API. Data model: `sku`, `observation(sku_id, price, date, source, condition, qty, provenance_url)`, `valuation(sku_id, date, fmv, ci_low, ci_high)`. Core algorithm: hedonic price regression with SKU + condition + age fixed effects, feeding a GP that interpolates thin/noisy comp data across time and produces the forward curve; cloud rental yields anchor the model when sale comps are sparse. The genuinely hard part is comp scarcity and adverse selection — the observable sales are the desperate ones — so we weight by provenance quality and cross-check against rental-yield-implied value.

## v1 scope
- 8 SKUs only (H100 SXM/PCIe, A100 80/40, L40S, H200, MI300X, DGX H100 node)
- Nightly scrape of 3 sources + manual comp entry form
- Web lookup + PDF appraisal export
- Simple confidence band, no forward curve yet

## Out of scope
- Actual marketplace/escrow (index first, transact later)
- Networking gear, storage, whole-datacenter valuation
- Real-time streaming prices

## Risks & unknowns
- Comp volume may be too thin for statistical credibility in some SKUs
- Brokers may see us as a threat and gate listings
- A GB200 launch could invalidate curves overnight (feature, if we capture the drop)
- Legal: appraisals used in lending/bankruptcy carry liability — v1 ships 'informational, not a certified appraisal'

## Done means
Given a real recent cluster sale not in the training set, Write-Down's predicted FMV lands within ±15% of the actual clearing price, and the PDF appraisal cites at least three dated comps supporting the number.
