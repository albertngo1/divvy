## Overview
A subscription data service that predicts, 60–120 days ahead, which independent restaurants and bars in a metro are about to close — and tells you what's bolted to the floor when they do. Sold to restaurant-equipment dealers and auctioneers, retail tenant-rep brokers, franchise development scouts, and vendor churn teams (POS, linen, distributor reps).

## Problem
By the time a closure hits LoopNet, Eater, or a "thank you for 12 wonderful years" Instagram post, twelve buyers are already in line. The people who need lead time most — the guy who buys the $40k walk-in and hood system, the broker whose client wants that corner — are reading the same news as everyone else. Meanwhile the state has been publishing the tell for months, in a fixed-width text file nobody parses.

## How it works
Four signals, ordered by earliness:
1. **Alcohol license actions.** California ABC publishes a Daily Licensee Action Report; TABC and WA LCB publish equivalents. A license moving to *surrender pending*, *escrow*, or *transfer* is a sale-of-business in progress, months before keys change hands.
2. **Inspection cadence gaps.** County health departments inspect on a rhythm. A venue that misses its expected window (survival model on inter-inspection intervals) is often already shut.
3. **Business filings.** Secretary of State dissolution/suspension and franchise-tax delinquency.
4. **UCC-1 filings.** The mischievous one: UCC financing statements name the secured party *and the collateral* — "one (1) Turbo Air walk-in, two (2) Vulcan ranges" at a specific address. That converts a closure prediction into an asset manifest.

Output: a weekly CSV/email per metro — venue, address, risk score, days-to-dark estimate, driving signals, and known financed equipment. API tier for CRM ingestion.

## Technical approach
Python + Postgres/PostGIS, Prefect for scheduled scrapes, dbt for the signal marts. Ingest: ABC daily reports (fixed-width, parse with pandas), Socrata endpoints for DataSF/NYC DOHMH/LA County inspections, state SoS bulk files, UCC search portals (per-state; some bulk, some scraped politely with backoff).

Model: XGBoost AFT / `lifelines` accelerated-failure-time on time-to-closure, with Google Places `business_status: CLOSED_PERMANENTLY` as the retrospective label — backfilled monthly to avoid leakage. Features: signal recency, inspection score trajectory, license age, cuisine category, block-level density and turnover.

The genuinely hard part is entity resolution. "BLUE PLATE LLC" on the ABC file, "Blue Plate" at the health department, "1234 Mission St Suite B" in the UCC debtor field, and a Google Place ID are four different records. Plan: address normalization (libpostal) + Jaro-Winkler on normalized DBA + geocode within 40m, with a human review queue for anything below 0.9 confidence.

## v1 scope
- One county (San Francisco), restaurants and bars only
- ABC daily report + DataSF inspections only; no UCC yet
- Hand-verified list of 20 names, emailed Friday as a Google Sheet
- Ten free weeks to five equipment dealers; ask for $299/mo on week eleven

## Out of scope
- National coverage, self-serve signup, dashboards, mobile
- Predicting *openings*

## Risks & unknowns
- Precision matters more than recall; a wrong "closing soon" call is defamatory-adjacent, so ship signals-with-evidence, never verdicts
- UCC portals vary wildly by state and some ban scraping — check ToS per state
- Buyers may prefer a phone call to a CSV; the product might really be a broker

## Done means
Eight consecutive weeks of SF lists where ≥60% of flagged venues are confirmed closed or listed within 120 days, and one dealer has paid one invoice.
