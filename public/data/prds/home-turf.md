## Overview
Home Turf is a browser tool for survival-game fans and map tinkerers that turns any real-world address into a top-down, tile-based survival map — Project Zomboid / Unturned aesthetic — built from open geographic data. Your street, your cul-de-sac, the gas station on the corner: all rendered as a lootable, defensible apocalypse arena, with your own house flagged as the spawn safehouse.

## Problem
Survival games ship with fictional towns (Muldraugh, PZ's Louisville). The fantasy everyone actually wants is "could I survive the apocalypse *here*, on my block?" — but hand-building your neighborhood in a map editor is hours of tedium. Meanwhile QGIS/OSM hold a perfect free digital twin of every street on Earth, unused for play.

## How it works
You type an address or drop a pin. The tool pulls a ~1km² bounding box of OSM data, classifies features (buildings, roads, water, parks, fences, parking), and renders a grid map: buildings become enterable footprints, roads become walkable tiles, tree/park polygons become cover, big-box stores get flagged as high-loot POIs. Your pinned building becomes the safehouse (green marker). A simple deterministic pass scatters loot tiers and zombie-density heatmaps weighted by building type (hospital/pharmacy = high loot + high risk; residential = low/low). You can toggle a "night" overlay and export the map as PNG + a JSON "scenario" file.

## Technical approach
Stack: static site, Leaflet or plain Canvas, Vite. Data: Overpass API (`overpass-api.de/api/interpreter`) for OSM features; optional SRTM/Mapzen elevation tiles for a contour underlay. Pipeline: Overpass QL query by bbox → GeoJSON → project to a fixed tile grid (e.g. 4m/tile) → rasterize polygons to a typed 2D array (`Uint8Array` of tile classes) → color-map to canvas. Loot/zombie placement is a seeded PRNG (mulberry32 seeded from the lat/long hash) so a given address is reproducible. Hard part: Overpass rate limits and messy real-world geometry — multipolygons, buildings with holes, roads without width tags — need robust polygon rasterization (use `polygon-clipping` / a scanline fill) and sane defaults for missing tags.

## v1 scope
- One address in → one PNG map out
- Four tile classes: building / road / green / water
- Safehouse marker on the pinned building
- Seeded loot-POI dots on commercial buildings

## Out of scope
- Actual playable game loop, movement, AI
- 3D, elevation rendering, interiors
- Multiplayer, saving accounts

## Risks & unknowns
Overpass timeouts on dense urban bboxes; OSM coverage is thin in some suburbs/rural areas; tile scale that looks good in a city may be absurd in the countryside. Mild ethical note: don't market it as "scout your ex's house."

## Done means
Enter my home address, click Generate, and within 15 seconds see a recognizable top-down tile map of my real block with my house marked green and the nearby grocery store marked as a loot POI — exported as a shareable PNG.
