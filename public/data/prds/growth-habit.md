## Overview
A desktop wallpaper daemon (plus a web toy) that grows one snow crystal per snow-day at your location, physically derived from that day's real temperature and humidity profile aloft. Over a winter your wallpaper becomes a herbarium plate of crystals — each one a dated, falsifiable claim about a specific storm. For weather nerds, crystal-growth nerds, and anyone who wants an ambient artifact that accretes over a year instead of shuffling stock photos.

## Problem
Snowflake art is fake. Every generator picks random dendrite parameters and calls it a day. But crystal *habit* — plate, needle, hollow column, sector plate, fernlike dendrite — is almost entirely determined by the temperature and ice-supersaturation the crystal experiences as it falls (the Nakaya diagram, refined by Libbrecht). That data is public and hourly. Nobody has ever wired the real atmosphere to the real morphology, so nobody can look at a crystal and say "that's what December 14th looked like at 2 km."

## How it works
Pick a lat/lon and a date. Fetch the vertical profile: Open-Meteo's pressure-level API (`temperature_1000hPa…temperature_100hPa`, `relative_humidity_*`, `geopotential_height_*`, hourly, free, no key) — ERA5 archive endpoint for past dates. Convert RH-over-liquid to supersaturation over ice via the Murphy–Koop saturation vapor pressure ratio, and find the highest ice-supersaturated layer cold enough to nucleate (< −8 °C). Then integrate downward: at each 50 m step compute fall speed from current mass/area (Heymsfield–Westbrook drag), get dwell time, look up (T, σ_ice) in the Nakaya–Kobayashi diagram to get the dominant growth axis and rate, and step a hexagonal Gravner–Griffeath cellular automaton whose attachment parameters (β for facets vs. corners, boundary-layer κ, vapor density ρ) are *re-tuned every step* from the local conditions. Habit transitions then leave real growth rings — a column that sprouts plates at its ends because it fell through the −15 °C band. If it passes through a layer with supercooled liquid water, rime it into graupel. Render to SVG + retina PNG, composite onto the growing plate, set the wallpaper.

## Technical approach
TS + wasm (Rust) for the CA; a 512×512 hex lattice is plenty and runs in ~2 s. SQLite of (date, station, profile hash, crystal SVG). Wallpaper set via `NSWorkspace.setDesktopImageURL` / `osascript`. Menubar line: "today: sector plate, nucleated 3.1 km, 11 min fall, −14.6 °C growth layer." The genuinely hard part is making habit transitions look physical rather than glitchy — the CA must inherit a partially-grown crystal and change regime without seams — and calibrating growth-rate scaling so a 10-minute fall doesn't produce a 4 cm monster.

## v1 scope
- One hardcoded lat/lon, one hardcoded date, one PNG written to disk
- Two habits only: plate and column, switched by the growth-layer temperature
- No riming, no wallpaper integration, no menubar

## Out of scope
- 3D crystals, aggregation of multiple crystals, melting/sublimation
- Verification against real crystal photography
- Non-snow climates as a first-class case

## Risks & unknowns
Hourly reanalysis is coarse (25 hPa levels) and may smear the narrow habit bands. The CA parameter → (T, σ) mapping is empirical and will need hand-tuning. Snowless locations need a fallback: grow the "virtual crystal" from any ice-supersaturated cloud layer aloft, which exists on plenty of rainy days.

## Done means
Given (lat, lon, date) for five hand-picked historical storms, the produced crystal's habit matches what the Nakaya diagram predicts from that day's growth-layer temperature — a −15 °C layer yields a fernlike dendrite, −6 °C yields a needle, −25 °C yields a plate — and a full winter of dates renders a 90-crystal plate without a crash.
