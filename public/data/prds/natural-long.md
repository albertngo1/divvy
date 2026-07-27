## Overview
A local-only CLI + single-page report that reads your transaction history and restates it as a **trading book**: not "you spent $3,100 on gas" but "you are naturally long 780 gallons/yr of RBOB, long 610 therms of Henry Hub, short 1 metro's rent index, and long EUR 2,400." Then it prices the smallest liquid hedge that would flatten each line. For anyone who feels price shocks in their life but only ever hears portfolio advice.

## Problem
Retail finance treats exposure as *what's in the brokerage account*. But a 40-mile commute in an F-150 is a bigger energy position than most people's energy ETF, and a renter in a hot metro is short a housing index with no offset. Nobody can see this, so people double down (buy oil ETFs while already long gasoline) or leave obvious natural shorts unhedged. The itch: **you already have a book, you just can't read it.**

## How it works
1. Ingest CSVs (Chase/Amex/Plaid export) into DuckDB; categorize merchants.
2. **Convert dollars to physical units**, not the reverse. Gasoline spend ÷ EIA weekly regional retail gasoline price (`EMM_EPM0_PTE_R1X_DPG` family) → gallons/month. Utility bills ÷ EIA state residential electricity and natural-gas prices → kWh and therms. Grocery lines against BLS *average price* series (eggs, coffee, ground beef). Rent vs Zillow ZORI for your metro. Non-USD card charges → FX notional.
3. Emit the book: units/yr, and dollar-delta per 1σ annual move using 5y covariance.
4. Emit the year's realized P&L you never chose: *"energy prices cost you $412 this year; your energy ETF made $80."*
5. Solve for a hedge basket (UNG, USO, CORN, FXE, a homebuilder ETF) minimizing residual variance subject to round-lot minimums.

## Technical approach
Python, DuckDB, cvxpy. Exposure estimation is a **bottom-up physical map used as a Bayesian prior**, with constrained ridge regression of monthly spend on factor prices to adjust — 24 monthly points can't identify 8 betas alone, so the prior does the work. Covariance from daily ETF/futures returns; hedge = QP with integer lots relaxed then rounded.

The genuinely hard part is **elasticity**: you buy fewer gallons when gas is $5, so naive dollar-deltas systematically *understate* exposure. Fix by always dividing spend by an observed price series to recover quantity, then treating quantity as the (slowly drifting) position. Second hard part: merchant strings are garbage — "SHELL OIL 57442136" vs "SHELL 1234" — needs a trigram + MCC hybrid classifier with a manual override file.

## v1 scope
- Gasoline only. One CSV format. One EIA series.
- Output: gallons/yr, $ per 1σ, and "here's how many shares of USO offsets it."
- A single HTML report, no server.

## Out of scope
Brokerage integration, tax lots, actually placing trades, mobile, multi-user.

## Risks & unknowns
Hedge ratios may be small enough to be noise after fees — the honest answer for many users is "you're a rounding error, don't hedge." That's a fine output but a bad demo. EIA regional prices lag by a week. Plaid categories are coarse and change.

## Done means
Feed it 24 months of one real card export; it reports annual gallons within 10% of odometer-derived truth, and the report names one exposure the user did not know they had.
