## Overview
A delivery-forecasting SaaS for small propane and heating-oil dealers (under ~3,000 accounts) — the ones priced out of Cargas, ADD Systems, and Blue Cow, still running keep-full routes off index cards and a whiteboard.

## Problem
"Keep full" customers never call; the dealer must predict when each tank hits reserve. The industry method is the K-factor: heating degree days elapsed ÷ gallons delivered, i.e. how many HDD that household burns per gallon. Dispatchers recompute it by hand after every ticket. Two failure modes both cost real money: a run-out means a mandatory pressure test and re-light service call plus liability, while an early fill means a half-empty truck and a wasted stop. And the K-factor lies exactly when it matters — a new tenant, a wood stove, a pool heater, or a leaking regulator shows up as "the number drifted," and nobody notices for two deliveries.

## How it works
Upload a CSV of delivery tickets (date, account, gallons, percent-before-fill) or photograph the paper cards. Keep Full pulls historical HDD from NOAA's CDO API and forecast HDD from the NWS `api.weather.gov/gridpoints` endpoint for each service address, then fits per-tank usage. Output is a daily dispatch sheet: every account sorted by P(run-out before the next planned visit), clustered into routes.

The twist is the model. Instead of one K number, each tank gets a two-parameter fit — a baseload (gallons/day, summer hot water and cooking) and a weather slope (gallons/HDD) — solved by robust regression over ticket intervals. Residuals feed a Bayesian online change-point detector. When the posterior says the burn rate structurally shifted, the account surfaces on an exceptions list: *tank 4417 is burning 31% more per HDD since March 2 — leak, theft, or occupancy change.* That exception list is the feature dealers will actually pay for; the routing is table stakes.

## Technical approach
Python/FastAPI + Postgres + a Next.js dispatch board. Data model: `accounts`, `tanks(capacity_gal, reserve_pct, station_id, grid_point)`, `tickets`, `fits(baseload, slope, sigma, fit_at)`, `changepoints`. HDD base 65°F, computed daily per grid point and cached. Fitting is Huber regression on gallons ÷ interval-days vs HDD ÷ interval-days; posterior predictive over forecast HDD gives a run-out date distribution, not a point. Route build is a prize-collecting VRP in OR-Tools where each stop's prize is expected avoided run-out cost minus partial-fill penalty.

Hard parts: tickets are filthy (partial fills, will-call mixed with keep-full, tank swaps, "80% fill" vs nameplate capacity), and cold-start accounts with two tickets need a hierarchical prior borrowed from similar homes in the same zip.

## v1 scope
- CSV import, one dealer, one weather station
- Per-tank baseload + slope fit, run-out date with 80% interval
- Printable next-day stop list sorted by risk
- Change-point exceptions page

## Out of scope
Billing, tank-monitor telemetry integrations, driver mobile app, pricing/hedging, ERP sync.

## Risks & unknowns
Dealers are famously slow buyers and often locked into an ERP. Ticket data quality may force a manual cleanup step per onboarding. Tank monitors (Otodata, Wesroc) are getting cheaper and could eventually eat the forecasting need — though they still don't explain *why* a rate changed.

## Done means
Backtest on one real dealer's two prior heating seasons: predicted run-out dates beat their historical K-factor schedule on both metrics — fewer would-be run-outs and higher average gallons per stop — and the change-point list flags at least one real incident the dealer confirms.
