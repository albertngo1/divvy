> **Spotted in the news:** WVIA's 'School bus drivers, districts struggle with high diesel prices, fear future of small companies,' read alongside NPR's 'Inflation sizzled in September.'

## Overview
A web tool for small pupil-transportation contractors (5–80 buses) that contract with school districts. It turns public diesel price indices into contract-ready fuel adjustment invoices. It also helps contractors write a fuel escalator clause into their next bid.

## Problem
About a third of US school districts contract out busing, often to family firms. Those contracts are usually priced per route-day for 1–5 years. When diesel spikes, the contractor absorbs the difference. WVIA reported Pennsylvania contractors fearing for their survival on exactly this, the same week national inflation ran hot. A 40-bus operator burns about 150,000 gallons a year, so a $1/gal swing costs $150k, which is often the whole margin. Many contracts do include a fuel clause (e.g. 'adjust per PennDOT/EIA index beyond ±10%'), but the owner doesn't know how to compute it, misses the claim window, or sends the district a number it can't verify, and the district rejects it. Contracts with no clause at all get renewed again without one.

## How it works
1. The contractor uploads or types in the contract: baseline price, index named, threshold band, cap, adjustment period, and claim deadline.
2. The tool pulls the named index each week and computes the adjustment owed per period. It needs either route-miles × fleet MPG or actual gallons.
3. When an adjustment is triggered, it generates an invoice addendum. The addendum shows the index values with source URLs, the formula as written in the contract, and the arithmetic, so a district business manager can check it in five minutes.
4. A deadline calendar warns the contractor before each claim window closes.
5. For contracts with no clause, a 'bid kit' produces sample escalator language modeled on state DOT clauses, with a backtest: 'under this clause you'd have recovered $X over the last 3 years.'

## Technical approach
The stack is Next.js + Postgres. Data comes from the EIA Open Data API (weekly retail diesel by PADD region) and state indices where contracts cite them (PennDOT publishes a monthly diesel index; some states use OPIS rack prices, which are paid and out of scope for v1). Data model: Contract → Clause (index_id, baseline, band, cap, period, rounding rule) → Period → Adjustment. The hard part is that clauses are written in inconsistent legalese (base month vs. bid-date average, band applied before or after the cap, per-mile vs. per-gallon). v1 parses them by hand-assisted form, not with an LLM. Every clause variant becomes a tested formula type.

## v1 scope
- Pennsylvania only, EIA Central Atlantic + PennDOT index
- Manual clause entry with 4 formula types
- PDF addendum generator
- Email deadline reminders
- Backtest for the bid kit

## Out of scope (for now)
- Telematics or fuel-card integration
- OPIS/paid indices
- Contract negotiation services
- District-side product

## Risks & unknowns
Who pays: contractors, at about $50–100/month. That is cheap next to a single recovered adjustment, but these owners are hard to reach. The wedge is state pupil-transportation associations (PSBA, PA School Bus Association). Districts may still resist paying out mid-year whatever the math says. If most contracts truly have no clause, the product becomes a bid-time tool with a yearly sales cycle. Diesel could also fall, and urgency would fall with it.

## Done means
Three real PA contractors enter their contracts. For at least one, the tool computes an adjustment that matches the district's own calculation to the cent, and that adjustment gets invoiced and paid.
