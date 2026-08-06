## Overview
Halo Odds is a personal forecast service for atmospheric optics. Weather apps tell you whether it will rain. Halo Odds tells you that on Thursday at 08:40 there is a 61% chance of a circumzenithal arc directly over your house, and that you have a 12-minute window before the sun climbs past the geometry that allows it. For sky watchers, photographers, pilots, and teachers who want a reason to look up.

## Problem
Halos, parhelia, sun pillars, and circumhorizontal arcs are common — a 22° halo is visible somewhere over most people ~100 days a year — but almost nobody sees them, because nobody is looking at the right patch of sky at the right time. The phenomena are *predictable*: each one requires a specific ice-crystal habit, a specific crystal orientation, and a hard solar-elevation gate. All three are derivable from data that is already free. No consumer product does this.

## How it works
You enter a location. The service pulls the latest global forecast, extracts the cirrus-level ice fields, infers what shape the ice crystals will be, checks the sun/moon geometry minute by minute, checks whether your local terrain blocks the relevant patch of sky, and emits a ranked list of phenomena with time windows, altitude/azimuth to look at, and a confidence. Push notification at T-45min.

## Technical approach
- Forecast ingest: NOAA GFS 0.25° via the NOMADS GRIB filter (`filter_gfs_0p25.pl`), fields `CIMIXR` (cloud ice mixing ratio), `TMP`, and `RH` on the 400–150 hPa levels; HRRR for CONUS short range. Parse with `cfgrib`/`xarray`.
- Habit inference: the Bailey & Hallett habit diagram maps temperature and ice supersaturation to crystal habit. Plates form roughly -8 to -22 °C; columns colder. Plates that fall slowly enough orient horizontally — that orientation is what makes sun dogs, sun pillars, and circumzenithal arcs; random columns make the plain 22° halo.
- Geometry gates (deterministic, from `skyfield`): circumzenithal arc requires solar elevation < 32.2°, peaking near 20°; circumhorizontal requires > 57.8°; parhelia split away from 22° as the sun rises; green flash needs a sea/flat horizon plus a strong low-level inversion (from the sounding's lapse rate).
- Horizon occlusion: ray-march Copernicus GLO-30 DEM outward on 360 azimuths to build a per-degree horizon-altitude profile; suppress any phenomenon whose sky patch is behind terrain.
- Model: a hand-built rule score per phenomenon, logistic-calibrated later against user-confirmed sightings (a one-tap "saw it / didn't" button is the training set).
- Hard part: crystal habit and orientation are not NWP outputs, and cirrus is the least skillful part of any global model. The forecast is honest only if it reports its own uncertainty.

## v1 scope
- One hardcoded location, one cron job, static HTML output.
- Three phenomena only: 22° halo, sun dogs, circumzenithal arc.
- GFS only. No HRRR, no DEM — assume a flat horizon.
- Email at 06:00 local if any phenomenon scores > 0.4 today.

## Out of scope
- Lunar halos, moon dogs, glories, Brocken spectres.
- A mobile app, accounts, or payments.
- Nowcasting from satellite imagery.

## Risks & unknowns
- Cirrus skill may be so poor that the forecast is barely better than climatology; if so, pivot to a 6-hour nowcast off GOES-19 ABI band 14 rather than a 14-day forecast.
- No labeled ground truth exists at scale; calibration depends on a handful of users reporting honestly.
- NOMADS rate limits and GRIB parsing are tedious but not risky.

## Done means
Thirty consecutive days of forecasts logged with sighting confirmations, and the Brier score for "22° halo today" beats the seasonal base rate for that location by a margin you can state out loud.
