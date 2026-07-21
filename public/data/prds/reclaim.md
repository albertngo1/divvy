## Overview
Reclaim is a mobile web app for HVAC/refrigeration technicians that captures refrigerant charge/recovery events at the unit and automatically produces both the EPA Section 608 leak-rate compliance record and the customer's refrigerant invoice line. It aligns the annoying regulatory task with the task the tech actually cares about—getting paid—so honest logging becomes the path of least resistance.

For whom: independent HVAC contractors and small refrigeration shops (1–20 techs) who today track refrigerant on paper, in a truck notebook, or not at all.

## Problem
EPA 608 requires tracking refrigerant added to and recovered from appliances, computing an annualized leak rate, and repairing systems that exceed thresholds (e.g., 20% comfort cooling, 30% commercial) within a deadline. In practice techs scribble 'added 3 lb R-410A' on a work order, the office never computes leak rate, and the trailing-12-month math to flag a chronic leaker never happens—until an audit or a compressor dies. The paperwork feels like pure overhead disconnected from revenue.

## How it works
A tech opens the unit's page (scan a QR sticker slapped on the condenser on first visit), taps the refrigerant type, and enters pounds added or recovered plus a leak-cause code. Reclaim stores the event, recomputes the appliance's trailing-12-month leak rate against its full-charge nameplate, and shows a green/amber/red compliance status with the repair deadline if a threshold is crossed. The same event instantly becomes a billable line (lbs × your per-lb price + labor) exportable to the invoice. A dashboard lists appliances approaching or over threshold and generates the audit-ready log per unit.

## Technical approach
Stack: SvelteKit or Next PWA (offline-first via IndexedDB + background sync—trucks lose signal in mechanical rooms), Postgres backend, QR via a printable sticker with a UUID. Data model: `appliances(id, site, type, full_charge_lb, refrigerant)`, `events(appliance_id, ts, lbs, direction, cause_code, tech)`. Leak-rate engine uses the EPA annualizing method over a rolling window; thresholds and repair-deadline clocks are table-driven per appliance category. The genuinely hard part is offline conflict-free sync of events (two techs, one unit, no signal) and getting the leak-rate annualization exactly right so the compliance output is defensible.

## v1 scope
- Add appliance (type, refrigerant, full charge) + QR sticker link
- Log add/recover event offline, sync when online
- Trailing-12-month leak-rate calc with green/amber/red + deadline
- CSV/PDF per-unit compliance log
- Auto line item (lbs × price) for copy into any invoice

## Out of scope
- Full field-service CRM / dispatch / scheduling
- Cylinder inventory reconciliation
- Direct QuickBooks/ServiceTitan integration
- Multi-state/EU F-gas rule variants

## Risks & unknowns
- Techs resist any new data entry; must be faster than the notebook
- Exact EPA annualization edge cases (mid-year charge changes, retrofits)
- Selling to a low-software-adoption trade
- Liability if a compliance calc is wrong

## Done means
A tech logs two refrigerant additions to one QR-tagged unit over a week fully offline; both sync without duplication, the app flags it over the 20% threshold with a correct repair-deadline date matching a hand-worked EPA calc, and the events export as both an audit log and a priced invoice line.
