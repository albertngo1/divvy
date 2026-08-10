## Overview
Plate Reader is a local-first, in-browser explorable that takes your own year of location history and re-renders it from the perspective of the ALPR (automated license-plate reader) network you drove through. It is for anyone who read a Flock-camera-misuse story and thought "how much could they actually see?" — and for journalists and city-council gadflies who need a concrete, personal artifact instead of an abstract argument.

## Problem
Surveillance-camera coverage maps are static dots. They don't answer the only question that matters: *what could someone infer about me from those dots?* Nobody has an intuition for how few hits it takes to pin a home address. The abstract map produces a shrug; the personal reconstruction produces a reaction.

## How it works
1. Drop in a Google Takeout `Semantic Location History` folder (or a GPX/Strava archive). Nothing leaves the browser.
2. The app fetches ALPR camera positions for your metro — Overpass query `node["man_made"="surveillance"]["surveillance:type"~"ALPR"]`, the tag schema DeFlock crowdsources into OSM — plus the EFF Atlas of Surveillance CSV for agency attribution.
3. Your traces are map-matched to the road graph, then each camera is modeled as a directional cone (`camera:direction` where tagged, 60 m omnidirectional otherwise). Every crossing becomes a *hit*: (camera_id, timestamp, heading).
4. Now the mischief: throw away your GPS. Using only the hit list, run the inference an agency would run — a hit within 400 m of a 02:00–06:00 dwell gap scores as home candidate; recurring 08:00–09:00 hits on a stable corridor terminus score as work; day-of-week periodicity yields a routine. Show reconstruction vs. truth side by side, with the error in meters.
5. A density slider: "if only 30% of these cameras pooled data…" re-runs the inference on a random subset, so you watch identifiability curve up as network density grows.

## Technical approach
Vite + TypeScript, MapLibre GL + deck.gl (`TripsLayer` for the replay, `ScatterplotLayer` for cameras). Parsing and matching run in a Web Worker over a typed-array trace of `{lat, lon, t}`. Map matching: nearest-segment with hysteresis against an OSM extract, good enough at ALPR spacing; Valhalla Meili as an optional server upgrade. Cameras go in a KD-tree for radius queries. Home inference is DBSCAN over night-adjacent hits weighted by recency. The genuinely hard part is honest uncertainty — DeFlock coverage is patchy, so every result must be framed as a floor, with a stated "cameras we know about" count.

## v1 scope
- One metro area, hardcoded Overpass query, cached camera GeoJSON
- Google Takeout JSON only
- Total hit count, top-10 cameras by hits, one home-location guess with an error radius
- Static map, no time scrubber

## Out of scope
Route planning to avoid cameras. Any upload or account. Non-ALPR camera types. Mobile.

## Risks & unknowns
DeFlock/OSM coverage varies wildly by city — a low hit count may mean unmapped cameras, and the UI must say so. Takeout's semantic format changes. Overstating reconstruction confidence would make the tool the thing it critiques.

## Done means
I load my own year, and the app reports "N cameras logged you M times; from those hits alone, the top home guess is within X meters of your actual address" — with X verifiably under 300 m.
