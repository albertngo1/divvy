## Overview
Basecamp is a slow, permadeath roguelike for people who move outdoors. The dungeon is a real mountain — a Colorado fourteener, Rainier, or a peak you pick — reconstructed from public elevation data. You can only ascend by feeding it the vertical gain you accumulate in real life via Garmin or Strava. It is a climbing sim you cannot grind at a desk.

## Problem
Most fitness-gamification apps convert exercise into abstract XP or a cartoon avatar. The feedback loop is fake and it shows: you stop caring in a week. And endurance goals ("summit all 58 fourteeners") are inspiring but formless day-to-day. Basecamp binds a genuinely tense game to genuinely earned effort — the mischief is that there is no way to cheat progress except to go climb some stairs.

## How it works
You pick a real peak. Basecamp renders its ridge as a node graph: campsites, traverses, exposed pitches, false summits. Each edge costs *acclimatization points*, and 1 AP ≈ some real meters of vertical you climbed today (walking stairs, hiking, cycling — all count). The twist is a physiology layer: ascend faster than your rolling acclimatization allows and you accrue altitude-sickness risk; push into the red and a dice check can trigger HAPE — permadeath, run over, mountain resets. So you must bank real vert *and* pace your in-game ascent. Weather rolls (from real forecast data for the peak) can pin you at a camp for days. Reaching the true summit ends the run with a shareable card.

## Technical approach
Stack: a PWA (React + TypeScript, IndexedDB). Terrain from USGS 3DEP 1-meter DEM tiles (or SRTM globally) via the National Map API; extract the summit ridge with a least-cost path over the DEM raster and snap game nodes to real coordinates, rendering a stylized 2.5D profile with regl/canvas. Activity data pulled from Strava (`get_activity_streams` altitude series) or Garmin (`get_floors`, elevation gain per activity) on a nightly sync. Acclimatization uses a simplified Lake Louise / exponential-adaptation model: a per-altitude adaptation reservoir that fills with time-at-altitude and drains with rapid ascent. Weather from the NWS point forecast API keyed on node lat/lon. Hard part: turning a noisy DEM into a fun, legible, *fair* node graph — and calibrating the AP↔meters exchange so a normal week of activity feels like meaningful but non-trivial progress.

## v1 scope
- One hardcoded peak (Longs Peak) as a hand-tuned node graph
- Strava OAuth, nightly vert sync, manual "log gain" fallback
- Acclimatization + a single altitude-sickness permadeath check
- Summit card export

## Out of scope
- Arbitrary peak picker / automated DEM→graph pipeline
- Multiplayer, expeditions, gear/loot systems
- Live weather (use a static seasonal table first)

## Risks & unknowns
- Exchange-rate calibration is make-or-break; too grindy or too easy kills it
- Permadeath after weeks of real effort may feel punishing rather than tense — needs a "turn back to camp" escape valve
- API rate limits and users with no wearable

## Done means
On a fresh account, syncing a real week of Strava activity advances my position up Longs Peak by a plausible number of nodes, a deliberately reckless ascent triggers a HAPE permadeath, and reaching the summit produces a shareable card with my real total vertical.
