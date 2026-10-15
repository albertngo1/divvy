> **Spotted in the news:** Iranian attacks sinking two ships, including a container ship, in the Strait of Hormuz, with oil price hikes and continued Saudi-Houthi strikes.

## Overview
An invoice-audit service for small US/EU importers (roughly 20–500 containers a year) that buy ocean freight through forwarders and NVOCCs and have no logistics analyst on staff.

## Problem
The headlines report container ships sunk in the Strait of Hormuz and ongoing Saudi-Houthi strikes. Each escalation brings carriers' war-risk, emergency-risk, Gulf and Red Sea contingency, and bunker surcharges, often announced in a PDF notice with specific trade lanes, ports and effective dates. Forwarders pass these on, often marked up, and often to every customer whether or not that customer's lane is affected, or for bookings made before the notice took effect. A small importer with 80 containers a year can pay $200–$2,000 per box in contingency charges during a crisis and has no time to compare each invoice line against carrier notices. Large shippers hire freight-audit firms, which mostly won't take accounts this small.

## How it works
1. The importer forwards freight invoices (PDF/email) to a dedicated inbox.
2. Surcharge Audit extracts the line items, container numbers, bill-of-lading number, carrier and booking date.
3. It pulls the container's actual route (port calls and transshipments) from carrier tracking.
4. It checks each surcharge against a curated library of carrier surcharge notices: lane, origin and destination, effective date, amount per TEU or FEU.
5. Each line is marked OK, Not applicable (wrong lane or before the effective date), or Overcharged (amount above the published figure), with the notice cited.
6. A dispute email for the forwarder is drafted, citing the notice clause.

## Technical approach
Email ingestion goes to an LLM-assisted invoice parser with human-checked templates per forwarder. Container routing comes from carrier track-and-trace (the DCSA Track & Trace standard where carriers support it, otherwise scraping or aggregators like Terminal49 or Vizion). Postgres model: invoice, line_item, container, port_call, surcharge_notice (carrier, code, lanes, effective_from/to, amount, unit, source_url), finding. The hard part is the notice library. Carriers publish surcharges as unstructured customer advisories with inconsistent lane definitions, and someone has to encode them by hand, quickly, during each crisis. That ongoing curation work is what the product actually sells.

## v1 scope
- 3 carriers' war-risk/emergency notices since the current Gulf escalation
- Manual-assisted invoice parsing for 5 pilot importers
- Per-invoice findings report plus dispute email draft

## Out of scope (for now)
- Air freight, trucking, customs duties
- Contract-rate (base freight) auditing
- Automated payment holds

## Risks & unknowns
Forwarders' own terms often allow 'all-in' or pass-through pricing, so some charges are contractually legitimate even when the carrier wouldn't have charged them. The tool must separate 'disputable' from 'just expensive'. Importers may avoid disputing because they depend on the forwarder. Pricing as a contingency fee (25% of recovered amounts) reduces adoption friction but delays revenue. Demand rises and falls with crises.

## Done means
Across 50 real invoices from 5 pilot importers covering the Hormuz escalation period, the tool flags every surcharge line, and the importers' own review agrees with each flag at least 85% of the time. At least $10,000 in disputable charges is identified, and at least one dispute succeeds.
