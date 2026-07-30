## Overview

Full Charge is a refrigerant ledger for commercial HVAC/R service contractors that doubles as their EPA Section 608 recordkeeping system. Techs log every pound added or recovered from the truck; the back end computes leak rates the way the regulation actually requires, tracks the mandatory repair clocks, and — the part that sells it — converts each leak into an annual dollar figure the salesperson puts next to the repair quote.

For: mechanical contractors and refrigeration service companies with 5–60 techs. Buyer is the service manager or owner.

## Problem

Under 40 CFR Part 82 subpart F, any appliance with a full charge of ≥50 lb that exceeds its leak-rate threshold (20% comfort cooling, 30% commercial refrigeration, 30% IPR) triggers mandatory repair within 30 days, verification tests, and retained records — inspectable, with per-day penalties. Most shops track this in a binder, a shared spreadsheet, and the tech's memory. Nobody computes the annualizing-method leak rate by hand, so the threshold is crossed silently. Simultaneously, the AIM Act phasedown has made R-410A and R-404A genuinely expensive, so refrigerant walked off the truck is now real money nobody reconciles.

## How it works

1. Tech opens the PWA in a mechanical room with no signal. Photographs the data plate; OCR pulls manufacturer, model, serial, and factory charge into a draft asset record.
2. Logs the service: refrigerant type, cylinder ID, pounds added or recovered, reason code.
3. On sync, the server recomputes that appliance's leak rate: `(lbs added ÷ full charge) × (365 ÷ days since last addition) × 100`, per the annualizing method, and re-evaluates the rolling record.
4. Crossing a threshold auto-creates a compliance case: 30-day repair deadline, required initial and follow-up verification tests, and a generated record packet in the format an inspector asks for.
5. The sales view: at the shop's current cost per pound, this asset leaks $X/year. Repair quote is $Y. Payback in Z months. That's the print-out the tech hands the building owner.

## Technical approach

Next.js + Postgres + a service-worker PWA with an IndexedDB outbox and last-write-wins-per-event sync (events are append-only refrigerant transactions, so ordering conflicts are rare and reconcilable). Data model: `asset` (nameplate charge, verified charge, appliance class → threshold), `cylinder` (lot, type, weight in/out), `transaction`, `leak_event`, `verification_test`. Cylinder weights reconcile: every pound leaving a cylinder must land in an asset or a recovery tank, so the ledger balances like double-entry bookkeeping and shrinkage surfaces. Data-plate OCR via Apple Vision on iOS / a small VLM server-side, with a human confirm step. GWP and refrigerant tables from EPA's SNAP and AIM Act allowance data; regulatory thresholds encoded as versioned rules with effective dates.

Hard part: `full charge` is the denominator of the entire regulation and it is routinely unknown or wrong — nameplate charge doesn't include line-set volume for split systems. v1 needs a defensible estimation path (nameplate + line-set length × lb/ft) and must record *which* method was used, because that's what an inspector challenges.

## v1 scope

- Asset list, manual entry, one refrigerant type per asset
- Log an add/recover; leak rate computed and displayed
- Threshold crossing creates a case with a due date and an email nag
- One printable compliance record PDF
- Offline capture with sync

## Out of scope

OCR (type it in), cylinder reconciliation, dispatch/ServiceTitan integration, multi-site rollups, e-signature.

## Risks & unknowns

Field-tech adoption is the whole ballgame — one extra form and it's abandoned. Regulatory text changes and mis-stating a threshold is worse than not shipping. Incumbent FSM suites (ServiceTitan, BuildOps) have adjacent modules; the wedge has to be that this is the only tool that prices the leak.

## Done means

One real contractor's techs log 30 days of refrigerant adds without paper, and the tool correctly flags an appliance crossing 20% that the shop's spreadsheet had missed — confirmed against the historical service records.
