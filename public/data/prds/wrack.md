## Overview
Wrack is a mobile-friendly web app that predicts *when and where* a stretch of coastline will be worth combing. It's aimed at the surprisingly large niche of beachcombers, rockhounds, and sea-glass sellers who currently rely on gut feel and word-of-mouth. The name is the wrack line — the tide-deposited debris band where the good stuff lands.

## Problem
A German button-maker once combed Midwest rivers for the exact shell beds that could make a fortune; today's beachcombers do the same blind. The valuable finds concentrate after specific conditions — a storm surge that scours a beach, a big tidal range, onshore swell from the right direction — but that knowledge is tribal and scattered. Nobody sells a 'go tomorrow at 6am, low tide, north end' forecast.

## How it works
You pick a beach (drop a pin). Wrack pulls the tide curve, swell height/direction, wind, and recent storm history, and scores the next 7 days with a 'churn index': high when a recent energetic event + a low tide exposes fresh wrack. It overlays a heat hint on the beach (windward pockets, points, coves collect more). Users log finds (type, count, spot, date) which both trains the model and builds a private/shared logbook. A daily 'best window' notification tells serious combers when to set an alarm.

## Technical approach
Stack: SvelteKit + Leaflet/MapLibre, a small Postgres+PostGIS backend. Data sources: NOAA CO-OPS tides API (predictions + observed), NOAA/NDBC buoy swell + Open-Meteo marine API for wind/wave, and a storm-surge signal derived from recent significant-wave-height deltas. The churn index is a weighted feature blend (tidal range, hours since last swell spike above the 80th percentile, onshore wind component, beach aspect vs. swell direction — aspect computed from the coastline vector at the pin). The genuinely hard part is beach *aspect* and pocket geometry: I derive shoreline orientation from OSM coastline ways and bin exposure, but micro-pockets need crowd-logged corrections. Find logs feed a simple logistic 'good day' calibrator per beach once enough data exists.

## v1 scope
- Pin a beach, see a 7-day churn score with the reasoning shown
- Tide + swell + wind pulled live and cached daily
- Log a find (type, count, photo optional)
- One 'best window tomorrow' push per followed beach

## Out of scope
- Legality/permit checks per beach (link out only)
- Species ID from photos
- Social feed / marketplace

## Risks & unknowns
- The churn index may be noise until enough finds validate it; cold-start beaches have no ground truth.
- Marine APIs have coarse coastal resolution; nearshore transforms are approximated.
- Collecting restrictions vary wildly (protected fossils, park rules) — must disclaim, not advise.

## Done means
For three seeded test beaches, Wrack renders a 7-day churn forecast with visible drivers, lets a user log a find that persists, and fires exactly one morning notification when the next-day score crosses threshold.
