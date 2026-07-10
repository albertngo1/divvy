## Overview
Green Tag is a mobile app for the people who walk a building tapping every fire extinguisher, exit light, and sprinkler riser once a month. It replaces the paper inspection tag and the shoebox of forms with an NFC/QR sticker per device and an auto-generated, timestamped compliance packet. For: small fire-protection contractors, facility managers, church/school/gym maintenance staff.

## Problem
NFPA 10 requires a documented monthly visual inspection of every portable fire extinguisher, plus annual service. Today the tech initials a paper tag hanging on the unit and, if lucky, transcribes it into a binder. Auditors and insurers want proof; the paper is illegible, lost, or backdated. A contractor servicing 40 buildings has no live view of what's overdue, and produces reports by hand.

## How it works
On setup, the tech sticks a cheap NFC tag on each device and scans it to register (type, location, model, last hydro date). Each monthly round: tap phone to tag → app opens that device's checklist (pin/seal intact, gauge in green, no corrosion, access clear) → tap pass/fail, optional photo → next. Fails raise a ticket. At round's end the app emits a PDF report per building with GPS-stamped, time-stamped entries and a coverage summary (38/40 inspected, 2 overdue). All offline; syncs when back on wifi.

## Technical approach
React Native + expo-nfc / camera QR fallback. Local store: SQLite (WatermelonDB) so a basement with no signal still works; sync to a Postgres backend (Supabase) with row-level security per contractor. Data model: `sites → devices → inspections (checklist_json, result, photos[], ts, geo)`. Report generation client-side via a PDF lib from a Handlebars template; server keeps the audit trail immutable (append-only, hash-chained rows so a backdate is detectable). Checklist templates are versioned JSON per device class (extinguisher, exit sign, backflow, e-light) so new categories are config, not code. Hard part: making a 40-tap round genuinely faster than a pen — NFC tap-to-open must be sub-second and the checklist one-thumb.

## v1 scope
- Fire extinguishers only, one checklist template
- QR stickers (skip NFC hardware for v1)
- Offline round + per-building PDF export
- Simple overdue list on a home screen

## Out of scope
- Multi-tech scheduling / dispatch
- Direct fire-marshal / AHJ submission integrations
- Barcode inventory of extinguisher refills
- Billing

## Risks & unknowns
- Will contractors trust a phone over a physical tag some jurisdictions still require? (Answer: keep the paper tag, add the digital record.)
- Sticker durability in mechanical rooms / outdoors
- Sales motion into a low-tech, relationship-driven trade

## Done means
A tech registers 20 extinguishers in a building, completes a monthly round fully offline in under 6 minutes, and exports a PDF whose entries an auditor accepts — with a tampered timestamp detectable by the hash chain in a test.
