## Overview
Desire Path is an ambient wallpaper / printable artifact that turns a year of your movement into one continuous drawing. No street map underneath — just a blank field onto which your own GPS/IMU trace is laid, one day at a time, as a single never-lifting pen line. Routes you travel often darken and thicken; the map slowly reveals *your* geography as literal worn-in desire paths. Sparked by MichaelGrupp/evo (odometry/SLAM trajectory evaluation) — the idea of a trajectory as an aesthetic object, not just an error metric.

## Problem
Strava heatmaps and Google Timeline exist, but they paint over a real basemap and reset your attention every session. Nobody has an *ambient*, self-generating, year-long object that quietly answers 'where does my life actually happen?' as an artwork you'd frame — where repetition, not roads, defines the shape.

## How it works
A background daemon ingests your day's location trace. Each night it appends that day's path to a cumulative canvas as a continuous polyline. Every segment increments a spatial accumulation grid; a segment's rendered darkness/width = log(visit count) for the cells it crosses. First-time detours draw as faint ghost threads; the commute you do 300 times becomes a black cord. The line never lifts — days are joined by a thin 'overnight' hairline at your sleep location. By December the image is a personal cartography: home and work as dense knots, one-off trips as pale filaments. It updates as desktop wallpaper daily and exports a high-res print at year end.

## Technical approach
Data source: phone GPS via Google Timeline/Location History export, an Overland/OwnTracks self-hosted feed, or Strava/Garmin activity streams (`get_activity_streams` latlng) for the movement subset. Stack: a Python cron job + a headless renderer (SVG → `resvg`/Cairo, or an HTML canvas snapshot). Data model: append-only `points(ts, lat, lon, source)` in SQLite; a persistent quantized accumulation grid (geohash-7 → count) that survives across days. Rendering: project all points to a locally-scaled equirectangular plane centered on your median position; draw the polyline with per-cell alpha from the grid; anti-alias with additive blending so overlaps genuinely darken. The hard part: privacy-safe local-only pipeline plus making sparse/erratic GPS look like an intentional continuous line (Kalman/spline smoothing, gap-bridging without hallucinating routes).

## v1 scope
- Import one Google Timeline JSON export (last 30 days)
- Render a single continuous polyline PNG, no basemap
- Darkness = visit count via a geohash accumulation grid
- Set it as wallpaper once, manually

## Out of scope
- Live daily cron, overnight hairline joins
- Multi-source merge, IMU dead-reckoning fill
- Year-end print export / framing

## Risks & unknowns
- GPS noise may make the 'single line' look like scribble
- Location data is deeply sensitive; must stay 100% local
- Sparse days / travel gaps break continuity

## Done means
Feeding 30 days of location export produces a single unbroken PNG line with no basemap where a route walked 20 times is visibly darker than one walked once, and it renders identically on re-run (deterministic).
