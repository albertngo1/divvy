## Overview
Runoff is a single-player browser roguelike whose dungeon is real terrain. You enter an address, and the game builds a run out of the actual downhill flow path from that point: every reach between confluences is a room, every dam is a boss, and the ocean (or a terminal sink) is the final floor. For people who like roguelikes and have never once wondered where their rain goes.

## Problem
Procedural roguelike maps are forgettable because they mean nothing — no player remembers room 7. Meanwhile the actual landscape under your house is stranger than anything a generator produces, and completely invisible: almost nobody can name the creek their gutter feeds. Existing raindrop-path visualizers show you a flyover cutscene; there is no reason to care about any of it.

## How it works
Drop a pin. The game traces the flow path and converts it into 10–25 rooms. Your stats: **Volume** (HP), **Load** (sediment and contaminants you're carrying, your inventory), **Speed** (derived from real reach gradient). Flow direction is deterministic — the choices are what you do inside a reach, not where you go. Each turn: *scour* (gain Load and Speed, risk stranding), *infiltrate* (regain Volume, lose Speed, risk ending the run underground), *ride* (advance cheaply). Confluences merge you with a tributary: your Load dilutes, your Volume jumps, and the room gets its real name ("you are now Coon Creek"). Reservoirs are boss rooms — you must accumulate enough Volume to spill or you sit in stratified water losing turns. Municipal intakes strip your Load entirely. Death is evaporation or infiltration: "you are groundwater; check back in 4,000 years." A run is 10–20 minutes; meta-progression unlocks per HUC-8 watershed reached.

## Technical approach
Elevation from Terrain-RGB tiles (AWS/Mapzen open terrain tiles, elevation decoded from PNG channels) for speed; USGS 3DEP 1/3 arc-second via The National Map for accuracy mode. In a Web Worker over a stitched 2048×2048 grid: depression-fill with Priority-Flood (Barnes 2014), D8 flow direction, flow accumulation by topological sort over the D8 tree. Cells above an accumulation threshold are channels; threshold crossings define reach boundaries. Real names and reach metadata come from the USGS NLDI API (`/linked-data/comid/position?coords=POINT(lon lat)`, then `navigation/DM/flowlines`); dams joined by proximity from the National Inventory of Dams CSV. Rendering is a 2.5D isometric strip in canvas with a corner minimap. Data model: `Run { rooms: Reach[] }`, `Reach { comid, name, gradient, accumulation, hazards[] }`.

Hard part: filling depressions across lazily-loaded tile boundaries without seam artifacts when the path leaves the grid mid-run, and making a *deterministic* route feel like a game — the answer is that the resource budget branches, not the map.

## v1 scope
- Terrain-RGB tiles only, no NLDI, no dams
- One address, one 2048px tile, run ends when the path exits the tile
- 3 verbs, 10 rooms, text log plus minimap
- No meta-progression, no save

## Out of scope
Multiplayer, mobile, real rainfall/streamflow data, worldwide DEM coverage, sharing runs.

## Risks & unknowns
D8 on 10 m DEM routes badly through flat urban areas and storm sewers it cannot see. NLDI rate limits and CORS. Whether the choice set is deep enough to survive three runs.

## Done means
Typing a real US address yields a playable run of ≥8 reaches ending in a named river or the ocean, in under 15 minutes of play, with the traced path matching USGS River Runner to within one reach.
