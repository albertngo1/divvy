## Overview
Ductus is a desktop/menubar background artist that slowly designs a single custom variable font across a calendar year. Each day it nudges the letterforms a little based on ambient signals about you. It's for people who love the temperature-blanket / year-in-pixels genre but want an artifact they'll actually use every day: a font.

## Problem
Self-tracking artifacts almost always collapse into a chart — pretty, glanced at once, forgotten. Nothing produces a functional object carrying a year of ambient data. A typeface is used constantly and quietly carries meaning; it's the perfect vessel, but nobody makes fonts because outline editing is hard.

## How it works
Ductus seeds a plain base font with a few design axes (weight, contrast, slant, x-height, terminal roundness). A daily cron pulls that day's input vector — typing cadence, weather high, Garmin sleep score, git commit count — and applies a small bounded delta to the axes plus subtle per-glyph tweaks, saved as a delta layer for the day. The menubar shows today's specimen card ("today your g grew a longer tail"). At year end you export a finished, installable OTF and a poster showing the drift over 365 days.

## Technical approach
Electron or a Swift menubar shell; font work in opentype.js / fontkit. Build the output as a true variable font with custom axes so daily deltas are just axis coordinates plus a small set of interpolated master outlines — this keeps contours valid instead of free-editing points into garbage. SQLite stores date → axis values + per-day RNG seed (seeded by the date, so runs are reproducible). Specimen rendered on HTML canvas. Inputs via a small pluggable collector (own keylogger you control, a weather API, Garmin/Strava MCP, `git log`). Hardest part: mutating outlines while guaranteeing they stay renderable and stay tasteful — bounded aesthetics with guardrails so it drifts characterful, not broken.

## v1 scope
- Base font with weight + x-height axes only
- 3 input signals (weather, sleep, typing WPM)
- Daily cron writes a delta, menubar specimen card
- Export a valid OTF at any time

## Out of scope
- Full charset polish, kerning, hinting
- Mobile, sharing/social, marketplace
- Many axes / per-glyph ornament

## Risks & unknowns
- Outline mutation breaking glyphs; need strict interpolation-only edits
- Drift toward ugliness — needs aesthetic guardrails
- Reliable daily personal-data capture

## Done means
Run 30 simulated days end-to-end and export an installable OTF whose letterforms visibly and validly differ from the seed, with a specimen showing the day-by-day drift.
