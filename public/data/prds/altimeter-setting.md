## Overview
Altimeter Setting turns the ADS-B traffic over your house into a mesoscale weather instrument. It ingests Mode S/ADS-B messages, extracts the GNSS-minus-barometric altitude difference that aircraft already transmit, and regresses those thousands of point samples into a live, animated surface-pressure field — isobars, pressure tendency, and (stretch) a wind/temperature field — over a 300 km box. For glider and paraglider pilots, storm chasers, balloonists, and anyone living in the gaps between METAR stations, it renders weather structure that official products smooth away.

## Problem
Surface analysis charts are interpolated from airport METARs spaced 50–150 km apart, updated hourly. Gust fronts, outflow boundaries, and pressure troughs live *between* those stations. Meanwhile a mid-size metro has 50–300 aircraft aloft at any moment, each a calibrated pressure sensor with a GPS receiver bolted to it, screaming its readings into the air unencrypted — and the hobbyist ADS-B community uses that firehose almost exclusively to draw little airplane icons on a map.

## How it works
ADS-B Airborne Velocity messages (DF17, TC=19) carry a *GNSS height above barometric altitude* delta field, signed, in 25 ft increments. Barometric altitude above the transition level is referenced to standard pressure (1013.25 hPa), so that delta is a direct readout of how far the real atmosphere departs from the ISA column beneath the aircraft. Convert delta → equivalent sea-level pressure via the hypsometric relation, correct GNSS height for geoid separation (EGM96 grid), attach the aircraft's lat/lon, and you have one pressure sample. Ten minutes of traffic gives you thousands, scattered along flight corridors. Fit a Gaussian-process field over a 2 km grid (Matérn 3/2 kernel, spatial + temporal lengthscales tuned against nearby METARs), march-squares the grid into isobars, and animate.

## Technical approach
Ingest from a local RTL-SDR running readsb/dump1090-fa over the Beast/JSON port, with adsb.lol and OpenSky REST as a no-hardware fallback. Decode in Python (pyModeS) into DuckDB — one Parquet-backed `samples` table (icao, ts, lat, lon, baro_alt, gnss_delta, nic, nacp) partitioned by hour; DuckDB does the windowed aggregation straight out of Parquet. QC is the real work: drop samples with NACp/NIC below threshold, drop aircraft below the transition altitude (FL180 in the US) since those are on local QNH, drop the known-bad avionics families whose delta is stuck or quantized, and despike per-airframe with a robust per-aircraft bias term (each fleet's GNSS receiver has a persistent offset — model it as a random effect, not noise). Winds are a second tier: Mode S Enhanced Surveillance BDS 5,0/6,0 give ground speed, track, true airspeed, and magnetic heading; wind vector = ground velocity − air velocity, and static air temperature falls out of the Mach/TAS pair. Front end is MapLibre + deck.gl with a time scrubber and a METAR overlay for honesty.

## v1 scope
- One OpenSky bounding-box pull, no SDR required
- Decode gnss_delta, plot colored dots per aircraft on a static map
- One scatter plot: your derived pressure vs. the nearest three METAR altimeter settings
- Ship it if the correlation is above 0.9

## Out of scope
Winds, temperature, forecasting, mobile, anything below the transition altitude, historical archive.

## Risks & unknowns
The delta field is optional and some transponders never populate it; per-fleet GNSS bias may swamp the real signal; coverage collapses at night and over rural boxes; flight corridors are a badly non-uniform sampling design, so the GP will hallucinate structure where no plane has flown — the uncertainty band has to be drawn, not hidden.

## Done means
A live map where the derived sea-level pressure at three held-out METAR stations tracks their reported altimeter setting within 1.5 hPa RMS over a 24-hour window, and a passing cold front is visibly a moving line on screen before those stations report it.
