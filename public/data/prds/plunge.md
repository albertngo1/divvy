## Overview
Plunge is a self-hosted scheduler + scoreboard for people with always-on home infrastructure (NAS, media transcoders, backups, ML boxes). It treats cheap-or-negative electricity windows as *loot* and your batch jobs as a heist crew, then keeps a running ledger of money and carbon you clawed back over the year.

## Problem
Dynamic tariffs (UK Octopus Agile, Australia's new free-daytime windows, US wholesale via gridstatus/WattTime) now regularly hit near-zero or *negative* prices — you literally get paid to consume. But almost nobody reschedules their deferrable loads to catch them, because doing it by hand is tedious and invisible. The savings feel abstract, so the behavior never sticks.

## How it works
You tag jobs as deferrable with a deadline and an estimated kWh (`plunge run --by 07:00 --kwh 0.4 -- restic backup ...`). Plunge polls your tariff API, forecasts the cheapest feasible window before each deadline, and holds the job in a queue until the window opens — or fires immediately on a negative-price alert. Every completed job records price × kWh into a ledger. A weekly digest ranks you and opted-in friends by "kWh harvested below median price" and total $ saved, with a badge for any job run during a negative-price tick.

## Technical approach
- **Stack:** Go single binary + SQLite; a tiny embedded web dashboard (htmx).
- **Data sources:** Octopus Agile REST (`/products/.../standard-unit-rates/`, free, half-hourly, includes negative), UK Carbon Intensity API (no key), AEMO/Amber for AU, gridstatus/WattTime for US. Pluggable provider interface.
- **Scheduler:** jobs are a priority queue keyed by deadline; a solver picks the min-cost contiguous slot from the published forward curve, re-planning each time new prices post. Immediate-fire path on price ≤ threshold.
- **Load estimate:** optional — read actual draw from a smart plug (Tasmota/Shelly MQTT) or Prometheus node metrics to reconcile estimated vs real kWh.
- **Leaderboard:** friends push a signed daily summary row to a shared endpoint (or a gist); no raw job data leaves the box.
- **Hard part:** planning against a *partial* forward curve — future prices aren't fully known at deadline-minus-N, so you need a stop-rule (secretary-problem style) balancing "wait for cheaper" vs deadline risk.

## v1 scope
- One provider (Octopus Agile).
- `plunge run` wrapper that delays a shell command into the cheapest window before a deadline.
- SQLite ledger + one static HTML page: this week's $ saved and a sparkline.
- Manual kWh estimates only.

## Out of scope
- Real-time metering, battery/EV optimization, solar export.
- Multi-provider, mobile app, actual money settlement.

## Risks & unknowns
- Tariff APIs vary wildly per country; the abstraction may leak.
- Users on flat tariffs get nothing — needs a "simulate savings" mode to hook them.
- Deferring backups past a deadline is dangerous; deadline must be a hard guarantee, not best-effort.

## Done means
A tagged `restic` backup, told to finish by 07:00, provably waits and executes inside the cheapest half-hour of the overnight curve, and the ledger shows the correct $ and kWh for that run versus the day's median price.
