## Overview
An opt-in Home Assistant add-on plus a tiny leaderboard service, for the HA hobbyist crowd. It answers the one question every dashboard can't: 'compared to homes like mine, am I actually good?'

## Problem
Home Assistant gives you gorgeous graphs of your own energy, uptime, and automations — but zero peer context. You have no idea if 18 kWh/day is great or terrible for a house your size in your climate. Individuals literally cannot get this comparative data; utilities won't share it and no neighbor will hand you their sensor history. It's a classic arbitrage: your own data is abundant, but the peer baseline is the scarce, valuable thing.

## How it works
You install the integration, enter your home's square footage, and opt in. A daily job pulls a few derived metrics — headline v1 metric: energy per square foot per heating/cooling degree-day — and submits an anonymized, salted-hashed record to a public leaderboard. You're bucketed into a cohort by IECC climate zone (from coarse lat/long) and home-size band, and shown your percentile plus a weekly challenge ('shave your standby watts'). No raw events ever leave the house.

## Technical approach
HA custom integration in Python reads Recorder statistics via the internal API/websocket, computes the normalized metric, and POSTs to a small FastAPI + SQLite backend. Degree-days derived from HA's weather integration or a free NOAA station lookup. Cohorting: round lat/long to a climate-zone lookup + sqft bucket. Privacy: only rounded aggregates, a salted per-home hash id, coarse geographic rounding; no automation contents, no device list. Leaderboard is a static-ish web UI reading the backend. Hard part: fair normalization so comparisons aren't apples-to-oranges (climate + size + fuel type), and anti-cheat so people can't fake a great number.

## v1 scope
- One metric: energy/sqft/degree-day
- Manual sqft entry
- Global + climate-zone leaderboards, weekly reset
- Percentile display in an HA Lovelace card

## Out of scope
- Automation-quality / uptime scoring
- Real-time updates
- Native mobile app
- Friends / social graph

## Risks & unknowns
- Privacy perception even with aggregates-only
- Thin cohorts = meaningless rankings until enough users join
- Metric gaming; HA internal-API churn between releases

## Done means
You install the integration, enter square footage, and the next day your Lovelace card shows your percentile versus your climate-zone cohort on a live leaderboard.
