## Overview
Demurrage is a phone app for owner-operator truckers and small carriers that automatically documents time spent waiting at shipper/receiver facilities and generates a defensible detention (a.k.a. demurrage) invoice. It targets the driver who currently eats hours of unpaid waiting because proving it is a paperwork nightmare.

## Problem
Freight contracts give shippers 1–2 hours of free loading/unloading time; beyond that, carriers are owed detention (often $50–100/hr). But claiming it requires proof of arrival and departure times, and drivers currently rely on hand-scrawled logs or texts that brokers routinely dispute. Billions in detention goes uncollected because the evidence is weak and assembling the claim is tedious.

## How it works
The driver adds a stop (or imports it from a rate confirmation). When the phone enters a geofence around the facility, the app timestamps arrival; when it exits, departure. It computes dwell time, subtracts contractual free time, and produces a PDF claim packet: a map with entry/exit pins, a timeline, GPS breadcrumbs, and the dollar amount owed. One tap emails it to the broker with the rate-confirmation number attached.

## Technical approach
Stack: React Native (Expo) + a thin Supabase/Postgres backend. Geofencing via `expo-location` background geofence regions; facility polygons stored in PostGIS. Rate confirmations are parsed with an on-device OCR pass (VisionKit / ML Kit) feeding a small regex+LLM extractor to pull facility address, appointment time, and load number. Data model: `stops(id, facility_geom, free_minutes, appt_ts)`, `dwell_events(stop_id, in_ts, out_ts, breadcrumbs jsonb)`, `claims(dwell_id, amount, pdf_url, status)`. PDF via a serverless `pdf-lib` function; map tile snapshot from a static Mapbox render. The genuinely hard part is trustworthy timestamps: background geofencing on iOS is throttled and battery-managed, so we cross-check with periodic significant-location breadcrumbs and flag any claim whose evidence is thin rather than fabricating precision.

## v1 scope
- Manually add one stop with an address + free-time minutes
- Auto-detect arrival/departure via geofence
- Generate a one-page PDF claim with map + timeline + dollar amount
- Email the PDF from the app

## Out of scope
- ELD/telematics integration, TMS sync, factoring
- Automatic broker acceptance or payment rails
- Multi-driver fleet dashboards

## Risks & unknowns
- iOS background location reliability; users may kill the app
- Legal weight of phone GPS in a dispute vs. yard camera logs
- Getting drivers to trust and adopt yet another app
- Detention terms vary wildly by contract; free-time defaults may mislead

## Done means
A driver drives into a test geofence, waits, drives out, and the app produces a correct PDF showing accurate in/out times and a dwell-minus-free-time dollar figure, emailable in under three taps.
