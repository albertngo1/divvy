## Overview
A solo tool that reads the runtime logs your smart thermostat already keeps, fits a grey-box thermal model of your house, and returns three things a $600 energy audit would: your envelope's heat-loss coefficient (UA) with error bars, an outage survival curve ("P(indoor < 45°F within 24h) in a January outage = 0.38"), and a seasonal drift chart that catches your envelope getting leakier. For homeowners and renters with an ecobee, Nest, or Home Assistant setup.

## Problem
Home-energy advice is generic ("add insulation!") because nobody measures. A real blower-door test costs a few hundred dollars, needs an appointment, and gives you one number on one day — it cannot tell you that something changed in November. Meanwhile every thermostat has been logging indoor temp, outdoor temp, and HVAC runtime at 5-minute resolution the whole time, and that is enough to identify the model.

## How it works
You connect a data source and it finds *free-float segments*: overnight windows where HVAC is off, sun is down, and indoor temp is decaying toward outdoor. Each segment is a natural coast-down test. Fit the decay and you get the time constant τ; combine with runtime-on segments to separate capacitance from conductance and get UA in BTU/hr·°F. Compare against code-minimum for your square footage and build vintage, then Monte Carlo over 20 years of local January weather to produce the survival curve. Re-fit monthly; a CUSUM change-point on the UA series flags "something changed on Nov 12, +11% loss" and ranks candidate explanations by magnitude (door sweep, damper stuck open, attic hatch, new window covering removed).

## Technical approach
Python + DuckDB + a small React front end. Sources: ecobee Developer API `runtimeReport` (indoor temp, outdoor temp, `compHeat1`/`auxHeat1` seconds per interval), Home Assistant long-term statistics from its recorder DB, Nest via the SDM API, or a CSV upload. Outdoor truth from `api.weather.gov/stations/{id}/observations` including wind speed; solar from NREL NSRDB PSM3 or a clear-sky model gated by METAR cloud cover.

Model is a discrete-time 2R2C state space: interior node (air + light mass) and envelope node, inputs = outdoor temp, HVAC thermal power, solar gain proxy, occupancy-free assumption overnight. Fit with `scipy.optimize.least_squares` on multiple-shooting residuals, then run a Kalman smoother for per-month UA with covariance. Infiltration is modeled as `UA_eff = UA0 + k·windspeed`, which is what makes the wind-driven degradation visible.

The genuinely hard part is identifiability: solar gain, internal gains from bodies and appliances, and UA all trade off against each other. Fitting only on 1am–5am free-float windows kills two of the three but throws away most of the data, so v1 accepts wide error bars and reports them honestly rather than pretending to a point estimate.

## v1 scope
- Upload the ecobee runtime CSV (they email it on request)
- Auto-detect overnight free-float segments, fit single-capacitance RC per segment
- Output: τ distribution, UA point estimate ± CI, and one outage survival curve
- Static chart, no accounts, runs locally

## Out of scope
Room-level modeling, cooling season, cost-of-retrofit recommendations, live API sync, multi-home comparison.

## Risks & unknowns
Houses with heat pumps have temperature-dependent capacity, so HVAC thermal power is not a constant — needs a COP curve. Wide CIs may make the drift detection useless below ~10% changes. Setpoint schedules can starve you of free-float windows.

## Done means
On one real winter's data, the fitted τ predicts a held-out overnight decay curve to within 1°F RMSE, and the tool produces a survival curve that matches a deliberately-run test (thermostat off for 4 hours) within its stated interval.
