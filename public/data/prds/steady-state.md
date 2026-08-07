## Overview

Steady State is a solo desktop/web tool that models your kitchen as a factory production line and solves for steady-state rates. It is explicitly *not* a meal planner: it outputs no seven-day grid, no recipes for Tuesday. It outputs rates, batch sizes, purchase intervals, and one highlighted bottleneck — the way a factory-builder game shows you that your assembler is output-blocked.

## Problem

People who batch-cook fail in a specific way: they buy and cook in the wrong *ratios*, so half the spinach rots while the rice runs out on day three. Meal planners answer "what do I eat Tuesday," which is a scheduling problem nobody actually has. The real problem is a flow problem — consumption rate vs. spoilage rate vs. batch size vs. equipment cycle time — and it has a clean answer that no consumer app gives you, because the answer is a fractional rate, not a calendar.

## How it works

1. Declare 5–15 recurring dishes you actually eat, each with ingredients and quantities per batch.
2. Declare how often you eat each (servings/week) and your constraints: fridge liters, freezer liters, oven slots, one Dutch oven, cook sessions available per week, hours per session.
3. Solve. You get: batches/week per dish (fractional and honest), grocery purchase quantity + interval per ingredient, expected weekly spoilage in grams and dollars, and a Sankey-style flow diagram from grocery → prep → storage → plate.
4. The bottleneck is highlighted in red with the game-y one-liner: *"Sheet pan is 94% utilized. Adding a second sheet pan raises throughput 31%."*
5. Sliders for "what if I cook twice a week instead of once" recompute live.

## Technical approach

- **Stack**: Python + `scipy.optimize.linprog` (HiGHS) for the core solve, FastAPI, and a plain-HTML frontend with D3 for the Sankey. SQLite for the pantry model.
- **Model**: minimize `w1·spoilage_grams + w2·shopping_trips + w3·cook_hours` subject to: demand satisfaction per dish, storage volume ≤ capacity, cook-hours ≤ available, and a spoilage constraint per ingredient — an ingredient bought in quantity Q consumed at rate r wastes `max(0, Q − r·shelf_life)` per cycle. Integer batch counts are relaxed to continuous (that's the point — rates, not schedules), with one MILP pass only for purchase-unit rounding.
- **Data**: shelf lives from the USDA FoodKeeper dataset (open JSON, refrigerated/frozen/pantry durations per food), volumes estimated from a small hand-curated density table. Prices optional, manual.
- **Bottleneck**: read the shadow prices (dual values) straight out of the LP — the binding constraint with the largest dual *is* the bottleneck, no heuristics needed. This is the whole trick and it falls out for free.
- **Hard part**: getting real inputs without a data-entry death march. Mitigation: ship 12 pre-modeled dish templates so onboarding is picking from a list, not typing grams.

## v1 scope

- YAML file as the only input format — no UI for data entry.
- Text output: rate table + bottleneck line. No Sankey.
- Fridge/freezer/pantry as three volume buckets. One cook session per week.
- FoodKeeper shelf lives hardcoded for ~40 common ingredients.

## Out of scope

- Nutrition targets, calorie tracking, grocery-API price scraping, receipt scanning, mobile, multi-person households, leftovers-as-input recursion.

## Risks & unknowns

- Real eating is bursty and social; a steady-state model may be actively wrong for anyone who eats out three nights a week. Needs an explicit "chaos fraction" that scales demand down.
- Spoilage is nonlinear (opened vs. sealed) — the linear approximation may under-predict waste badly.
- Nobody may want fractional answers. "Cook 1.4 batches" is either delightful or infuriating; find out in week one.

## Done means

From a YAML file describing six dishes and one fridge, the tool prints per-dish weekly batch rates, per-ingredient purchase quantity and interval, a predicted weekly spoilage figure — and after four real weeks of following it, measured spoilage is within 30% of predicted.
