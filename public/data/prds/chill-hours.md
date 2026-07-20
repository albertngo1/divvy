## Overview
Chill Hours is an ambient desktop wallpaper (and optional framed poster export) for gardeners and climate-curious people. Over a full year it germinates a slow, self-composing garden whose species appear only when your location's actual accumulated heat and cold cross the real horticultural thresholds those plants need.

## Problem
The BBC story about bananas fruiting in a Rayleigh garden after 15 years is the itch: hardiness is shifting under our feet, but nobody watches it happen. Gardeners guess planting windows from stale zone maps; the year-over-year creep is invisible. There's no calm, personal artifact that says 'this became possible here, this year.'

## How it works
Daily the app pulls your local weather and updates two running accumulators: Growing-Degree-Days (Σ max(0, mean_temp − base)) and winter Chill-Hours (hours between ~0–7°C). Each plant in a curated library has real requirements — chill-hours to break dormancy, GDD to fruit, a cold-hardiness floor. As accumulators cross a plant's thresholds, a seed on the wallpaper germinates and grows a small illustrated sprite; plants whose floor your winter *undershot* wilt. By December you have a living almanac: a border of what thrived, a 'newly viable this year' shelf (the banana moment), and a faint ghost row of species now marginal.

## Technical approach
Menubar app: Electron or a Rust/Tauri wallpaper renderer; a launchd/cron daily job. Weather from Open-Meteo (free, no key: daily tmin/tmax, hourly temps for chill-hours) keyed to lat/long. Data model: `plant {name, base_temp, gdd_to_fruit, chill_hours_required, hardiness_floor_c, art}` seeded from RHS/USDA hardiness data and university extension GDD tables. State is an append-only per-day JSON of accumulators so the garden is fully reconstructable/replayable. Rendering: layered SVG/canvas sprites with deterministic per-plant growth curves driven by accumulator fraction. Hard part: correct, defensible phenology — chill-hour models (simple 0–7°C vs. Utah model) and GDD base temps vary per species, so the curated library must cite sources and pick one model consistently.

## v1 scope
- Daily Open-Meteo fetch + GDD and chill-hour accumulators, persisted
- 15 curated plants with sourced thresholds and hand-drawn sprites
- Wallpaper that germinates/grows/wilts sprites from accumulator state
- 'Newly viable this year' shelf and a year-end poster PNG export

## Out of scope
- Frost-date/precipitation modeling, pests, soil
- Multi-location comparison, social sharing
- Interactive planting or real garden-plan advice

## Risks & unknowns
- Phenology models are contested; wrong thresholds make it misinform
- A single year barely shows 'creep' — value leans on the year-end reveal
- Sprite art volume is the real time sink

## Done means
Running the daily job for a simulated year of Open-Meteo data produces an accumulating garden where at least one plant germinates only after crossing its real chill-hour threshold, wilts one that undershot its hardiness floor, and exports a year-end poster listing 'newly viable' species.
