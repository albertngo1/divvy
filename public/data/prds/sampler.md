## Overview
Sampler is a quiet background artifact generator for makers and quantified-self tinkerers. Every day it adds a single horizontal band to an evolving generative embroidery 'sampler' (the traditional practice piece where you demonstrate stitches). The colors and motifs come from that day's real data. On Dec 31 it exports a proper, thread-by-thread cross-stitch chart — a physical object you can actually stitch, or hang as a printed piece.

## Problem
We already turn years of data into dashboards nobody re-opens and Spotify Wrapped slides that evaporate. There's almost no *tangible, craftable* year-artifact — nothing that ends the year as a made thing you can hold. And existing generative-art-from-data tools output pixels, not something with a real-world craft output path.

## How it works
Each night Sampler pulls the day's signals: Garmin sleep hours + body battery + steps, weather (temp/precip), git commit count, and calendar density. It maps them onto one 'pick' (row band, ~6–10 stitches tall):
- Base hue from temperature (cold→blue, hot→red).
- Saturation from activity (steps/intensity minutes).
- A dark 'knot' motif on high-stress days; an open, airy motif on restful ones.
- Commit-heavy days add a denser cross-hatch texture.
Rows stack top-to-bottom, so scrolling the canvas is scrolling through your year. Everything snaps to a fixed thread palette (e.g. 40 DMC floss colors) so the output is stitchable, not just renderable. A live PNG updates a wallpaper/menubar preview daily.

## Technical approach
Python daemon on the mac-mini via cron. Data via the existing Garmin/Strava MCP endpoints + a weather API + local `git log`. The canvas is a fixed-width grid (e.g. 120 stitches wide × 366 rows). Each cell holds a palette index; palette = quantized DMC floss RGB values with nearest-color mapping (CIEDE2000 in Lab space) so on-screen colors correspond to buyable thread. Motifs are small tileable stitch-stamps chosen by threshold rules. Render two outputs: an antialiased PNG for ambient display, and a symbol chart (each color→a symbol) as vector PDF for stitching. Data model: append-only `rows.jsonl` (one record/day: raw metrics + resolved palette indices), so the whole year is deterministically re-renderable. Hard part: making the color quantization *look good* on a tiny palette while staying data-faithful — and designing motif rules that read as intentional craft, not noise.

## v1 scope
- Cron job appends one row/day from Garmin sleep + weather + git commits
- Fixed 20-color DMC palette, nearest-color mapping
- Daily PNG written to a wallpaper path
- `sampler export` → symbol-chart PDF from the full `rows.jsonl`

## Out of scope
- Motif variety beyond 3–4 stamps
- Machine-embroidery (.PES/.DST) export
- Any UI beyond the wallpaper image + CLI

## Risks & unknowns
- Aesthetics are do-or-die; a bad palette = 366 rows of mud. Needs hand-tuned mappings.
- Missing-data days (no Garmin sync) must degrade gracefully to a neutral row.
- Nobody may ever actually stitch it — but the ambient wallpaper alone should justify it.

## Done means
Running the cron path for 7 seeded days produces a 7-row PNG whose colors visibly track the input data, and `sampler export` emits a printable symbol-chart PDF whose legend lists only real DMC floss numbers.
