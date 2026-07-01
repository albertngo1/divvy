## Overview
Wet Bulb is a B2B SaaS for construction, landscaping, roofing, agriculture, and events companies that schedules outdoor labor around heat-stress risk. It converts weather forecasts into WBGT (wet-bulb globe temperature) and maps them to physiological risk thresholds, producing recommended work/rest cycles and an audit log for OSHA compliance.

## Problem
Heat kills workers, and new OSHA heat rules plus the mortality-from-ambient-temperature research mean employers now carry real liability. But foremen still eyeball 'it's hot today' with no defensible method, no records, and no way to reschedule crews before someone collapses. Insurers and lawyers ask 'what was your heat plan?' and the answer is nothing.

## How it works
A manager adds job sites (lat/long) and crew profiles (acclimatized or not, PPE load). Each morning Wet Bulb pulls the forecast, computes WBGT, and returns a color-coded timeline per site: green work windows, yellow mandatory-water-break cadence, red stop-work. Crews clock the rest breaks in a mobile check-in; the system stores an immutable record: forecast, thresholds applied, breaks taken. If a site goes red, the manager gets an alert to shift work earlier or indoors.

## Technical approach
Stack: Next.js + Postgres + a small Python worker for the meteorology. Data sources: NOAA/NWS gridded forecast API (free) or Open-Meteo for temp, humidity, wind, solar radiation. WBGT approximated via the Liljegren model (or Bernard's simplified indoor/outdoor formulas) using radiation + wind. Data model: `site`, `forecast_hour` (wbgt, source, computed_at), `threshold_set` (per ACGIH/OSHA work-rest table keyed on acclimatization + metabolic load), `break_log`. Core algorithm: join hourly WBGT against the ACGIH work/rest table to emit allowed work-minutes per hour. The genuinely hard part is defensible WBGT from public data — true WBGT needs a black-globe sensor; estimating radiant load from cloud cover and solar angle is where accuracy (and liability) lives.

## v1 scope
- Add a site by address, get today's hourly WBGT timeline
- One ACGIH work/rest table, acclimatized default
- Stop-work push alert when WBGT crosses red
- Exportable PDF of the day's plan + thresholds used

## Out of scope
- Wearable/body-temp integration
- Payroll or time-tracking
- Multi-region regulatory tables beyond US OSHA/ACGIH

## Risks & unknowns
- WBGT estimated from forecast may diverge from on-site reality → optional cheap sensor later
- Regulatory table interpretation is nuanced; wrong advice is a liability
- Sales cycle to SMB contractors is slow

## Done means
A contractor enters a job-site address on a 95°F humid day and receives an hourly timeline showing WBGT, a red stop-work window from 1–4pm, and can export a one-page PDF documenting the thresholds applied and breaks scheduled.
