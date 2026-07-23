## Overview
Residual is a pricing-intelligence SaaS that appraises used AI compute — GPUs, DGX/HGX nodes, whole racks — and publishes a daily index of what they're actually worth. It's the Kelley Blue Book / Manheim of the AI hardware secondary market, sold to the people who move real money against these assets: resellers, lessors, insurers, and GPU-collateralized lenders.

## Problem
The HN thread 'Nobody knows what a used GPU cluster is worth' is literally true. A400s and H100s are rolling off 2-year leases into a thin, opaque secondary market. Lessors need to book residual values, lenders financing GPU purchases need to mark collateral, insurers need replacement values, and resellers are guessing. There is no Bloomberg-terminal equivalent — pricing lives in Discord DMs and one-off broker quotes. Bad marks mean mispriced loans and stranded inventory.

## How it works
You describe an asset (model, VRAM, interconnect, hours, PSU/thermal condition, region, quantity) and Residual returns a valuation with a confidence band, a 24-month depreciation forecast, and comparable recent sales. A dashboard tracks index levels per SKU over time; an API lets a lender re-mark a portfolio nightly. Alerts fire when a SKU's index drops past a covenant threshold.

## Technical approach
Stack: Python + DuckDB for the comp warehouse, Postgres for accounts, a small FastAPI service, and a scheduled scraper fleet. Data sources: eBay/Bidfax completed-listings API for sold comps, broker RFQ feeds where we can license them, cloud spot prices (AWS/Lambda/RunPod) as a rental-yield floor (an asset is worth at least its discounted rental cashflow), MLPerf/published throughput for a $/token-throughput normalizer, and hyperscaler lease-retirement calendars to model supply shocks. Core model: a hedonic regression (SKU dummies + condition + quantity + time) blended with a discounted-cashflow floor from spot rental yields; quantify uncertainty with quantile regression so we ship a band, not a false-precision point. The hard part is comp scarcity and adverse selection — sold listings skew toward distressed sellers, so we correct with a Heckman-style selection term and lean on the rental floor when comps are thin.

## v1 scope
- Three SKUs only: A100 80GB, H100 SXM, L40S
- Manual weekly comp ingestion from eBay sold + one broker sheet
- Single valuation endpoint + a static index chart
- Email digest: 'this week's marks'

## Out of scope
- Full portfolio mark-to-market API
- Whole-rack / networking gear valuation
- An actual marketplace / matching buyers to sellers

## Risks & unknowns
Comp volume may be too thin for statistical significance; brokers may not license data; the market could crater faster than any model tracks (bubble risk cuts both ways). Legal exposure if a lender relies on a bad mark — needs 'indicative, not an appraisal' disclaimers.

## Done means
Given 20 held-out real sales, Residual's band contains the true price ≥80% of the time and the point estimate beats a naive 'linear depreciation from MSRP' baseline on MAPE.
