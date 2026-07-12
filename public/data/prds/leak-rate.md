## Overview
Leak Rate is a field-ops SaaS for small and mid-size commercial HVAC/R contractors that automates EPA Section 608 refrigerant recordkeeping and the AIM Act HFC-tracking that's now landing on their desks. It's the compliance layer their scheduling software (ServiceTitan, Housecall Pro) doesn't really cover.

## Problem
For any comfort-cooling appliance with a 50+ lb charge, federal rule requires logging every refrigerant addition/recovery and computing an annualized leak rate; cross a threshold (currently 30% for comfort cooling, 20% for commercial refrigeration) and you're legally on the clock to repair and re-verify. Miss the paperwork and you eat five-figure fines. Today this is a grease-stained binder in a truck and a bookkeeper reconstructing it at audit time. Nobody's watching the leak rate creep until it's a violation.

## How it works
On a service call the tech scans a QR sticker on the unit, taps 'added 12 lb R-410A' (or recovered), photographs the label, and Leak Rate timestamps + geotags it. The app maintains a running per-appliance charge ledger, auto-computes the trailing-12-month leak rate on every entry, and fires a push the moment a unit crosses into 'must repair within 30 days' territory — with the follow-up verification date pre-scheduled. At year end it exports the full compliance report per site.

## Technical approach
Stack: React Native app + Postgres + a small rules engine. Data model: appliance (full charge, refrigerant type, GWP) → events (add/recover/repair/verify, quantity, tech, timestamp, geo, photo). Core algorithm is the EPA annualized leak-rate formula (rolling method) plus the repair/verification deadline state machine per appliance category. Refrigerant GWP and phasedown limits come from EPA's SNAP/AIM tables. The genuinely hard part is the deadline state machine — 'initial verification', 'follow-up verification', and 'mothballing' each reset the clock differently, and getting those transitions legally correct is the whole product.

## v1 scope
- QR-tag a unit, log add/recover events with photo + timestamp
- Auto-compute trailing-12-month leak rate per appliance
- Threshold-crossing push alert with the repair deadline
- Per-site year-end PDF export

## Out of scope
- Full CRM/dispatch (integrate, don't rebuild)
- Cylinder inventory / reclaim tracking
- Residential sub-50-lb systems

## Risks & unknowns
Thresholds and the AIM Act reporting scope shift with EPA rulemaking — keep them as config. Techs hate data entry; if the scan-and-tap flow isn't sub-15-seconds, it dies in the field. Incumbents may bolt this on.

## Done means
A contractor logs a season of real charge events on a test unit and Leak Rate reproduces the correct annualized leak rate, fires the alert at the exact event that crosses the threshold, sets the right statutory repair/verification dates, and exports a report that passes a compliance consultant's review.
