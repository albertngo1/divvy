## Overview
Mobile + web tool for owner-operators and small trucking fleets (1–20 trucks) that automates IFTA (International Fuel Tax Agreement) quarterly reporting by turning a GPS breadcrumb trail into per-jurisdiction miles and reconciling fuel receipts.

## Problem
IFTA requires interstate truckers to report miles driven and fuel purchased in every state/province each quarter, then settle tax on the gap between where fuel was burned and where it was bought. Small operators do this by hand: paper trip sheets, spreadsheets, guessing state-line crossings, hoarding fuel receipts. It's error-prone and audit-bait; a bad audit means back taxes and penalties that can dwarf a month's revenue.

## How it works
The driver runs a background GPS logger (phone app, or plugged into an existing ELD). The app records breadcrumbs, snaps them to a road network, and computes miles per jurisdiction using state boundary polygons. Fuel purchases are captured by photographing receipts (OCR) or importing a fuel-card CSV. At quarter end it produces the IFTA-ready table: taxable miles per state, gallons per state, fleet MPG, and net tax owed per jurisdiction using the current quarter's rate matrix — exportable as CSV or the state form layout.

## Technical approach
- Stack: React Native app with background location; Postgres/PostGIS backend, or a fully-local SQLite build for privacy-conscious operators.
- Boundary data: US Census TIGER/Line state polygons + Statistics Canada provinces. Point-in-polygon via PostGIS `ST_Contains`; for crossings, intersect the trip `LineString` with boundaries and `ST_Split` to cut mileage at the exact state line.
- Map-matching: snap noisy GPS to roads via Valhalla/OSRM to avoid overcounting; fall back to haversine between fixes when offline.
- Tax rates: the IFTA quarterly rate matrix (re-published each quarter) loaded as a versioned JSON table.
- Fuel receipts: on-device OCR (Vision/MLKit) → parse gallons, state, unit price.
- Hard part: accurate state-line mileage split from sparse/noisy GPS, and keeping the quarterly rate table + per-state form quirks current.

## v1 scope
- Background GPS logging with per-trip start/stop
- PostGIS state-line mileage split for the lower-48
- Manual fuel entry (state, gallons, price)
- One quarter's IFTA summary table exported as CSV

## Out of scope
- Actual e-filing integration with state portals
- ELD hardware certification and HOS (hours-of-service) logs
- Canada/Mexico jurisdictions and IRP registration

## Risks & unknowns
- GPS gaps (tunnels, dead battery) create mileage holes auditors dislike — need interpolation + flagging
- Map-matching cost/complexity and battery drain
- Legal posture: it's decision-support, not a filing service — clear disclaimer required

## Done means
Load a week of real GPS logs crossing 3 states plus matching fuel receipts, and the app outputs a per-state mileage/gallons/tax table that matches a careful hand computation within 2%.
