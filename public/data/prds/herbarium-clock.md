## Overview

A desktop screensaver (plus a one-line menubar readout) that shows what is botanically happening *right now, right here*. Every ~90 seconds it draws a new specimen sheet: an ink-hatch rendering of one plant, a typeset label with species, family, county and date, and a small sparkline of that species' flowering weeks across the year with a mark on today. For people who took a plant-ID app seriously for two weeks and then stopped — the ambient version of that interest.

## Problem

Plant apps are all pull: point a camera, get a name. Nobody pushes you the answer to "what's going on out there this week." Phenology data — the timing of flowering, fruiting, leaf-out — genuinely exists at fine spatial resolution, but it lives in research portals and CSV exports. That's the arbitrage: the data is free and queryable, the audience can't reach it, and the output is decorative rather than another dashboard.

## How it works

1. On first run you pick a location once. It resolves to an iNaturalist `place_id` via `GET /v1/places/nearby`.
2. A nightly job asks, for that place, which plant taxa have observations annotated *Flowering* (`term_id=12&term_value_id=13`) and pulls each one's `GET /v1/observations/histogram?interval=week_of_year` curve.
3. Effort normalization: divide each taxon's week-N count by the total plant observations in that place in week N. This is the whole trick — raw counts measure *observers*, not plants (weekends spike, roadside parks dominate, showy flowers win).
4. Score each taxon: this week's normalized share vs. its annual mean. Keep the top ~40.
5. The screensaver picks one, fetches a CC-licensed observation photo, converts it to stipple-and-hatch line art, lays it on a cream sheet with a letterpress-style label card, and fades in over eight seconds.

## Technical approach

Swift + `ScreenSaverView` with Core Graphics for the real thing; a full-screen HTML page for v1. Data daemon in Node writing SQLite (`taxon, place_id, week, annotation, count`), refreshed nightly, so the screensaver never blocks on network.

Rendering: Sobel edge detection for the outline strokes, then Poisson-disk sampling weighted by inverse luminance for the stipple fill, both emitted as bezier paths so it scales to Retina and can animate as if being drawn. The typography carries the entire aesthetic — letterspaced small caps, hairline rules, a hand-numbered accession code in the corner.

Hard parts: observer bias (addressed above, but it's a real confound and worth showing a confidence dot); photo licensing — CC-BY-NC requires attribution, so the observer's name gets printed on the sheet, which is charming rather than a burden; and iNat rate limits mean the nightly pull must be paginated and cached politely.

## v1 scope

- One hardcoded location, baked JSON of 10 taxa — no live API yet
- Full-screen HTML page cycling sheets, not a real `.saver` bundle
- Static line-art conversion done offline, shipped as SVG
- No menubar app

## Out of scope

Fungi, birds, insects. Plant identification. Mobile. Directions to where the plant is. Any social feature.

## Risks & unknowns

Data is thin outside North America and Europe. Observation counts may stay too observer-biased to be honest even after normalization — needs a botanist sanity check before shipping. The stipple renderer could produce mud for photos with busy backgrounds; may need background segmentation, which is a project of its own.

## Done means

For a chosen county on a chosen date, it lists at least five taxa that a local botanist agrees are actually in flower that week; each sheet renders in under 200ms; and it runs for an hour without repeating a species or hitting the network.
