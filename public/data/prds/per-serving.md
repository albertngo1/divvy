## Overview
An explorable explanation of how the US Nutrition Facts panel is *engineered*, not merely reported — built on the USDA's full branded-foods database. For anyone who has ever noticed that a bag of chips contains 3.5 servings and wondered whether that number was chosen or discovered.

## Problem
FDA labeling rules (21 CFR 101.9(c)) are a table of rounding thresholds: trans fat under 0.5 g per serving declares as 0 g; total fat under 0.5 g is 0 g; calories under 5 are 0, and 5–50 round to the nearest 5. Every threshold is per *serving*, and serving size is partly a manufacturer's choice. This creates a legal optimization problem with a visible fingerprint in the data — and no consumer-facing thing shows it. Existing shrinkflation coverage is anecdotal ("this Mars bar was 20 g bigger in 1991"); the systematic story is sitting unread in a public dataset.

## How it works
Three screens.

**1. The cliff.** Density histograms of declared per-serving values across ~1.9M branded products, one per nutrient, with the legal threshold drawn as a red line. Trans fat is a spike at exactly 0 and near-nothing between 0 and 0.5. Calories pile up just under multiples of 5. The bunching is the whole argument, no commentary needed.

**2. The playable label.** Pick a real product. A rendered Nutrition Facts panel sits next to a serving-size slider. Drag it and every number recomputes and re-rounds live, with cells flashing when they cross a threshold and drop to zero. A "legal zero" readout says: *declare 11 g and this product contains 0 g of trans fat, 0 g saturated fat, and 0 calories.*

**3. The gap.** FDA publishes RACC — Reference Amounts Customarily Consumed (21 CFR 101.12) — a legally defined table of what a normal person eats of each food category. Join products to their RACC category and rank by the gap between declared serving and reference amount. That leaderboard is the shareable artifact.

## Technical approach
Data: FoodData Central branded-foods full download (quarterly CSV/JSON, free, no key needed for bulk; API key for spot lookups). Key fields: `servingSize`, `servingSizeUnit`, `householdServingFullText`, `labelNutrients` (declared, post-rounding values), `brandOwner`, `modifiedDate`. RACC table is a static PDF/table transcribed once into a ~140-row lookup.

Pipeline: DuckDB over Parquet — the whole thing fits in a few GB and aggregates in milliseconds, so precompute histograms into small JSON and ship a static site (Svelte + D3 or Observable Plot). Bunching quantified with a McCrary-style density discontinuity test at each threshold, reported as a ratio with a bootstrap CI.

The hard part is two joins: parsing `householdServingFullText` free text ("8 chips (28g)", "1/4 cup dry") into a structured measure, and mapping products to RACC categories — the dataset's `brandedFoodCategory` is coarse and messy, so expect a hand-built mapping for the top ~200 categories plus a fuzzy fallback, with honest coverage numbers displayed rather than hidden.

## v1 scope
- One nutrient (trans fat) on the cliff chart
- Playable label for 500 hand-picked products, not all 1.9M
- No RACC screen at all
- Static JSON, no backend

## Out of scope
Historical snapshot diffing (true shrinkflation over time), non-US labels, price data, any "is this healthy" judgment, user accounts.

## Risks & unknowns
`labelNutrients` are post-rounding values, so the pre-rounding truth is only reconstructible via the per-100g analytic values, which many branded entries lack — the playable label may need honest "estimated" flagging. Category-to-RACC mapping could be the whole project's time budget. Data freshness varies wildly by brand.

## Done means
The trans-fat histogram renders live from real FDC data with a visible cliff at 0.5 g and a reported bunching ratio, and dragging the serving slider on a real product flips its trans fat declaration from a nonzero number to '0g' at the correct legal threshold.
