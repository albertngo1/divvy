## Overview
Chock is a mobile-first app for owner-operator truckers and small carriers that automatically captures detention (dwell) time at shippers and receivers and generates an evidence-backed detention invoice. It's for the driver who knows they're owed money for waiting but never has the proof to collect it.

## Problem
Detention pay — typically $50–100/hr after two free hours — is contractually owed but rarely collected. Drivers don't log exact arrival and departure with proof, so when a broker's AP desk asks "prove it," there's nothing but a driver's word. Unbilled detention is one of the biggest silent margin leaks in small trucking.

## How it works
The driver taps "Arrived" (or the app auto-detects geofence entry using the load's stop address). It logs a GPS-verified arrival timestamp, starts a live dwell clock showing the free-time countdown, drops periodic location pings, and lets the driver snap door/BOL photos. On departure it computes billable detention minutes and generates a PDF invoice that cites the rate confirmation's detention terms and embeds a GPS timeline exhibit.

## Technical approach
React Native (Expo). Background geofencing via expo-location plus native geofence APIs (iOS CLCircularRegion, Android GeofencingClient) to auto start/stop without draining the battery. Load import: upload/photo the broker rate confirmation, run on-device OCR (Apple Vision / ML Kit) and regex+small-LLM extraction to pull stop addresses, appointment times, detention rate, and free-time. Geocode stops via Nominatim. Dwell events in local SQLite (WatermelonDB) synced to Supabase/Postgres. Invoice PDF via pdf-lib with an embedded static MapLibre/protomaps image of the ping trail. The hard part is reliable geofence entry/exit on real phones: OS throttling and warehouse GPS multipath cause false exits, so it needs dwell debouncing plus accelerometer stationary-detection to know the truck is parked in the yard, not leaving.

## v1 scope
- Single driver, manual "Arrived / Departed" taps
- One hardcoded rule: 2h free, $75/hr
- GPS + timestamp dwell log with periodic pings
- One-tap PDF invoice with a GPS timeline exhibit

## Out of scope
- Auto geofence entry/exit (comes after taps work)
- Multi-driver fleet management
- ELD/TMS integration
- Broker payment-portal submission and factoring

## Risks & unknowns
Geofence reliability on real hardware. Brokers can still deny even with evidence — the tool strengthens claims, it doesn't force payment. Detention-start nuance (appointment time vs. actual arrival) varies by contract. Continuous GPS raises battery and privacy concerns.

## Done means
From a real dropped pin at a stop, the app logs arrival, counts past the two free hours, and produces a PDF showing e.g. 47 billable minutes with a GPS timeline an AP clerk would accept.
