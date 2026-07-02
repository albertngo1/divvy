## Overview
A phone app for owner-operators and small carriers that automatically detects, times, and documents **detention** (and demurrage) — the hours a driver is forced to wait at a shipper or receiver's dock beyond the free window. It turns unpaid waiting into invoiceable, evidence-backed line items. For drivers who currently eat that cost.

## Problem
Detention is one of trucking's biggest silent revenue leaks. Free time is typically 2 hours; after that carriers can bill $50–$100/hour — but only if they can *prove* arrival and departure times. Drivers track this on paper napkins or not at all, forget to start a timer, and dispatch has no clean record, so the claim gets denied or never filed. The proof is the product.

## How it works
1. Driver assigns a load (or the app reads it from an ELD/TMS).
2. Background geofencing detects entry into a facility's polygon → auto-starts the detention clock at the free-time boundary.
3. On exit, it stops; the app assembles an evidence packet: arrival/departure timestamps, GPS breadcrumb, dwell duration, facility name, and optional check-in photo/BOL scan.
4. It computes billable detention against the load's agreed free time and rate, and generates a ready-to-send invoice line + PDF proof.
5. A dashboard tallies recovered detention $ per facility, surfacing the worst docks.

## Technical approach
Expo/React Native with native geofencing (iOS CLRegion / Android Geofencing API) plus low-power significant-location changes for battery. Facility polygons from OpenStreetMap `landuse=industrial`/warehouse tags seeded, then refined by clustering real dwell events. Backend: Supabase (Postgres + storage for BOL/photos). Data model: `loads`, `stops(facility_id, arrive_ts, depart_ts, free_min, rate)`, `detention_events`, `evidence_files`. Invoice PDF via a serverless template. The genuinely hard part is reliable, battery-friendly geofence enter/exit on real routes (rest stops near docks, GPS drift in metal buildings) without false triggers, and mapping messy real facilities to clean polygons.

## v1 scope
- Manual 'I'm here' / 'I'm leaving' tap with auto-timestamp + GPS (geofence auto-detect as stretch)
- One free-time + rate per load
- Evidence PDF export (times + map + one photo)
- Per-facility detention totals

## Out of scope
- ELD/TMS integrations
- Automated invoice *submission* to brokers
- Multi-driver fleet roles/permissions

## Risks & unknowns
- Background location reliability and battery drain across Android OEMs
- Whether brokers accept app-generated proof vs signed lumper receipts
- Facility polygon accuracy for auto-detection

## Done means
A driver completes a wait at a dock and, without manual math, exports a PDF showing correct arrival/departure timestamps, a map trail, and a computed billable detention amount against the load's free time — an artifact a broker would honor.
