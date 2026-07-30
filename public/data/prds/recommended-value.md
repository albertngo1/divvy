## Overview
An explorable, static web tool that treats the fundamental physical constants as a *versioned dataset with a changelog*. Three views: a drift timeline for any constant across CODATA releases, a formula sandbox that recomputes derived quantities under every vintage, and a forensic "date this number" mode. For physicists, metrology nerds, textbook and problem-set authors, and anyone auditing an old calculation.

## Problem
Constants get revised, and every published derived number silently inherits the vintage of whatever table its author had open. Nobody tracks the blast radius. The 2018 revision moved the proton charge radius by ~4% after the muonic-hydrogen puzzle; the 2019 SI redefinition made h, e, k and N_A *exact* and shoved the leftover uncertainty onto other quantities entirely. Old error bars routinely turn out to have been optimistic by many multiples of the modern uncertainty — and there is no tool that shows you this, or that tells you which table a stray number in a 2004 PDF came from.

## How it works
1. **Drift**: pick a constant, see recommended value ± uncertainty across CODATA 1969 → 2022, plotted not in SI units but in *sigmas of today's uncertainty*, so the historical error bars visibly fail to cover the modern value. Annotations mark the 2019 redefinition as a hard discontinuity.
2. **Sandbox**: type an expression (`R_inf = m_e * e^4 / (8 * eps_0^2 * h^3 * c)`), get a value and propagated uncertainty per vintage, plus a spark-line of how your quantity drifted.
3. **Date this number**: paste `6.62606896e-34` or a derived result. The tool enumerates (vintage × candidate formula × rounding-to-k-sig-figs) and ranks which combination reproduces your digits, then reports the discrepancy against current values.

## Technical approach
Data: NIST CUU ASCII tables (`physics.nist.gov/cuu/Constants/Table/allascii.txt`) for current, plus archived 1998/2002/2006/2010/2014/2018 tables and the corresponding Rev. Mod. Phys. adjustment papers, normalized into one JSON per vintage `{symbol, value, stdUncertainty, unit, exact:boolean}`. Expression parsing with a small Pratt parser over dual numbers, so uncertainty propagation is linear-order automatic differentiation rather than hand-derived partials. Dating mode is a scored search: tolerance derived from the number of significant figures supplied, likelihood ranked by vintage recency and formula simplicity. Front end is Svelte + d3, fully static, no backend. The genuinely hard part is correlations — NIST publishes a correlation-coefficient matrix between adjusted constants, and ignoring it makes propagated uncertainties on multi-constant formulas wrong by a factor; v1 ignores it and *says so loudly*, v2 ingests it.

## v1 scope
- 12 constants × 6 vintages, hand-checked
- One drift chart in sigma units
- Formula sandbox with 5 presets, uncorrelated propagation
- Dating mode for single bare constants only (no formulas)

## Out of scope
Non-CODATA values (particle masses from PDG, astronomical constants), full correlation matrix, unit-system conversion beyond SI.

## Risks & unknowns
Historical tables are scattered across PDFs and need careful transcription; the 2019 exactness change breaks the naive "value ± u" data model; dating mode may be ambiguous when vintages agree to the digits given (must report ties honestly rather than guessing).

## Done means
Pasting a Planck-constant value from a 2007 textbook returns "CODATA 2006" as the top-ranked match with a runner-up list, and the sandbox reproduces the published Rydberg constant for three separate vintages to within their stated uncertainties.
