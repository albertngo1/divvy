## Overview

A macOS menubar app for renters, plant keepers, cat owners, and anyone who works next to a window. You spend two minutes describing your room (one rectangle, one window, which wall it's on), and from then on the menubar shows a live top-down outline of the direct-sun patch on your floor, plus a one-line prediction: "off the desk in 22 min." It quietly accumulates minutes-of-direct-sun per floor cell all year, so by December you have a printable insolation floorplan of your own apartment.

## Problem

Everybody knows "the light is good in the morning." Nobody knows where the sun patch will be at 4pm on November 12th. So the fiddle-leaf fig goes in a spot that gets sun in July and nothing from October, the monitor gets glare for six weeks a year, and the only way to learn your apartment's light is to live in it for four seasons. Sun-position apps show you an azimuth arrow over a map; none of them project the actual aperture onto the actual floor.

## How it works

1. Setup: pick your building on a map (the app derives lat/lon and lets you click the wall the window sits in, giving true azimuth), enter window width/height/sill height and ceiling height, drag in a few furniture rectangles.
2. Every minute, compute solar altitude/azimuth, project the window quad onto the floor plane, clip against walls and furniture, draw the resulting polygon in the menubar popover.
3. Predict: the same math run forward gives "enters the chair at 15:41, leaves at 16:20" and "this spot next gets sun on Feb 3."
4. Accumulate: each minute of realized direct sun (gated by measured cloud cover) increments a 5cm grid. Scrub a date slider, or export the year as a poster.

## Technical approach

Swift + SwiftUI menubar app. Solar position via a port of the NREL SPA algorithm (~200 lines, ±0.0003° accuracy) rather than a rough NOAA approximation, because patch edges are sensitive. Because the sun is effectively at infinity, floor projection is an affine shear of the window quad along the sun vector — no ray tracing needed; clipping is Sutherland–Hodgman against room and furniture polygons. External occlusion is the genuinely hard part: fetch OSM building footprints with `building:levels` within 300m via Overpass, extrude at 3m/level, and reduce to a horizon-altitude-per-azimuth profile (1° bins); let the user override any bin by dragging. Cloud gating uses Open-Meteo's hourly `direct_normal_irradiance` for the location — accumulate potential and realized separately. Storage: a 5cm uint32 grid per month as 16-bit PNG plus a JSON sidecar of room geometry.

## v1 scope

- One room, one rectangular window, floor only
- Manual single horizon altitude (one number) instead of OSM occlusion
- Menubar popover: current patch outline + next enter/leave countdown
- Yearly accumulator grid + PNG export

## Out of scope

Multi-room, patches on walls/ceiling, reflected and diffuse light, skylights, blinds, iOS, photometric units.

## Risks & unknowns

Setup UX makes or breaks it — if getting window azimuth right takes more than two minutes nobody finishes. Magnetic vs true north confusion, DST boundary bugs, and users with deep balconies whose real occlusion is nothing like a single horizon number.

## Done means

On a clear day, tape the predicted patch outline on the real floor at 10:00, 13:00, and 16:00; every corner is within 15cm of the actual sunlight edge. The accumulator, after 30 days, visibly distinguishes the permanently-shaded corner from the window-side strip.
