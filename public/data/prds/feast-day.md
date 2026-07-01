## Overview
A quiet daily PWA that each morning surfaces one genuine public holiday happening *somewhere* on Earth today, with a tiny ritual to "observe" it. Over a year it fills a passport collage of stamps. For the curious, homesick expats, and anyone who wants their calendar wider than one country.

## Problem
Your calendar shows your nation's ~11 holidays; the planet celebrates thousands you'll never encounter. There's no gentle daily window into that — and it's exactly the kind of ambient artifact that should quietly generate itself over a year while you barely tend it.

## How it works
Each day the app finds which holidays fall today across all countries and subdivisions (usually several), then picks one — weighted toward the obscure and the ones you haven't seen. It shows the name, country, a plain one-paragraph explanation, and a ritual card ("Songkran, Thailand: flick water at someone you love"). Tap **Observed** and a hand-drawn stamp lands in your passport. A year in you have 200–365 stamps and can export the whole grid as a single PNG — the self-generating artifact.

## Technical approach
Source of truth is the trending `vacanza/holidays` Python library (150+ countries, subdivisions, multi-year rules). At build time, precompute it into a static `date → [holiday...]` JSON so the app is fully static and hosts on Pages. Front-end: vanilla-JS PWA, localStorage for the passport, service worker for the daily nudge. Stamp art is one SVG template with per-country palette + glyph slots (flag colors), rendered to canvas for export. Selection algorithm: from today's candidates, subtract already-seen, weight inversely by how many countries share the holiday (rarer = higher). The hard part is **meaning** — the library gives names, not why — so v1 hand-writes ~150 short, sourced blurbs for the most interesting; unknowns just show name + country.

## v1 scope
- Static calendar JSON for the current year
- One card/day, tap-to-stamp, localStorage passport
- PNG export of the stamp grid
- ~150 curated blurbs + ritual cards

## Out of scope
- Accounts/sync, real push infrastructure
- Lunar/edge-case accuracy beyond what the lib provides
- Translations

## Risks & unknowns
Blurb research is a slog; ritual cards risk cultural clumsiness (mitigate: respectful, sourced, skippable). Cold engagement — the passport payoff has to feel worth a daily tap.

## Done means
For any date in the year the app deterministically shows exactly one holiday, tapping persists a stamp across reloads, and exporting after N taps produces a PNG with exactly N stamps.
