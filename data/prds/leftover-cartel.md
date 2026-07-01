## Overview
Leftover Cartel is a household web app that gamifies eating leftovers before they spoil, wearing the skin of a small-time culinary empire à la Schedule I. Every cooked batch is "product": its purity is freshness (decaying daily), its quantity is portions. You move product (log meals) before the heat — spoilage — busts you. For home cooks who hate throwing food out and are tired of joyless "eat me first" sticky notes.

## Problem
Leftovers rot at the back of the fridge because tracking them is a boring chore with no feedback loop. Existing food-waste apps feel like homework, so nobody logs anything. Wrapping the chore in a low-stakes criminal-empire fantasy gives every eaten portion a little dopamine hit and every spoiled container a satisfying sting.

## How it works
Add a batch: name, portions, cook date, fridge or freezer. Freshness decays along a per-food shelf-life curve; a "heat level" rises as an item nears spoilage. The main view is a heat-sorted queue — your eat-me-first hit list. Logging a portion eaten is a "sale": score up, streak preserved. Let a batch spoil and it's a "bust": the item is seized, you take a penalty, streak breaks. A weekly Kingpin score rewards the lowest waste. The crime-flavored copy is the spoonful of sugar; the real payload is you actually eating your leftovers.

## Technical approach
Static SvelteKit app with IndexedDB (or SQLite via wa-sqlite). Shelf-life curves seeded from the public USDA FoodKeeper dataset for ~30 common cooked foods. Data model: batches(id, name, portions_total, portions_left, cooked_at, storage, shelf_life_days); heat = f(days_elapsed / shelf_life). Optional later integration with Albert's Mealie API (:9000) to import cooked recipes as batches and infer shelf life. ntfy push when a batch crosses into "high heat." The genuinely hard part is realistic per-food, per-storage decay curves AND making logging frictionless enough that the app doesn't join the chore-app graveyard.

## v1 scope
- Manually add batches (name, portions, date, storage)
- Heat-sorted "eat me first" queue
- Tap to log a portion ("sale"); daily waste + streak score
- Hardcoded FoodKeeper table for ~30 foods

## Out of scope
- Mealie import
- ntfy notifications
- Multi-household / accounts, barcode scanning

## Risks & unknowns
- Decay curves too crude to feel trustworthy
- Logging friction killing adoption after week one
- Crime skin reading as tasteless to some users (make it toggleable)

## Done means
I can add three leftover batches, see them ranked by spoilage urgency with a rising heat indicator, log portions as "sales" that raise my score, watch an unlogged batch cross into "bust" with a penalty, and check a weekly waste/streak Kingpin score — all persisting locally across reloads.
