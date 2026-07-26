## Overview
Firm Price is a small B2B SaaS for the people who sell assembled hardware: MSPs, indie system integrators, AV installers, workstation builders, small NAS/server shops. You paste or upload a bill of materials, and it returns a *quote validity window* — "this price is firm for 11 days at 92% confidence" — plus a per-line volatility breakdown and ready-to-paste escalation-clause language.

## Problem
Storage and memory prices are in a violent AI-datacenter-driven squeeze. A shop quotes a 12-bay build on Monday, the client signs three weeks later, and the drives now cost 30% more. The integrator eats it or has an ugly conversation. Today the mitigation is folklore: "add 10% and hope." That over-prices stable lines (chassis, cables, PSUs) and under-prices the two SKUs actually moving. Nobody is selling per-BOM price risk to shops doing $2–20M/yr.

## How it works
1. Import a BOM: CSV, a PCPartPicker list URL, or a pasted quote (LLM-parsed into line items + qty).
2. Each line is matched to a *volatility class* — NAND/HDD, DRAM, GPU, commodity metal/plastic, licensed software — via SKU regex + a hand-curated category map.
3. For each class we hold a daily price index built from tracked reference SKUs.
4. Compute BOM-weighted forward risk: σ of log-returns per class over trailing 90d, correlated across classes, projected forward. Output the horizon *t* where P(cost increase > your stated margin) crosses 8%.
5. Deliverables: a validity date, a "repriced today" delta email if a signed-but-unbuilt quote drifts, and boilerplate escalation-clause text keyed to the volatile lines only.

## Technical approach
Rails or FastAPI + Postgres + TimescaleDB hypertable for `price_observation(sku, source, ts, cents, in_stock)`. Ingest: Keepa API for Amazon history (paid, legitimate), Newegg/B&H/ServerPartDeals public product JSON on a polite nightly crawl, PCPartPicker trend pages, plus TrendForce/DRAMeXchange headline spot prices scraped from their public press releases as a macro anchor. Index construction is a chained Laspeyres index per class with stockout-aware exclusion (an out-of-stock listing is not a price). Risk model: EWMA vol per class, Ledoit-Wolf shrunk correlation matrix, Monte Carlo the BOM total forward 60 days. The genuinely hard part is *matching* — an uploaded line reading "WD RED PRO 22TB (WD221KFGX)" must land on the tracked SKU; fuzzy match + LLM normalizer + a human-reviewed alias table that becomes the actual moat.

## v1 scope
- 40 hand-picked reference SKUs across 5 classes, nightly Keepa pull only
- CSV upload, no integrations
- One number out: days-firm at 8% risk, plus per-line contribution bar
- Stripe, $79/mo, five seats, no free tier

## Out of scope
Inventory, purchasing, invoicing, actual hedging instruments, non-US pricing, anything touching a distributor API that requires a reseller agreement.

## Risks & unknowns
Scraper fragility and ToS; Keepa costs scale with SKU count; integrators may just not believe a probability number; the squeeze could end and take the urgency with it. Validate by backtesting against 2025–26 HDD moves and showing a shop what their real 2026 quotes would have cost them.

## Done means
A real integrator uploads a live BOM, gets a days-firm number, pastes the escalation clause into a customer quote, and the tool later emails a drift alert that the shop acts on.
