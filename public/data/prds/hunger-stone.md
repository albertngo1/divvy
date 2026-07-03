## Overview
Hunger Stone is a single-page interactive map for the curious and the doom-scrollers: an atlas of things the world only shows you when the water goes away. Named for the real medieval famine-warning stones ("Wenn du mich siehst, dann weine") that re-emerge in the Elbe during droughts.

## Problem
The Great Salt Lake tracker shows a number going down; the Green Boots story shows one body a receding glacier gave up. Neither lets you *feel* the pattern: that low water is a global reveal mechanism. Sunken towns, WWII wrecks, hunger stones, drowned churches, and frozen climbers are all governed by the same waterline — but they live in scattered news articles, never on one canvas you can scrub.

## How it works
A world map with one dominant control: a vertical "drawdown" slider (or a year-scrubber that maps to modeled level). As you lower it, curated sites cross their reveal threshold and fade in as markers — a drowned Spanish village at -20%, a hunger stone at a specific gauge height, Everest's Green Boots tied to a melt year. Click a marker for a sourced card: photo, the exact level/year it last surfaced, a one-line story, and a link. A "who surfaced this year" side panel lists sites currently above their threshold at the chosen level.

## Technical approach
Static site: Vite + MapLibre GL JS, no backend. A hand-curated `sites.geojson` (~40 entries) is the whole product; each feature carries `{lat, lon, reveal_metric, reveal_value, kind, blurb, source_url, img}` where `reveal_metric` is one of `reservoir_pct`, `gauge_m`, `melt_year`. The slider drives a normalized 0–1 "exposure" value; a small mapping table per metric converts it so heterogeneous units share one control. Markers use a MapLibre `filter` expression on `reveal_value <= exposure`, with an opacity ramp for a nice fade. Timeline mode joins a few real series (USGS/Utah DWR gauge CSVs, Great Salt Lake levels) so scrubbing a year sets the slider automatically. The genuinely hard part is honest curation: getting real reveal thresholds and not conflating 'in the news' with 'actually exposed'.

## v1 scope
- One map, one slider, ~25 hand-curated sites across 3 metrics
- Sourced click cards with image + citation
- Shareable URL that encodes slider position

## Out of scope
- Live gauge ingestion / auto-updating feeds
- User-submitted sites and moderation
- 3D bathymetry or realistic flood modeling

## Risks & unknowns
- Curation labor and source quality; some 'reveal levels' are fuzzy
- Macabre content (bodies) needs a respectful tone and content note
- Mixed units make the single-slider abstraction slightly dishonest — must label per-site

## Done means
A deployed static page where dragging the slider to a drought level surfaces the correct subset of ≥25 sites, each with a working sourced card, and a shared URL reopens at the same waterline.
