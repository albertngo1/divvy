## Overview
Union Label is a browser extension for ethically-minded shoppers. As you browse Amazon, Walmart, or Target, it detects the product category and injects a small card offering a comparable item sold by a worker-owned cooperative — sourced from directories like workerowned.info. It's a values-aligned price-comparison overlay for the co-op economy.

## Problem
Co-op and worker-owned businesses make great products but lose at the point of sale: they're invisible next to Amazon's default. Shoppers who'd happily buy co-op can't find the alternative in the moment that matters. The new 22k-product co-op directory has supply but no distribution into the actual buying flow.

## How it works
On a product page, the extension reads the product title/category, queries a matching service, and if a co-op alternative exists shows a card: 'Made by a worker-owned co-op — $X, ships in Y days.' Click to go buy it directly from the co-op or its marketplace. A monthly summary tells you how many purchases you redirected. Co-ops can claim/enrich their listings; matched clickthroughs are affiliate/referral tracked — the business model.

## Technical approach
Stack: WebExtension (Manifest V3) content script + a small matching API (FastAPI + Postgres + embeddings). Data: seed the catalog by scraping/importing workerowned.info and similar directories into `coop_product(name, category, coop, url, embedding)`. Matching: content script extracts the product title; API does category filter + vector similarity (sentence-transformers embeddings, pgvector) to find the nearest co-op product, thresholded so it stays silent when there's no real match. The hard part is match precision — a bad or spammy suggestion destroys trust instantly, so the bar for 'show a card' must be high, and category taxonomies across sources are messy. Affiliate attribution needs per-co-op referral links or a shared network.

## v1 scope
- Chrome extension, Amazon product pages only
- ~500 hand-curated co-op products in three categories (coffee, cleaning, apparel)
- Show a card only on high-confidence matches; otherwise stay hidden
- Click-through to the co-op's own store

## Out of scope
- Automated checkout / cart insertion
- Co-op self-serve onboarding portal
- Price/quality comparison beyond 'here's an alternative'

## Risks & unknowns
- Match quality across noisy categories
- Co-op fulfillment/shipping can't match Amazon → conversion may be low
- Monetization: affiliate rates for small co-ops are thin or nonexistent

## Done means
On ten common Amazon product pages (coffee, dish soap, a t-shirt), the extension shows a relevant co-op alternative on at least six and stays silent on the rest, with each suggestion linking to a real, in-stock co-op product.
