## Overview
Yield to Scrap is a nightly job plus one dense page that treats every used accelerator as a fixed-income instrument. Acquisition price is the purchase, spot compute rental is the coupon, electricity is the negative carry, and the resale value curve is the pull-to-par toward scrap. It outputs an IRR per card and plots them as a yield curve. For homelab operators, ML hobbyists deciding buy-vs-rent, and small shops sizing a training box.

## Problem
"Should I buy a used 3090 or rent?" is answered today by forum vibes. The three inputs move independently — used prices spike on model launches, spot rental rates race to the bottom as capacity floods in, and power costs vary 4× by state — so the answer changes month to month and nobody tracks it. Meanwhile the mod scene (VRAM-doubled cards) creates instruments with no price history at all.

## How it works
Nightly:
1. **Price** — median asking price per model from eBay Browse API listings (stale-listing filter: drop items listed > 30 days), plus r/hardwareswap completed-trade parses and new-retail anchors.
2. **Coupon** — spot rental rates from the vast.ai offers API and RunPod's public pricing, taken as the 25th percentile of on-offer $/hr per GPU model (that's what you'd actually clear).
3. **Carry** — TDP × assumed utilization × $/kWh from the EIA state retail price series, or your own rate.
4. **Residual** — Theil–Sen regression on log(price) over 24 months of accumulated history gives a monthly decay rate; "months to half residual" becomes the duration analogue.
5. **Yield** — Newton solve for IRR on the monthly cashflow vector at a chosen utilization, then plot IRR vs duration. Fit a curve through it; cards above the fit are cheap, below it are rich. Report break-even utilization as a full curve rather than pretending to know one number.

The page also carries the ambient artifact: every night's curve is appended to a parquet file, and a year-end view animates the whole term structure sliding around launches and price crashes.

## Technical approach
Python + DuckDB over parquet, one nightly GitHub Action, static site rendered with Observable Plot. Data model: `listing(day, model, price, source)`, `offer(day, model, usd_per_hr, pctile)`, `card(model, tdp, vram, launch)`, `curve(day, model, irr, duration, breakeven_util)`. Hard part is sold-comp data: eBay's Marketplace Insights API is gated, so v1 uses active-listing medians and openly labels them as asks, not trades. Second hard part is that spot rental is not a forward curve — it's a commodity spot market with no term structure, so "yield" is a scenario, and the UI must show the scenario band instead of one number.

## v1 scope
- 8 GPU models, hardcoded electricity rate
- vast.ai offers only, eBay asks only
- One static yield/duration scatter + a break-even utilization table
- CSV/parquet output, no accounts, no alerts

## Out of scope
Brokering or renting anything, ASICs and CPUs, tax depreciation schedules, portfolio optimization, financing.

## Risks & unknowns
Scraping terms of service; asks overstate clearing prices by an unknown margin; a next-gen launch invalidates the depreciation fit overnight; modded cards have thin, manipulable listing data; failure/RMA risk is unmodeled and is arguably the real credit spread.

## Done means
The nightly job runs 30 consecutive days unattended and the page shows 8 cards on a yield-vs-duration scatter with a fitted curve, each with a break-even utilization number, plus a 30-day history chart of one card's IRR that visibly moves when its rental rate does.
