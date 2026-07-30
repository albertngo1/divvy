## Overview
A read-only fair-value dashboard for exchange-traded daily-high-temperature contracts. For one person with a laptop who wants an edge that comes from measurement quirks rather than from out-forecasting NOAA.

## Problem
Everyone trying to trade these markets builds a better forecast. But the contract does not settle on the weather — it settles on the integer daily maximum reported by one specific ASOS station (Central Park, Midway, Austin-Bergstrom) over local midnight-to-midnight. That station has a persistent, seasonal, wind-direction-dependent offset from any gridded model, and the outcome is rounded to a whole degree before it hits a bucket boundary. Half a degree of unmodeled station bias moves 15 points of probability across a bucket edge. Separately, once the day's running max exceeds a bucket's top, that bucket is worth exactly zero — and thin books stay bid at 3¢ for hours.

## How it works
Every hour: pull the open contract ladder and orderbook, pull the latest model guidance for the station's grid point, apply the learned residual correction, integrate the corrected predictive distribution over each bucket's rounded integer support, and render fair value next to the book with the implied edge after fees. A separate panel is the mechanical one: current observed max-so-far versus every bucket, flagging any contract that is already arithmetically impossible but still trading above zero.

## Technical approach
Python + DuckDB + a small Next.js dashboard. History: Iowa Environmental Mesonet ASOS archive (`mesonet.agron.iastate.edu/cgi-bin/request/asos.py`) for 20 years of 1-minute and hourly obs plus the official CLI daily max. Forecasts: NWS `api.weather.gov/gridpoints/{office}/{x},{y}` hourly for v1; National Blend of Models percentile bulletins for v2. Market data: Kalshi `trade-api/v2/markets` and `/orderbook`. Model: residual r = observed integer max − forecast max, fit with LightGBM under pinball loss at 19 quantiles, features = station, day-of-year sin/cos, lead hours, forecast max, forecast cloud cover, forecast 850mb wind direction bin, dewpoint depression. Convert the quantile fan into a CDF by monotone interpolation, then bucket probabilities are CDF differences at the rounding half-points (a "73–74°" bucket is P(72.5 ≤ T < 74.5)). Fee model: Kalshi's 0.07·P·(1−P) per contract, applied before any edge is displayed — most apparent edges die here. Hard part: the residual is heteroskedastic and regime-dependent (a frontal passage day is a different animal from a stagnant summer day), so calibration must be checked with a reliability diagram on a held-out year, not just a mean error.

## v1 scope
- One station, one series, one lead time (next-day)
- The already-impossible detector, which needs no model at all
- Paper-trade log with fee-adjusted P&L
- Reliability diagram on 2 held-out years

## Out of scope
Order placement, other market families, intraday model refresh, multi-station portfolios.

## Risks & unknowns
Books may be too thin to fill the edge you find; the obvious mechanical inefficiencies may already be arbitraged by faster bots; exchange API terms may restrict automated use. Station relocations and sensor swaps break the historical residual model silently.

## Done means
On a held-out year, the corrected bucket probabilities beat raw NWS-derived probabilities on Brier score, and 60 days of live paper trading shows positive fee-adjusted P&L on the impossible-bucket signal alone.
