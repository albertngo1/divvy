## Overview
A per-site subscription for mid-size commercial facilities with throttleable load — refrigerated warehouses, ice rinks, indoor ag, car washes, EV charging depots, municipal water pumping. It quantifies what their flexibility is worth in demand-response programs, quantifies the penalty exposure honestly, and produces the enrollment packet. Buyers are facility managers and the CFO who signs the utility bill; the second buyer is the curtailment service provider who wants qualified leads.

## Problem
Demand response pays real money and almost nobody under 5 MW can find out how much. Program rules live in 90-page tariff PDFs. Baselines are arcane — "high 4 of 5 with symmetric additive day-of adjustment" is a sentence that ends most conversations. Aggregators do the math for free, but only for loads big enough to be worth a truck roll, so a 400 kW warehouse gets ignored or signed into a program whose penalty structure it doesn't understand. Meanwhile PJM capacity auctions have cleared at records two years running and utilities are scrambling for dispatchable load ahead of data-center growth. The money is there this year and the small operator has no way to price it.

## How it works
Upload 15-minute interval data pulled from the utility portal, plus zip code and a short equipment questionnaire. The engine (1) identifies flexible blocks — compressor cycling amplitude, defrost windows, precool headroom; (2) computes the customer baseline load per the *actual* method the target program uses, not a generic average; (3) replays the last three years of that ISO's real event and price history against the site's metered load minus a modeled shed; (4) settles each simulated event under the program's own formula. Output is a dollar range with a confidence band, an explicit underperformance-penalty scenario, and a shortlist of two or three CSPs operating in that zone.

## Technical approach
Next.js + Postgres with TimescaleDB for interval series. Ingest: Green Button ESPI Atom XML parser plus plain CSV; UtilityAPI as a paid fallback where portals are hostile. Market data: PJM Data Miner 2 API for emergency/economic event history and capacity clears, ERCOT MIS, CAISO OASIS, EIA-930 for regional load shape. Program rules are hand-encoded into a versioned YAML DSL — season, notification lead time, min/max event hours, baseline method enum, $/kW-yr, penalty formula — so a tariff revision is a data change, not a code change. The baseline engine implements the enum: HighXofY with symmetric additive adjustment, matching-day, and regression-based.

The hard part is honestly two things. First, inferring shed capability from a single revenue meter without submetering: separating the compressor's duty cycle from lighting, dock doors and office load is a one-dimensional disaggregation problem, attacked with median filtering plus edge detection on the load series to recover cycling amplitude and period. Second, keeping the YAML current as tariffs move — that maintenance burden is exactly why this is a service and not a weekend script, and it is the moat.

Pricing: $149–299/mo per site, or a $1,500 one-time assessment that converts into a referral rev-share (10–20% of year-one payments) with the aggregator.

## v1 scope
- One ISO (PJM), one program (Emergency Load Response — Capacity).
- CSV upload only, no OAuth utility linking.
- One hand-written program YAML.
- One output: a PDF report with the dollar range and the penalty scenario.

## Out of scope
Real-time dispatch or telemetry. Controls/BMS integration. Becoming the aggregator ourselves. Batteries and on-site generation. Anything residential.

## Risks & unknowns
Aggregators may treat us as a lead-gen tax and replicate the model, or refuse referrals. Utility interval-data access is uneven state to state. Single-meter disaggregation may be too noisy for HVAC-dominant sites, in which case v2 ships a $50 clamp meter and a two-week logging period.

## Done means
Feed one real refrigerated-warehouse site a full year of 15-minute data and produce a report whose estimated annual payment lands within 20% of what that site's actual aggregator settlement statement paid for the same period.
