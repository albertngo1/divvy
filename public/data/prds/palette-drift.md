# Palette Drift

## Overview
A flowing color-stream that shows how the dominant palette of video-game box art has drifted across decades and genres — from the neon of the 80s to the brown-and-bloom of the mid-2000s to today. For gamers, designers, and anyone who loves a gorgeous data artifact.

## Problem
Every gamer *feels* that eras have a look — the "everything is brown" 7th console generation is a running joke — but nobody has measured it. Cover art is a rich, dated, genre-tagged visual corpus that has never been mined for its color signature over time. The itch: prove the vibe shift with pixels, and make something beautiful enough to reshare on arrival.

## How it works
The main view is a horizontal color-stream: time on the x-axis, and for each time slice a vertical band built from the dominant colors of that period's covers, stacked by frequency — so you literally watch the palette flow and shift. A genre filter (RPG, shooter, platformer, horror) redraws the stream for that genre; a compare mode overlays two genres. Hover a slice to see the actual cover thumbnails that produced those colors. Everything is deep-linkable and PNG-exportable.

## Technical approach
Static site — **Svelte + D3** for the stream/streamgraph, **three.js** optional for a 3D palette-cloud stretch view. Color extraction runs offline; the site ships a baked JSON of palettes.

- **Data source:** **IGDB API** (Twitch-owned, free with a Twitch client-ID/secret) for game metadata — release date, genres, and cover-art image URLs. IGDB is described as "intense detail," which is exactly what a per-genre, per-year cut needs.
- **Pipeline:** fetch cover URLs via IGDB, download images, run **k-means** (or median-cut) color quantization per cover to extract ~5 dominant colors with weights. Convert to **CIELAB** so clustering and averaging respect perceptual distance, not RGB. Aggregate per (year, genre) into a weighted palette.
- **Data model:** `covers.json` = `[{id, year, genres, palette:[{lab, weight}]}]`; aggregated `stream.json` = `[{year, genre, bands:[{color, freq}]}]`.
- **Key algorithm:** stable palette clustering across years so a color band doesn't jitter frame-to-frame — cluster in LAB, then match/track clusters between adjacent time slices.
- **Hard part:** making the aggregation *perceptually honest* (LAB, not RGB) and temporally stable so the stream reads as drift rather than noise; plus batching thousands of image downloads within IGDB rate limits.

## v1 scope (humiliatingly small)
- One genre (e.g. RPG), ~500 covers, LAB-clustered palettes.
- Single color-stream by year, no compare mode.
- Hover to see contributing cover thumbnails.
- Baked JSON; no live IGDB calls in the browser.

## Out of scope (for now)
- All genres / full IGDB corpus.
- 3D palette-cloud view.
- Album/movie covers (adjacent but separate).
- User-uploaded cover analysis.

## Risks & unknowns
Prior-art verdict: **Partial.** A 167-cover itch.io color-extraction project exists, and movie/album "color over time" is well-trodden. The fresh re-angle: (1) *games specifically* at IGDB scale (thousands, not 167), (2) a *genre-faceted* stream so you can show the RPG-vs-shooter palette divergence, and (3) LAB-based perceptual honesty. Unknown: whether the drift signal survives genre-mixing and whether covers cluster into a legible story or perceptual mud. Prototype the RPG stream first to de-risk the "is there actually a visible drift" question.

## Done means
A deployed page showing at least one genre's color-stream over ≥30 years built from ≥500 IGDB covers, with hover-to-thumbnails and a PNG export — and the palette drift is visible to the naked eye.
