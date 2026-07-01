## Overview
Loot Ledger is a personal-finance reviewer disguised as a Grim Dawn / Diablo stash screen. You feed it a bank or credit-card CSV and every transaction becomes an item — with rarity, colour, affixes, and a satisfying *ding* — dropped into a grid you can sort and gawk at. It's for people who bounce hard off spreadsheets but will happily spend an hour organizing a fictional inventory.

## Problem
Reviewing your own spending is joyless, so nobody does it. Budgeting apps scold; spreadsheets are homework. Meanwhile the exact same brains will meticulously vendor-trash greys and hoard legendaries for hours. The itch: make looking at your money feel like looting, not accounting.

## How it works
Drop a CSV. Each transaction is rolled into an item card. **Rarity** comes from how unusual the charge is — a purchase in the 99th amount-percentile for its category, or a once-a-year outlier, glows legendary; the daily coffee is a common. **Affixes** are generated from the merchant category ("+3 Caffeine", "of Late Fees"). Recurring charges (same merchant, ~monthly cadence) become **set items** that link visually. Each month's single biggest expense is flagged a **boss drop**. You get a stash grid, sort-by-rarity, and a hover tooltip. That's the whole loop: import, ooh, sort, confront.

## Technical approach
Static single-page app, 100% client-side (privacy is the pitch — nothing leaves the browser). PapaParse for CSV. Rarity = percentile rank of `amount` within its inferred merchant-category, blended with a recurrence score. Recurrence detection clusters transactions by normalized merchant string and tests for ~30-day cadence. Affix pools keyed off a merchant-category-code → theme map. A deterministic seed per transaction id makes each item's rolled art/affixes stable across refreshes. The genuinely hard part is **merchant-name normalization** (`SQ *BLUE BOTTLE #4471` → "Coffee") and a rarity curve that feels *fair* rather than random — players will instantly reject arbitrariness.

## v1 scope
- One CSV import, one stash grid
- 4 rarity tiers with colour + glow
- Amount-percentile rarity only (skip recurrence at first)
- Hover tooltip with merchant, amount, affixes
- Everything in-browser, zero storage

## Out of scope
- Plaid / live bank APIs
- Budgeting advice or forecasts
- Multi-account merging, categories editor
- Any server or account

## Risks & unknowns
- Rarity mapping can feel arbitrary → tune against a real statement early
- CSV formats vary wildly between banks
- Guilt risk: a legendary medical bill isn't fun — lean playful, never preachy

## Done means
Import a real ~200-transaction CSV, see them rendered as sorted loot with stable rarities, refresh the page and get identical items, and confirm via network tab that nothing was uploaded.
