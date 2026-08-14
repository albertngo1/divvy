## Overview
A self-serve audit + optimizer for small and mid-size parcel shippers (10k–500k packages/yr: DTC brands, 3PLs, industrial distributors). You give it your carrier billing data and your SKU dimensions; it gives you a dollar figure for the air you are shipping, and a concrete carton lineup change that reduces it.

## Problem
Carriers bill on dimensional weight: `ceil(L×W×H / divisor)` (139 domestic, 166 international), rounded up, compared against actual weight, and you pay the greater. Most shippers picked their box lineup years ago, buy in whatever sizes the supplier stocks, and have never measured the gap. Nobody on the ops team has time to run cartonization math against 6,000 SKUs. The existing answer is either a $40k/yr TMS module or an enterprise parcel-audit firm that takes 30% of recovered spend and never touches box selection. Ops people know they're paying for air; they can't price it.

## How it works
1. Drop in carrier billing files — UPS Billing Data (EDI 210 or the CSV export), FedEx Electronic Trade Documents billing CSV. Parse to shipment rows: zone, billed weight, actual weight, entered dims, base rate, accessorials.
2. Drop in a SKU list: dims + weight (Shopify/ShipStation export, or CSV).
3. The audit view is the hook: **billed weight minus actual weight, priced at your own effective rate per zone** = "you spent $61,400 shipping air last quarter." Broken out by SKU, by carton, by zone, ranked.
4. The optimizer proposes a carton catalog: given your order-line histogram (real multi-item baskets from the last 90 days), pick K stock cartons minimizing expected billed weight + carton cost + a per-SKU-changeover penalty.
5. Output is a one-page PDF an ops manager can hand to a purchasing agent: drop these 3 boxes, add these 4, projected annual delta with a confidence band.

## Technical approach
Python + FastAPI + Postgres; the invoice parser is the unglamorous 40% (UPS/FedEx layouts drift; keep a versioned column-mapping registry with per-file fingerprinting).

Core math is two nested problems:
- **Inner (per order): 3D bin packing.** Extreme-Point heuristic with 6-orientation rotation, plus a corrugated fudge (bulge factor ~3% per wall, void-fill minimum). Cheap enough to run millions of times.
- **Outer (catalog): choose K cartons from a candidate pool.** This is uncapacitated facility location / max-coverage — submodular, so greedy gives 1−1/e, then polish with local swap search. Candidate pool = supplier stock-size catalogs (Uline, packaging distributors) plus a grid of custom sizes.

Rates: model each account's *effective* rate as an empirical zone×weight table fit from the shipper's own invoices — never the published tariff, since everyone has negotiated discounts. This is the trick that makes savings estimates credible.

Hard part: order-line data quality. Missing SKU dims are endemic. Mitigation: infer dims by solving a small least-squares problem from historical single-SKU shipments where the billed dims are known.

## v1 scope
- UPS CSV only. One carrier, one format.
- The audit number and the ranked SKU table. No optimizer.
- Manual CSV upload, no OAuth, no integrations.
- PDF export.
- Price it as a $500 one-shot audit; the optimizer is the upsell.

## Out of scope
Rate negotiation advice, LTL/freight, international duties, WMS write-back, live cartonization at pick time.

## Risks & unknowns
Invoice format drift breaks parsing silently — needs row-count and total-charge reconciliation against the invoice footer. Savings claims must be defensible or the first customer churns loudly. Carrier data access is fine (it's the shipper's own data) but some shippers only have PDF invoices, which is a much worse ingest path.

## Done means
Given a real 90-day UPS billing export and a SKU file, the tool reports total dim-weight overage within 1% of a hand-computed spot check on 50 sampled shipments, and the proposed 6-carton lineup beats the shipper's current lineup on a held-out month of orders.
