## Overview

The visual complexity of the lead figure on every US utility patent, measured as edge density and plotted over time from 1836 to today. A scatter-over-time where each point is a patent's principal drawing; hover reveals the thumbnail. The line of best fit has inflections — and the story is whether those inflections land at WWII, the transistor, and the software-patent era.

## Problem

We have an intuition that patent drawings got busier over the centuries — from a single clean lever to a dense circuit schematic to an incomprehensible software flowchart. Nobody has quantified it. CV-on-patent-figures research exists in the abstract, but no one has plotted lead-figure edge-density across the full 1836→today span as a single browsable artifact. It's a rare "famous dataset, un-mined lens" — the drawings are public and bulk-available, the metric is dead simple, and the payoff is a shape you can argue about.

## How it works

The viewer sees a scatter: x = grant year, y = edge-density score of the lead figure, points sampled (not all ~11M patents). A trend line with a confidence band runs through it. Hovering a point pops the actual patent drawing thumbnail plus number/title, so you can sanity-check outliers ("why is this 1920 patent so dense? — oh, it's a loom"). Toggle overlays for historical markers (WWII, first transistor patent, State Street Bank software-patent era). Optionally facet by USPC/CPC class to see mechanical vs electrical vs software diverge.

## Technical approach — specific

Stack: Python for the offline pipeline (OpenCV + numpy), static site + D3/Observable Plot for the frontend. Data source: USPTO bulk data — the full-text and image bulk products (patent grant TIFF/PDF drawings, plus grant metadata for year and classification). Pipeline: for each sampled patent, extract the first drawing sheet, isolate the largest figure, run OpenCV **Canny edge detection**, and compute edge-pixel ratio = (edge pixels / total pixels) after normalizing image size and binarizing. No ML needed — Canny density is enough signal. Data model: prebaked `{patent_no, year, cpc_class, edge_density, thumb_url}` table, downsampled to a few thousand points per decade for a browsable scatter. Key algorithms: Canny with fixed thresholds (validated on a hand-labeled sample), size normalization so a big sheet isn't automatically "denser", and per-decade stratified sampling to keep the scatter legible and unbiased. The hard part is figure extraction — patent sheets vary wildly (multiple figures, reference-number clutter, borders, page furniture); reliably cropping the *lead figure* and excluding text/numbers is the real engineering, and Canny will happily count text strokes as edges unless masked.

## v1 scope (humiliatingly small) — bullets

- ~3,000 patents sampled across the timespan, not the full corpus
- Whole first drawing sheet, no per-figure isolation (crop text margins only)
- Single global edge-density metric, fixed Canny thresholds
- Scatter + trend line + hover thumbnail; no class faceting
- Prebaked JSON; pipeline run once offline

## Out of scope (for now)

- Full-corpus processing (11M+)
- Precise lead-figure segmentation / text masking
- CPC-class faceting and per-domain trend lines
- ML complexity scoring

## Risks & unknowns — prior-art verdict: Open

The audit confirms it: CV-on-patent-figures research exists, but nobody plots lead-figure edge-density 1836→today — this is genuinely un-built. Risks: figure extraction is messier than it looks and text clutter contaminates edge counts (mitigate with margin cropping + a validated threshold on a labeled sample); early scans are noisy and could inflate density; sampling bias could manufacture a fake trend, so stratified sampling and a published methodology note are mandatory.

## Done means — concrete, testable

- Pipeline computes normalized Canny edge-density for a 3,000-patent stratified sample.
- Scatter renders year vs density with a trend line and confidence band.
- Hover shows the real drawing thumbnail + patent number/title.
- Edge-density validated: a hand-labeled "simple vs busy" set of 50 patents correlates with the metric.
- Methodology (sampling, thresholds) documented in-page; a single scatter PNG is shareable.
