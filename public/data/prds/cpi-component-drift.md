## Overview

The 200-plus items tracked inside the Consumer Price Index basket — eggs, first-class stamps, men's haircuts, tires, and yes, payphone calls — rendered as a wall of sparklines, one per item, sorted by which decade each peaked in. Some items literally vanish: the basket is a living document, and you can watch line items get retired as the American shopping cart changes shape.

## Problem

The CPI is famous as a single scary number — "inflation was X% this year." Almost nobody sees the *composition*: the hundreds of granular series underneath, each with its own arc, some soaring, some crashing, some quietly deleted when the thing stopped being bought. The retirement of a line item (payphones, film developing) is a small cultural death, invisible in the headline figure. No peak-decade-sorted sparkline wall of CPI components exists — BLS exposes the categories and even a discontinued-series list, but nobody has turned it into a browsable artifact.

## How it works

A dense grid of sparklines, each cell one CPI item, sorted so that items peaking in the same decade cluster together — a diagonal wave of what mattered when. Color encodes status: still-in-basket vs retired. Click any cell to expand it full-width with the actual index values, the years it was tracked, and (for retired items) the date it left the basket and what, if anything, replaced it. Hover for the raw series and reweighting notes.

## Technical approach — specific

Stack: static site, Vite + TypeScript, D3 + Observable Plot for the sparkline grid (Plot's small-multiples facets handle the wall cleanly). Data source: BLS CPI detailed series via the public BLS API v2 (free, higher rate limit with a registered key) plus the BLS flat-file downloads for the full historical item-level series; the discontinued-series documentation identifies retired line items. Data model: prebaked `{item_code, item_name, status, [{year, index_value}], retired_year?}` — a few hundred series baked to one JSON. Key algorithms: peak-decade detection per series (argmax of a smoothed index) to drive the sort; normalization decision — show raw index vs inflation-adjusted (real) values, since a raw CPI sparkline mostly just shows general inflation and buries the item-specific story; status tagging by cross-referencing active vs discontinued series lists. The hard part is comparability across reweightings and item redefinitions: BLS periodically rebases, merges, and redefines items, so a "clean" 70-year series for one item often isn't continuous — splicing or honestly showing the breaks (and deciding real-vs-nominal) is the analytical crux that determines whether the wall tells a true story.

## v1 scope (humiliatingly small) — bullets

- ~60 hand-selected evocative items (eggs, stamps, haircuts, tires, payphones…), not all 200+
- Raw index values with a real-vs-nominal toggle deferred if needed
- Peak-decade sort + retired/active color; no reweighting corrections
- Sparkline grid + click-to-expand; no replacement-item linkage
- Prebaked JSON, no runtime BLS calls

## Out of scope (for now)

- Full 200+ item basket
- Reweighting/rebasing corrections and series splicing
- Regional CPI variants
- "What replaced this item" relationship graph

## Risks & unknowns — prior-art verdict: Open

The audit confirms it: BLS exposes categories and a discontinued list, but no peak-decade-sorted sparkline wall exists — genuinely un-built. Risks: series discontinuities from BLS reweightings can make a sparkline lie about long-run trends (mitigate by flagging breaks and starting series where they're continuous); raw vs real values dramatically change the shape and the "story," so the default must be chosen deliberately and disclosed; some evocative retired items (payphones) may have short or sparse series that undercut the payoff.

## Done means — concrete, testable

- Grid renders ~60 CPI items as sparklines, sorted by peak decade.
- Retired vs active items visually distinguished; retired items show their exit year.
- Click expands a cell to real BLS index values with the years tracked.
- At least three retired line items (e.g. payphone service) render correctly with a documented end date.
- Runs from prebaked JSON offline; the full wall exports as one shareable PNG.
