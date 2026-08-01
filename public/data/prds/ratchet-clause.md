## Overview
A web tool (and, if it works, a $99/mo service) for small commercial and industrial electricity customers — machine shops, churches, breweries, grocers, self-storage, small manufacturers — that reads a year of interval meter data and answers one question their utility will never volunteer: *which single 15-minute interval is costing you the most money, and are you even on the right rate schedule?*

## Problem
Commercial electric bills are not energy bills. A large share is **demand charges** priced off the highest 15-minute average kW in the month, and many tariffs add a **ratchet**: your billed demand can never fall below, say, 80% of the highest peak in the trailing 11 months. So one compressor and one oven starting simultaneously on a hot Tuesday sets a floor under eleven future bills. Nobody at a 30-person shop knows this. The energy consultants who do know charge 4-figure retainers and deliver a PDF. Meanwhile most customers are on whatever tariff they were assigned in 1998, not the cheapest one they qualify for today.

## How it works
1. User uploads a Green Button (ESPI) XML/CSV export — most US utilities offer "Download My Data" with 15-min intervals — and picks their utility + current rate code.
2. We replay the year through a tariff engine: energy charges by TOU period, demand charges by season, ratchet lookback, customer charges, riders.
3. **The money shot:** a 365×96 heatmap of the year where each cell is one interval, and the ~12 billing-determinant intervals are circled in red. Hover any one and see "this interval set $1,840 of billed demand across 11 bills."
4. Counterfactual slider: "if this peak had been 15 kW lower, you'd have paid $X less" — computed by re-running the tariff, not estimated. That number is the honest budget for a battery, a soft-start, or a $0 change to shift-start staggering.
5. Tariff shopping: re-run the same year against every rate schedule the account qualifies for and rank by annual cost, showing the switching risk (a cheaper TOU rate that's brutal if you add a second shift).

## Technical approach
- Python + FastAPI, Postgres, a small React front end (canvas heatmap — 35,040 cells, so draw to an offscreen bitmap, not SVG).
- Tariff data: NREL/OpenEI **URDB** (`api.openei.org/utility_rates?version=8`) gives ~50k US rate schedules as JSON with `energyratestructure`, `demandratestructure`, `flatdemandmonths`, `demandratchetpercentage`. Validate against the utility's filed tariff PDF.
- Data model: `Account → IntervalSeries(ts, kwh, kw) → BillPeriod → Determinant(kind, interval_id, value, $impact)`. Attribution is the interesting bit: cost is allocated back to specific intervals, so every dollar has a timestamp.
- Ratchet math: billed demand per month = `max(actual_peak, ratchet_pct * max(peaks over lookback window))`; a rolling max-deque over the lookback gives the shadow price of each historical peak.
- **Hard part:** URDB's ratchet and seasonal-demand fields are frequently missing or wrong. Ground truth is a PDF tariff sheet. v1 hand-encodes 5 utilities and ships a diff report when our recomputed bill misses the customer's actual bill total by >2% — that reconciliation is the product's credibility.

## v1 scope
- Upload one Green Button file, one hardcoded utility, one rate schedule.
- Recompute 12 monthly bills; show reconciliation error vs. uploaded PDF bill totals.
- Year heatmap with the 12 determinant intervals circled.
- One counterfactual: "shave the top peak by N kW" → annual savings.

## Out of scope
- Live metering, controls, or any hardware.
- Automated utility data pulls (OAuth per-utility is a swamp).
- Solar/storage dispatch optimization; we only price the *headroom*.

## Risks & unknowns
- Data acquisition friction: if a customer can't get interval data, there is no product. Fallback: 30 days from a clip-on CT logger.
- URDB accuracy; tariff drift mid-year.
- Is the buyer the owner (cares, no time) or the facility manager (has time, no P&L)? Probably the owner, sold through equipment dealers.

## Done means
Given a real shop's Green Button year plus their 12 PDF bills, the tool recomputes each month's total within 2%, circles the intervals that set billed demand, and outputs a one-page "you are on the wrong rate" or "your worst 15 minutes cost $N" memo the owner can hand to an electrician.
