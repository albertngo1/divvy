## Overview
Ruderal is a desktop toy — a small always-on window or macOS screensaver — showing one 10m × 10m patch of degraded ground somewhere near your actual address. It runs at 1 real day ≈ 1 simulated week, so it's a thing you glance at, not a thing you play. It's for people who like watching succession happen: gardeners, restoration nerds, anyone whose HN tab about a São Paulo lot becoming a forest stayed open for a month.

## Problem
Every idle garden game hands you a seed catalog and a plant button, which is the exact opposite of how land actually revegetates. Real ecological restoration is mostly *managing disturbance*: you don't plant a meadow, you mow it at the right week for four years and the meadow arrives. Nobody has made a toy where the interesting decision is what to remove and when. Also, the species that show up in these games are generic cartoon flowers, when GBIF will hand you the real 40-species pool for your specific county for free.

## How it works
On first run it asks for a ZIP code. It builds a species pool by querying GBIF occurrences within a 25km radius for tracheophytes with ≥5 records, joins to USDA PLANTS for growth habit/duration/native status, and to TRY-style trait defaults for max height, seed mass, and shade tolerance. Every plant is placed on Grime's CSR triangle (competitor / stress-tolerator / ruderal) from those traits.

The patch starts bare. Seed rain arrives weekly, weighted by regional abundance and dispersal mode; germination gates on real weather pulled from Open-Meteo for your coordinates (growing degree days, soil moisture from precipitation minus a simple bucket-model ET). Individuals compete for light on a 100-cell grid using a height-ordered canopy occlusion pass — tall shades short, shaded plants lose carbon and die. Left alone for a year you get a monoculture of one aggressive competitor, usually an invasive, and that's the whole lesson.

Your verbs: **mow** (cuts everything above a height you set), **burn** (kills by bark thickness, triggers fire-cued germination), **flood**, **graze** (removes preferentially by palatability). Each is a click, each has a cooldown, and timing relative to each species' flowering week is what decides whether you're selecting for the goldenrod or against it. Nothing tells you the right week. You learn it by losing three simulated years.

## Technical approach
Tauri (Rust core + a small canvas/WebGL front end) so it can idle at near-zero CPU and ship as a screensaver bundle. State: a Vec of individuals `{species_id, x, y, height, biomass, age, seedbank_contrib}` plus a per-cell seedbank array; one tick = one sim week, cheap enough to run 500 ticks instantly when you reopen it after a week away (catch-up integration against archived Open-Meteo history, not fabricated weather). Species pool cached to SQLite on first fetch so it works offline forever after. Rendering is deliberately flat: 2D top-down silhouettes with per-species color and simple L-system stems, no 3D.

The genuinely hard part is trait data coverage — GBIF gives you names, not heights. Fallback chain: TRY summary values → congener mean → growth-habit default, with a visible "guessed" marker on any species using tier 3.

## v1 scope
- One patch, one biome, US ZIP codes only
- Mow and burn only; flood/graze later
- 40-species cap on the pool
- Windowed desktop app; screensaver packaging later

## Out of scope
Multiple patches, soil chemistry, trees over 5m, sharing, mobile.

## Risks & unknowns
GBIF occurrence data is observation-biased toward showy roadside species, which may actually be *correct* for a disturbed lot — needs a sanity check with a real botanist. Ecological realism vs. watchability: true succession is boring for the first two sim years.

## Done means
From a cold ZIP-code start, three different US regions produce visibly different patches after 5 simulated years, and a mow-timing change of ±3 weeks flips which species dominates.
