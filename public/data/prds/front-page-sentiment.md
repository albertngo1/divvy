## Overview

Front-Page Mood Ring distills each day's Hacker News front page into a single color derived from the collective sentiment of its titles (and optionally top comments). Days stack left-to-right into a stripe painting; a full year becomes a horizontal band you can read at a glance — the doomscroll summers, the launch-day greens, the layoff-season grays. An ambient, generative-art portrait of the tech zeitgeist, one pixel-column per day.

## Problem

HN's front page is a daily emotional weather report, but it evaporates — yesterday's mood is gone, and there's no way to *see* a season or a year of collective tone. The finding "tech sentiment has moods" is intuitive; the artifact — a scannable year-long color stripe you can point at and say "that's when everyone got anxious" — doesn't exist as a shareable object.

## How it works

Each day, collect the front-page stories, score the sentiment of their titles, aggregate to a single daily sentiment value, and map that value onto a color (hue/lightness). Store one row per day. The front end renders the day rows as adjacent vertical stripes across a canvas; hover a stripe to see that day's date, score, and the stories that drove it. A year of stripes = the painting.

## Technical approach — specific & technical

Stack: static site (Vite + TypeScript, Canvas for the stripe field) + a small scheduled worker (Node, run daily via cron or GitHub Actions) that appends one JSON record per day and commits it — no live server.

Data sources by name:
- **HN Algolia API** — `https://hn.algolia.com/api/v1/search?tags=front_page` for the current front page, or `search_by_date` filtered by `created_at_i` to backfill historical days. Fields: `title`, `points`, `num_comments`, `objectID`.
- Sentiment scoring: **VADER** (`vaderSentiment`, tuned for short social text) or **`sentiment`** (AFINN-based, pure-JS, zero-deps) for titles; optionally a small transformer via **transformers.js** (`distilbert-base-uncased-finetuned-sst-2`) if lexicon scoring proves too crude. Titles are terse and often neutral/technical, so start lexicon-based and validate.

Data model: `days[{date, mean_sentiment, weighted_sentiment, story_count, color_hsl, top_stories:[{title, points, score}]}]`. Daily aggregate = points-weighted mean of per-title compound scores (loud stories count more). Map to color: sentiment ∈ [-1,1] → hue on a red(neg)→gray(neutral)→blue/green(pos) ramp, with lightness scaled by volume or agreement variance.

Key algorithm: the aggregation + sentiment→color mapping. The hard part is that HN titles are short, sarcastic, and technical — VADER will misread "X is dead," "considered harmful," or deadpan wit — so calibrate the ramp against ~20 hand-labeled days and pick a mapping where the color trend matches lived memory rather than trusting raw scores.

## v1 scope (humiliatingly small)

- Backfill ~90 days of front pages via Algolia.
- Score titles with a JS lexicon lib; points-weighted daily mean.
- Fixed sentiment→HSL ramp; one stripe per day on a canvas.
- Hover shows date, score, and top stories. Daily job appends new stripes.

## Out of scope (for now)

- Comment-text sentiment (titles only for v1).
- Per-topic breakdowns, emotion categories beyond one axis.
- LLM-based scoring, multi-source (Reddit, Bluesky).
- Accounts, alerts, embeds.

## Risks & unknowns

Prior-art verdict: **Partial** — HN sentiment dashboards exist, but a year-long one-color-per-day stripe painting is unbuilt. Risks: lexicon sentiment is unreliable on terse/sarcastic titles (mitigate: hand-label calibration set, choose a ramp robust to noise, consider transformers.js if needed); a single scalar may flatten genuinely mixed days (accept for v1, expose top stories on hover); color mapping is subjective (tune to memory). The whole thing hinges on the mapping *feeling* true — validate before scaling.

## Done means

A canvas renders ~90 daily stripes in date order; each stripe's color reflects that day's points-weighted title sentiment; hovering shows the date, score, and driving stories; the visible color trend plausibly matches remembered events, and a daily scheduled job appends a new stripe with no manual step.
