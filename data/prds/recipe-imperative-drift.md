## Overview

Recipe Imperative Drift charts how cooking instructions changed from prose to code. A corpus of cookbooks from 1800 to 2020 is measured for the ratio of imperative verbs ("fold," "whisk," "sear") to passive/descriptive constructions, plus mean step length. The finding, rendered as small-multiples over time: pre-1900 recipes read as essays ("one takes a quantity of good butter and works it gently until..."); post-1990 recipes are terse command-line scripts ("1. Whisk. 2. Fold. 3. Bake 12 min."). The quantification is the novelty — food historians know the trend; nobody has plotted it.

## Problem

The prose-to-imperative shift in recipes is a well-known qualitative claim among food writers and historians, but it has never been *measured* across a real corpus or rendered as a timeline. There's no artifact that lets you see the sentence physically contract decade by decade, with actual recipe excerpts pinned to the curve.

## How it works

Main view: small-multiples over time, one cell per decade, each showing mean step length (words) and imperative ratio. A trend curve sweeps prose→imperative. Below the curve, representative recipe excerpts from each era are pinned so the reader sees the register change in real text ("work the paste gently" vs "whisk 30s"). Hover a decade for distribution detail. Share artifact: the full timeline PNG with excerpt callouts at 1850, 1920, 1990.

## Technical approach — specific

Stack: Python (spaCy) ingest, static JSON, Observable Plot + D3 in a Vite site. Data sources: **Project Gutenberg** cookbooks (many public-domain 19th/early-20th century titles: Mrs. Beeton, Fannie Farmer, Miss Leslie) and **Internet Archive** cookbook scans (OCR text via IA's full-text API for a broader 1800-2020 spread). Modern cookbooks are copyright-locked; supplement post-1990 with public-domain government/extension pamphlets and openly-licensed recipe text, clearly labeled.

Data model: `recipe {book_id, year, title, steps[], mean_step_len, imperative_ratio, passive_ratio}` where each `step` is a segmented instruction. Key NLP algorithms: spaCy dependency parse per instruction sentence; **imperative detection** = sentence-initial base-form verb (`VB`) with no explicit subject (root verb, no `nsubj`), the classic imperative signature; **passive detection** = `nsubjpass` / `auxpass` presence; step segmentation splits on numbered markers, sentence boundaries, and imperative onsets. Aggregate ratios per (book, decade). The hard part: separating *instructions* from *ingredient lists and headnotes* — a modern recipe's ingredient block is not prose and would skew the imperative count, while a Victorian recipe has no clear step boundaries at all (it's one paragraph). Needs a structural segmenter tuned per era, plus OCR-noise cleanup on IA scans (broken hyphenation, running heads).

## v1 scope (humiliatingly small)

- ~30 cookbooks, Gutenberg-only, spanning 1800-1930
- Imperative ratio + mean step length, two metrics
- Decade small-multiples + trend curve + hand-picked excerpts
- One PNG export

## Out of scope (for now)

- Full post-1990 corpus (copyright) — illustrative samples only
- OCR ingest of IA scans (v2 — start with clean Gutenberg text)
- Cuisine/region breakdowns
- Ingredient-list or nutrition parsing

## Risks & unknowns

Prior-art verdict: **Partial** — the shift is documented qualitatively but no quantified step-length-over-time viz exists; the novelty is the measurement, not the finding. Risks: (1) corpus imbalance — Gutenberg is dense pre-1930 and thin after, so the modern end of the curve may rest on too few, non-representative books, threatening the whole thesis; (2) step-segmentation is genuinely hard for Victorian single-paragraph recipes and will drive the mean-step-length metric, so it must be validated by hand; (3) OCR noise from IA if pulled in. Mitigate by keeping v1 to clean Gutenberg text and being explicit that the modern comparison is illustrative until a licensed corpus is sourced. The finding is safe/shareable ("cookbooks used to be prose" reposts itself) but must be honestly caveated on sampling.

## Done means

- ≥30 cookbooks parsed with per-recipe step segmentation
- Imperative + passive ratios validated on 15 hand-checked recipes
- Timeline renders decade cells with trend curve and pinned excerpts
- Mean step length demonstrably declines across the span, with n per decade shown
- Static site deployed with PNG export
