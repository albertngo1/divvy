## Overview
Cross-Date is a browser tool that turns a photo of a cut tree — a stump, a firewood round, a beam end — into a dated time series. It measures the ring widths, then statistically matches your sequence against published master chronologies to assign a real calendar year to every ring. Output is a scrollable timeline: your tree's rings on top, regional climate and historical events below. For homeowners with a stump, woodworkers, hikers, and anyone who has ever counted rings with a fingernail and lost track at 40.

## Problem
Counting rings gives you an age. Dendrochronology gives you *dates* — and dates are where it gets interesting, because a narrow ring in 1934 means something. But cross-dating is currently locked behind desktop Fortran-era software (COFECHA, CDendro) and a research workflow. There is no consumer path from "I have a stump" to "this tree germinated in 1911 and nearly died in the 1977 drought," despite NOAA hosting thousands of free master chronologies that make it possible.

## How it works
1. Upload a photo. Best results on a sanded or water-wetted surface; the app coaches you (wet it, shoot flat, include a ruler or coin for scale).
2. Click the pith, then drag a radial path out to the bark. The app extracts an intensity profile along that path, plus two auto-offset parallel paths for redundancy.
3. Ring boundaries are detected as latewood→earlywood transitions: profile is detrended, bandpass-filtered to the expected ring frequency, and peaks are found with a minimum-spacing constraint. You get a draggable overlay of detected boundaries and fix mistakes by clicking — this human-in-the-loop correction is the product, not a failure.
4. The resulting width series is standardized (cubic smoothing spline, 2/3 series length, 50% frequency cutoff — the standard dendro detrend) into unitless indices.
5. The app correlates your indices against master chronologies at every possible lag, reporting Baillie–Pilcher t-values. t > 3.5 at one lag and noise everywhere else is a date. Below that, it says "no confident match" rather than guessing.
6. The payoff view: a timeline with your rings as vertical bars, narrow years highlighted, aligned against regional PDSI drought reconstructions and a small hand-curated event layer (major regional droughts, fire years, volcanic cooling years like 1816).

## Technical approach
All client-side: React + Canvas/WebGL for the image work, Web Worker for the numerics. Profile extraction is bilinear sampling along the user's polyline; ring detection is Savitzky–Golay smoothing → continuous wavelet transform ridge detection to handle the fact that ring width itself drifts (wide near pith, narrow near bark) so a fixed bandpass fails.

Data source: NOAA's International Tree-Ring Data Bank (ITRDB) — thousands of `.rwl` (Tucson decadal format) files, public domain, downloadable in bulk. Pre-process offline into per-region site chronologies (biweight robust mean of standardized series) and ship them as compact binary arrays; a US-wide set is a few MB, chunked by region so the browser fetches only what's near the user's location.

Matching: normalized cross-correlation over lags, converted to a t-statistic; also compute Gleichläufigkeit (sign-agreement percentage), the classic complementary metric, because they fail in different ways.

Hardest part is honest: consumer photos of chainsawed stumps are *rough*. Ring detection will be wrong often. The design answer is to make correction fast and to be loudly uncertain — show the t-value distribution across all lags so a weak match visibly looks like noise.

## v1 scope
- Single photo, single user-drawn radial path
- Manual ring boundary correction
- One region's master chronologies (US Southwest — the best-replicated, most drought-sensitive data)
- Timeline output with drought overlay; export ring widths as CSV/`.rwl`

## Out of scope
- Whole-disc automatic ring segmentation, core samples from increment borers, species ID, fire-scar detection, mobile capture app, accounts

## Risks & unknowns
- Detection accuracy on unsanded surfaces may be bad enough that the correction UI dominates the experience.
- Fast-grown yard trees are often climate-insensitive and simply won't cross-date; the tool must fail gracefully and say why.
- Missing/false rings are a real dendro problem and will produce off-by-one-year dates.

## Done means
Take a photo of a stump of known felling date, run the flow, and the tool independently assigns the outermost ring to the correct calendar year with t > 3.5 — and, on a deliberately mis-measured series, correctly reports no confident match instead of inventing one.
