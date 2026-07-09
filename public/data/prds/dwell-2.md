## Overview
Dwell is a phone app for owner-operator truckers and small carriers that automatically documents *detention time* — the unpaid hours drivers spend waiting at shipper/receiver docks — and generates a defensible billing packet. Detention pay is contractually owed after a free window (usually 2 hours) but is chronically underclaimed because proving it is manual and adversarial.

## Problem
A driver arrives, checks in, then waits 4 hours to get unloaded. To bill detention they need proof of arrival time, departure time, and the appointment window — currently scribbled on paper, screenshotted from a gate app, or lost entirely. Brokers dispute anything undocumented. Billions in detention go unclaimed yearly because the evidence is a hassle to assemble.

## How it works
Before a load, the driver saves a stop (address + appointment time). Dwell geofences the facility. When the phone enters the polygon it stamps `arrived_at`; when it leaves, `departed_at`. On the way out it computes billable detention (dwell − free window), prompts for a lumper receipt / BOL photo, and produces a one-tap PDF: map with entry/exit pins, timeline, appointment vs actual, total hours × the contracted detention rate. Driver texts/emails it to dispatch or the broker.

## Technical approach
Stack: React Native (Expo) + a thin Supabase backend. Geofencing via `expo-location` background regions; facility polygons resolved from Google Places / OSM building footprints, with a manual "drop pin + radius" fallback since docks are often unlabeled. Data model: `Stop(address, appt_at, free_window_min, rate)`, `DwellEvent(stop_id, arrived_at, departed_at, entry_track, exit_track)`, `Evidence(photo_urls, bol_ref)`. Dwell math is trivial; the hard parts are (1) reliable background geofence dwell detection without murdering battery — solved with coarse region monitoring + a significant-location wake, tightening to GPS only near the fence — and (2) polygon accuracy for giant warehouse complexes where the gate and the dock are 400m apart, handled by letting drivers correct the fence once and caching per-facility.

## v1 scope
- Add a stop, auto-geofence, capture arrive/depart
- Detention math against a per-load free window + rate
- PDF evidence packet with map + timeline
- Local-only, single driver, no fleet

## Out of scope
- ELD/TMS integration
- Broker portal / dispute workflow
- Multi-driver fleet dashboards
- Automated invoicing to accounting

## Risks & unknowns
- Background location reliability across iOS/Android battery optimizers
- Facility polygons wrong by default → user friction on first visit
- Legal weight of phone GPS as evidence vs ELD data
- Is a standalone app worth it vs a TMS feature?

## Done means
Drive into a mapped facility, wait past the free window, drive out — app auto-produces a PDF showing correct arrive/depart timestamps and a nonzero billable detention amount, no manual timing entered.
