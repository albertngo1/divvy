## Overview
A phone-first field app for HVAC/refrigeration technicians and their shop managers that turns refrigerant handling into a clean, per-cylinder ledger and auto-generates the recordkeeping the EPA now demands under Section 608 and the AIM Act HFC phasedown. For small refrigeration contractors (2–30 techs) who are legally on the hook but track this on paper.

## Problem
Every pound of HFC refrigerant a tech adds, recovers, or reclaims is supposed to be documented — cylinder serial, refrigerant type, quantity, disposition, appliance, date. As the AIM Act tightens the HFC supply and prices spike, both the EPA and the tech's own boss (who's watching expensive gas walk out the door) need this ledger. In practice it's illegible clipboard scrawl reconstructed at quarter-end, or nothing at all — which is an audit liability and a theft blind spot.

## How it works
1. Tech opens a work order, scans the cylinder barcode (or types the serial once; it's remembered).
2. Taps a transaction: Charge / Recover / Reclaim / Return-to-supplier, enters ounces, picks the appliance (site + unit, remembered per customer).
3. The app keeps a running mass balance per cylinder — how much R-410A / R-454B is left — and flags when a cylinder's logged draws exceed its rated fill (leak, miskey, or theft signal).
4. At period end, the manager exports a per-technician and per-cylinder report (PDF/CSV) matching the fields an EPA recordkeeping audit expects, plus a simple shrinkage dashboard.

## Technical approach
Stack: React Native (Expo) with an offline-first SQLite/WatermelonDB store — job sites have no signal, so all writes are local and sync opportunistically. Barcode scanning via the device camera (`expo-camera` / ZXing). Data model: `cylinder(serial, refrigerant_type, rated_fill, remaining)`, `transaction(cylinder_id, type, oz, appliance_id, tech_id, ts, geo)`, `appliance(customer, unit_label)`. Mass-balance is a running fold over transactions per cylinder; the leak/shrinkage flag is a threshold on cumulative net draw vs rated fill. Reports are server-rendered PDFs (a small Node service with a template) mapping internal fields to the EPA-expected columns; keep the field mapping and the refrigerant/GWP table as versioned JSON so rule changes are data, not redeploys. The hard part is trust in the mass balance across offline edits and conflict resolution when two techs touch the same shared shop cylinder.

## v1 scope
- One tech, one shop, offline log of Charge/Recover per cylinder.
- Manual serial entry (barcode optional).
- Running remaining-mass per cylinder + over-draw flag.
- CSV export of all transactions for a date range.

## Out of scope
- Multi-tech sync / conflict resolution.
- Full accounting / invoicing integration.
- Direct EPA e-filing (there is no single portal anyway).
- Cylinder purchasing / inventory ordering.

## Risks & unknowns
- Exact EPA recordkeeping field requirements vary by refrigerant class and update over time — the JSON ruleset could be incomplete.
- Techs won't adopt anything that adds friction mid-job; the scan-and-two-taps flow must be genuinely faster than the clipboard.
- Shared-cylinder mass balance across offline devices is a real sync problem.

## Done means
A tech can, fully offline, scan a cylinder and log three charge transactions across two appliances; the app shows correct remaining mass and raises a flag when a fourth transaction exceeds the rated fill; the manager exports a CSV that reconciles to the ground truth to the ounce.
