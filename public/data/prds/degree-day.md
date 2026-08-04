## Overview
A weather-hedging calculator for small businesses whose revenue swings with the sky: patio bars, ice cream shops, ski rental counters, event photographers, landscapers, car washes. It measures your actual dollar-per-degree exposure from your own sales history, then constructs a concrete hedge out of retail prediction-market weather contracts.

## Problem
Weather derivatives have existed since the 90s — CME HDD/CDD futures, OTC swaps — and are structurally unavailable to a business doing $600k a year: minimum notionals in the millions, ISDA paperwork, a broker relationship. Meanwhile Kalshi, a CFTC-regulated exchange, now lists daily high-temperature and precipitation contracts on major US cities that anyone can buy for cents. The instrument became retail. Nobody built the thing that tells a retail business *which contracts and how many*. That gap — trivial regression math on data the owner already has, pointed at an instrument that just became accessible — is the arbitrage.

## How it works
1. Upload a CSV of daily gross sales (Square, Toast, and Clover all export this) plus your zip code.
2. We pull matched daily weather history and fit your revenue model.
3. Output page one: **your weather beta.** "Each °F above 74 is worth $118/day to you, ±$31 (95% CI). Rain days cost you 38% of revenue." A partial-dependence curve of revenue versus temperature, with the day-of-week and seasonal effects stripped out.
4. Output page two: **the hedge.** "For the next 30 days, buy 220 contracts of KXHIGHNY ≤64°F at avg $0.19 = $418. Backtested against the last 5 Augusts this cuts your monthly revenue standard deviation 34%." Copy-pasteable ticker/quantity list; we never touch anyone's money.
5. The honest failure mode is a feature: "your weather beta is statistically indistinguishable from zero — don't hedge, your problem is Tuesdays."

## Technical approach
Python + FastAPI + a single Postgres table; the whole thing is one long-running job per upload.

**Weather history:** NOAA NCEI GHCN-Daily / Local Climatological Data for the nearest station to the zip (TMAX, TMIN, PRCP, SNOW). Forecast distribution from `api.weather.gov` plus a climatological prior built from 20 years of that station's day-of-year distribution.

**Model:** OLS on `log(revenue) ~ ns(TMAX, df=4) + PRCP_indicator + day_of_week + month + linear_trend + holiday_flag`, natural cubic spline basis via `patsy`. Bootstrap 1000 resamples for CIs. Convert to dollars/°F by differentiating the fitted spline at the local climatological mean.

**Hedge construction:** Kalshi's trade API (`/trade-api/v2/markets`) gives a ladder of bucketed temperature strikes with live bid/ask. Each basket's payoff is a step function of realized temperature. Simulate joint (revenue, payoff) outcomes over the forecast distribution and solve a small convex program with `cvxpy`: minimize CVaR₉₀ of total P&L subject to premium ≤ budget and integer-ish contract counts (relax, then round and re-evaluate).

The genuinely hard part is honest backtesting — Kalshi's price history is short, so historical premiums must be reconstructed from the climatological probability plus an assumed spread, and that assumption has to be stated loudly.

## v1 scope
- CSV upload, one city, temperature only (no precip)
- Beta + confidence interval + one partial-dependence chart
- Hardcoded 30-day horizon, hedge suggested by grid search over 3 strikes, not an optimizer

## Out of scope
POS OAuth integrations, order execution, multi-location, non-US, energy/agriculture hedges.

## Risks & unknowns
Kalshi weather liquidity is thin — a 220-contract order may move the book or not fill; must display depth. Handing a business a specific trade may constitute investment advice, so v1 is framed as an exposure calculator with an illustrative basket and a lawyer-reviewed disclaimer. Basis risk: the airport station is not your patio. Two years of daily data is thin for a 4-knot spline.

## Done means
Fed a real ice cream shop's 2-year daily sales CSV, it reports a temperature beta whose 95% CI excludes zero, and the suggested basket, evaluated on a held-out summer, lowers monthly revenue standard deviation by more than its premium cost.
