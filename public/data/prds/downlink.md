## Overview
Downlink is a B2B monitoring service for organizations whose operations quietly ride on free public weather data: solar forecasters, drone/UAS operators, agriculture platforms, marine logistics, event insurers, and the long tail of weather-API resellers. It is a meta-monitor — not another weather API, but an uptime/health layer over the ones you already pull.

## Problem
GOES-19 dropping into Safe Hold is the itch. Teams build pipelines on NWS/NDFD, GOES ABI imagery, MRMS, and NOMADS model runs assuming they're always there. When a satellite degrades, a model run is late, or an endpoint 500s at 3am, the failure is silent: stale data flows downstream and forecasts are subtly wrong for hours before anyone notices. There's no PagerDuty for 'the sky data stopped.'

## How it works
You pick the sources you depend on (GOES-East ABI, HRRR on NOMADS, NWS gridpoint API, MRMS, buoy/METAR). Downlink polls each on its expected cadence, measures freshness (age of latest product vs. nominal update interval), latency, and payload sanity (does the GRIB decode? is the image not all-fill-value?). It computes a per-source health score and a composite 'sky status.' Anomalies trigger webhooks/Slack/email plus a plain-English failover hint ('GOES-East ABI 4h stale — switch imagery to GOES-West or Himawari'). A public/embeddable status page shows history and incident timelines.

## Technical approach
Stack: a Python (FastAPI) poller fleet + Postgres/TimescaleDB for freshness time-series + a small Next.js status UI. Sources: NWS api.weather.gov, NOMADS HRRR/GFS GRIB2 (cfgrib/eccodes to validate decode), GOES ABI via NOAA's public S3 buckets (check newest object timestamp per band), MRMS, NDBC buoys. Core algorithm: per-product expected-interval model with a rolling median + MAD to flag 'late' without false alarms on normal jitter; image sanity via fill-value ratio thresholds. Hard part: building an accurate nominal-cadence catalog per product (many undocumented) and distinguishing a genuine outage from routine maintenance windows and orbital housekeeping.

## v1 scope
- Monitor exactly 5 hand-picked sources (NWS API, HRRR/NOMADS, GOES-East ABI S3, MRMS, NDBC)
- Freshness + decode-sanity checks only
- One webhook + email alert channel
- A single-tenant status page

## Out of scope
- Actually re-hosting or serving weather data
- Automated failover execution (we only recommend)
- Non-US sources (ECMWF, Himawari) beyond a hint string

## Risks & unknowns
- Cadence catalog accuracy → alert fatigue if wrong
- Willingness to pay for a 'meta' monitor vs. rolling your own cron
- NOAA endpoint terms/rate limits at scale

## Done means
When I artificially delay/stub the HRRR poll past its expected interval, Downlink flips that source red within one cycle, fires a webhook with a correct failover hint, and the status page logs an incident with start time — all within 60 seconds of the simulated stall.
