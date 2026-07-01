## Overview

A scrubbable grid of sparklines, one per scent/sensory adjective ("musty", "smoky", "sweet", "rancid", "acrid", "fragrant"…), tracking how often each word appears in 150 years of digitized US newspapers. You are not visualizing the papers — you are visualizing what the country's nose was paying attention to, decade by decade. Drag a scrubber to a year and the grid highlights the leading scent-word of that moment.

## Problem

Smell is the sense least served by data visualization — it has no natural spatial or numeric encoding, so it gets skipped. But language is a usable proxy: the words people reach for to describe the world are a record of collective sensory attention. Nobody has plotted the olfactory vocabulary of a national press over time as a browsable small-multiples wall. Existing work (Odeuropa) mines olfactory lexicon into bubble/taxonomy diagrams, not a normalized US-newspaper sparkline grid.

## How it works

The viewer lands on a wall of ~60–120 sparklines, sorted by peak decade. Each cell is one scent word; the line is its relative frequency 1836→2020. A scrubber sweeps left-to-right; the current-year leader lights up and the grid can re-sort by that year's ranking. Hover a cell for the raw counts and a couple of dated headline snippets containing the word. Click to expand one word full-width with its top co-occurring nouns per decade ("smoke" → factories, then cigarettes, then wildfire).

## Technical approach — specific

Stack: static site, Vite + TypeScript, D3 + Observable Plot for the sparkline grid. Data source: Chronicling America (Library of Congress) — it has a clean OCR'd bulk API and full-text search returning per-year hit counts. The critical step is normalization: raw hits balloon simply because more papers were digitized later, so every count must be divided by total tokens (or total pages) digitized that year to get relative frequency. Data model: precomputed JSON of `{word: {year: relative_freq}}` plus a `{word_year: [snippet]}` sample table — all baked at build time, no runtime API calls. Key algorithm: annual token normalization + light smoothing (3-year rolling mean) so OCR noise doesn't dominate; peak-decade detection to seed the default sort. The hard part is OCR garbage — 19th-century scans mangle "musty" into "mnsty"; needs a fuzzy-match allowlist per target word and a denominator that accounts for OCR volume, not just article counts.

## v1 scope (humiliatingly small) — bullets

- 20 hand-picked scent words, hardcoded list
- One country (US), one source (Chronicling America), decade buckets not yearly
- Static prebaked JSON, no live queries
- Sparkline grid + one scrubber; no co-occurrence drilldown
- No mobile polish; desktop screenshot is the shareable

## Out of scope (for now)

- UK Hansard / Australian Trove / Canadian corpora (the "scales globally" pitch)
- Word co-occurrence / semantic drilldown
- User-submitted custom words
- Per-region US breakdowns

## Risks & unknowns — prior-art verdict: Partial

Odeuropa already mines olfactory lexicon but as bubble/taxonomy viz over European sources — the US-newspaper sparkline-wall artifact is un-built, so the specific artifact is open even though the theme is touched. Risks: OCR quality pre-1900 is rough and could swamp the signal; normalization denominator choice materially changes the shape (must document it); some scent words are too polysemous ("sweet" is mostly non-olfactory) and need curation or exclusion.

## Done means — concrete, testable

- Grid renders 20 words, 1836→2020, each normalized per-year and smoothed.
- Scrubber to any year highlights that year's top scent word and re-sorts on demand.
- Hover shows count + at least one real dated snippet from Chronicling America.
- Full build runs offline from prebaked JSON with no network calls.
- One PNG export of the full wall is shareable at 1200px+ wide.
