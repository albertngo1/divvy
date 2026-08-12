## Overview
A macOS menubar toy that converts a global abstraction into your own sidewalk. Pick a glacier with a measured front-variation record — Rhône, Columbia, Athabasca, Exit — and the app maps its cumulative retreat onto a walking path starting at your front door. The menubar shows one line: `Columbia Glacier — 14.2 km · now past the laundromat on Willow`. It advances every day, in real proportion to the real retreat rate.

## Problem
"The glacier retreated 14 kilometers since 1980" is a number that bounces off. Nobody has a mental ruler for 14 km. Everyone has a perfect ruler for "past the laundromat, halfway to my sister's place." Existing climate dashboards render more charts at people who have already seen charts.

## How it works
1. First run: enter an address (geocoded locally), pick a glacier and a start year.
2. The app builds a walking path outward from your address by BFS over the OSM street graph, preferring named ways and collecting named POIs along it, out to ~40 km of path length.
3. Cumulative retreat since the start year is measured along that path. The menubar shows the total plus the nearest named landmark the front has passed.
4. It keeps moving: the current rate (m/yr, from the last decade of the record) is converted to mm/day and the marker advances continuously. Fast glaciers move a visible block or two per month.
5. Click the menubar item for a small map: your house, the path, the marker, and the last five landmarks with the dates the ice passed them.
6. An honest footer, always visible: retreat is measured along the glacier's flowline, not your street — this is a ruler, not a map.

## Technical approach
Swift + SwiftUI menubar app (`MenuBarExtra`), no server. Glacier data ships bundled: the WGMS Fluctuations of Glaciers front-variation series (CSV, annual cumulative front change per glacier ID) for ~20 hand-picked, well-instrumented glaciers, plus GLIMS outlines for the map thumbnail. Street data comes from one Overpass API query at setup time (`way[highway~"^(residential|tertiary|secondary|footway)$"]` plus `node[amenity]` within a 40 km bbox), cached to a local SQLite file so the app is offline forever after. Path building: build an adjacency graph from way nodes, run a modified BFS that maximizes cumulative distance while penalizing turns, then snap named POIs to path-distance offsets via nearest-segment projection. Data model: `Glacier(id, series[year→cumulative_m], rate_m_per_yr)`, `Path(points[], milestones[(offset_m, name)])`, and a single `Marker(offset_m)` derived from `series` interpolated to today. The hard part is the path: BFS over real OSM geometry loves to loop back on itself or dead-end in a cul-de-sac, so it needs a monotone-outward constraint (each step must increase straight-line distance from home) plus a fallback when the neighborhood runs out of connected streets.

## v1 scope
- Three bundled glaciers, one start year (1980), one address
- Menubar string only: total km + nearest passed landmark
- Map popover is a static rendered PNG, not interactive
- Daily update on wake, no animation

## Out of scope
- Live data ingestion, arbitrary glacier picking, sea-level or wildfire equivalents
- Sharing, notifications, iOS, any account

## Risks & unknowns
WGMS series are annual and gappy — interpolation must not imply precision that isn't there. Rural addresses may not have 40 km of connected named path. Tone risk: this can slide from vivid into scolding, and the whole thing dies if it nags. Overpass rate limits at setup need a friendly retry.

## Done means
Entering a real street address produces a path with at least ten correctly named landmarks, the menubar shows a landmark whose path distance matches the glacier's cumulative retreat within 5%, and the marker demonstrably advances after skipping the system clock forward 30 days.
