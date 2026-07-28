## Overview
Third Row is a web route planner whose objective function is nausea, not time. You enter A→B, it returns 3–5 real driving routes each with a Motion Sickness Dose Value (MSDV), an estimated share of passengers who'd feel symptoms, and a strip chart showing *where* the bad kilometers are. For parents, people with vestibular disorders or migraine, rideshare/AV fleet operators, and anyone who reads in the car.

## Problem
Every routing engine optimizes time, distance, or tolls. None optimize comfort, even though carsickness is a well-characterized physical response: it's driven mostly by low-frequency (0.1–0.5 Hz) lateral and vertical acceleration and by yaw from turns. That signal is *derivable from road geometry* — curvature, grade, speed limits — which means the winding shortcut that ruins a family trip is predictable in advance and nobody surfaces it.

## How it works
1. Geocode A and B, request alternatives from a self-hosted OSRM/Valhalla instance on an OSM extract.
2. Resample each route's geometry to 5 m spacing. Chaikin-smooth to kill OSM node quantization, then compute curvature κ at each sample from the circumscribed circle through sliding triples.
3. Build a speed profile: min(maxspeed tag, comfort limit v = sqrt(a_max/κ) with a_max ≈ 1.8 m/s²), then forward/backward pass for realistic accel/braking limits.
4. Derive the acceleration time series: lateral a_y = v²κ, longitudinal from dv/dt, vertical from grade change using SRTM/3DEP elevation.
5. Resample to 20 Hz, apply the ISO 2631-1 **Wf** motion-sickness frequency weighting as a bilinear-transformed biquad cascade (band ~0.08–0.63 Hz), then MSDV = sqrt(∫ a_w² dt). Combine vertical, lateral and yaw-rate terms as a weighted sum.
6. Render: routes ranked by dose, a per-kilometer strip chart, and a "worst 60 seconds" callout with a map highlight.
7. Optional calibration: record a drive with your phone's IMU, self-report a 0–10 nausea rating, and fit your personal sensitivity coefficient by least squares.

## Technical approach
Python/FastAPI + numpy/scipy for the DSP, OSRM in Docker with a Geofabrik extract, DuckDB for cached route features, MapLibre + Observable Plot for the front end. The genuinely hard part is validation: MSDV was standardized on vertical ship motion, so the lateral/yaw weights are the whole ballgame and need labeled drives. v1 therefore ships as an explicitly *relative* ranking with the absolute number labeled uncalibrated, plus the phone-calibration loop to earn absolute numbers later.

## v1 scope
- One city's OSM extract, one OSRM instance
- 3 route alternatives, lateral acceleration only (no elevation, no yaw term)
- One MSDV number + one strip chart per route
- No accounts, no saved routes, no mobile app

## Out of scope
Live traffic and rerouting, transit/cycling, per-vehicle suspension models, medical advice, native apps.

## Risks & unknowns
OSM `maxspeed` coverage is patchy; drivers don't obey the comfort speed model; the lateral weighting may be materially wrong in absolute terms; curvature from OSM nodes is noisy on ramps and roundabouts.

## Done means
For 20 hand-picked A→B pairs in one city where both a winding and a straight route exist, the tool ranks the straight route lower-dose in at least 18, and a phone-IMU recording of one such pair driven both ways reproduces the same ordering of measured Wf-weighted MSDV.
