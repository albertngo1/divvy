## Overview
A phone-first refrigerant ledger for commercial HVAC/R contractors. Every cylinder-to-system transfer gets logged at the unit, and the app maintains the trailing-12-month leak rate for each appliance, fires the repair clock when a regulatory threshold is crossed, and emits the paperwork. Buyers: 5–150 tech mechanical contractors, supermarket refrigeration groups, and their compliance manager who currently owns a shared spreadsheet.

## Problem
EPA 608 §82.157 and the AIM Act leak-repair rules require, for any appliance holding ≥50 lb of refrigerant, that you calculate a leak rate on every addition, repair within 30 days if it exceeds 20% (comfort cooling) / 30% (commercial refrigeration) / 35% (industrial process), then perform initial and follow-up verification tests, and retain records 3 years. California CARB's Refrigerant Management Program layers on annual reporting. In practice this is carbon-copy service tickets in a truck door pocket, transcribed months later by someone reconstructing what happened. Contractors get fined for the recordkeeping, not the leak. Worse, nobody can tell a customer what their leaky unit actually cost — so the "top it off again" cycle runs for years.

## How it works
1. Tech scans the QR sticker on the unit (or photographs the nameplate on first visit — OCR pulls model, serial, refrigerant type, factory charge).
2. Tech scans the cylinder barcode and enters pounds added — or pairs a BLE charging scale and lets it read the delta.
3. App computes leak rate = (adds in trailing 365 days ÷ nameplate full charge) × 100 using EPA's rolling-average method, shows it on-screen in red or green before the tech leaves the roof.
4. Threshold crossed → a repair task with a 30-day due date, a required initial verification test, a follow-up test, and calendar reminders that escalate to the compliance manager.
5. Owner-facing PDF: pounds lost, dollars of refrigerant, and a repair-vs-replace line — the contractor's best replacement-sales tool.

## Technical approach
Expo/React Native + Postgres. Data model is an append-only event log: `appliance(site, nameplate_charge_lb, refrigerant, threshold_class)`, `event(id uuid, appliance_id, kind add|recover|repair|verify, lbs numeric, cylinder_id, tech_id, occurred_at, photo_key)`. Leak rate is a window function over events, never a stored field. Offline-first is mandatory — mechanical rooms and freezer aisles have no signal — so events are client-generated UUIDs queued in SQLite and merged idempotently; last-write-wins per event id, no merge conflicts because events are immutable. Nameplate OCR via Vision framework + a per-manufacturer regex pack. Cylinder mass balance (bought − added − returned) catches unlogged work. Hard part: appliance identity resolution — three techs, two subcontractors, and a re-roof later, is this the same RTU? Solve with sticker QR as primary key plus a fuzzy match on (site, serial, tonnage) for pre-sticker history.

## v1 scope
- One contractor, one site list, web + phone camera only
- Manual pounds entry (no BLE scale)
- Leak-rate math for one threshold class (20%)
- One PDF: the EPA-format record for a single appliance

## Out of scope
- CARB R3 electronic filing, cylinder inventory/reclaim credits, ERP or ServiceTitan sync, technician certification tracking

## Risks & unknowns
Contractors are famously software-hostile and the tech on the roof gains nothing personally — adoption dies unless entry is under 20 seconds. Some large accounts already have Trakref/Verisae mandated by the customer. Regulatory dates for HFC leak rules keep sliding.

## Done means
A tech with no training logs two additions on the same RTU eleven months apart, the second one crosses 20%, the app opens a 30-day repair task offline, and the exported PDF matches the fields an EPA inspector asks for.
