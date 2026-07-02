## Overview
Charge Sheet is a mobile-first field app for residential/light-commercial HVAC techs and small contractor shops that logs every pound of refrigerant added to or recovered from a system and auto-assembles the recordkeeping the EPA Section 608 rules demand. It's for the two-truck HVAC outfit that currently tracks this on a clipboard or not at all.

## Problem
Techs who service systems with >5 lbs of charge are legally required to log refrigerant added and recovered, cylinder-by-cylinder, and shops must retain these records for years. In practice it's scrawled on invoices, lost, or never done — until an EPA audit, a leak-rate dispute, or a wholesaler cylinder reconciliation makes it matter. Refrigerant (R-410A, R-454B) is also expensive and pilferable, so shops want to know where every pound went. The manual workflow is painful, error-prone, and skipped.

## How it works
Each cylinder gets a printed QR sticker (generated in-app) tying it to its refrigerant type and starting weight. On a job the tech: scans the site (or picks from history), scans the cylinder, enters lbs added or recovered and the reason (top-off, leak repair, recovery). The app subtracts from the cylinder's running balance and appends to that system's service history. Leak-rate is computed automatically when repeated top-offs on one system exceed thresholds, flagging systems that legally must be repaired or reported. A one-tap export produces a per-cylinder ledger and per-system 608 record as PDF/CSV.

## Technical approach
Stack: React Native (Expo) with SQLite (via `expo-sqlite`) for fully-offline capture — trucks lose signal in mechanical rooms. QR via `expo-camera` + `zxing`. Data model: `cylinders` (id, refrigerant, tare, current_lbs), `sites`, `equipment` (site_id, charge_lbs, refrigerant), `transactions` (cylinder_id, equipment_id, lbs_delta, kind, timestamp, tech, note, geo). Leak-rate = annualized (added_lbs / equipment.charge_lbs) over a rolling window — the EPA formula. PDF via `react-pdf`. Optional Supabase sync for multi-tech shops with row-level security per shop. The genuinely hard part is a trustworthy running cylinder balance across offline devices: use per-transaction UUIDs + last-write-wins on immutable append-only rows, reconstruct balances by replay, never store a mutable total.

## v1 scope
- Single tech, single device, fully offline
- Create cylinders, print QR labels
- Log add/recover transactions against a site
- Auto leak-rate flag per equipment
- Export PDF ledger + per-system record

## Out of scope
- Multi-tech cloud sync
- Invoicing / QuickBooks integration
- Wholesaler cylinder-return reconciliation
- Non-US regulatory regimes (F-gas)

## Risks & unknowns
- 608 rule specifics vary; must cite current CFR thresholds and let users adjust
- Techs won't scan cylinders if it adds friction — the scan must be sub-2-seconds
- Legal-record claims create liability; frame as "helps you keep" not "guarantees compliance"

## Done means
A tech can, offline, register a cylinder, log two top-offs and one recovery on a named AC unit, see a leak-rate flag fire when the second top-off crosses the annualized threshold, and export a PDF that shows the cylinder balance and the system's refrigerant history correctly.
