## Overview
A B2B tool for direct-to-consumer brands doing $1–50M/yr that also sell on Amazon. It audits every public place their price appears, predicts which discounts will trigger Amazon's price-competitiveness enforcement, and suggests promo structures that keep the discount for real customers without showing up as a lower "list price" to scrapers.

## Problem
The front-page HN piece on Amazon pushing up prices across the internet describes the mechanism. If Amazon sees an item cheaper elsewhere, it suppresses the Buy Box or the listing, which can cut sales by 80%. So brands raise prices everywhere. Brands that want to reward their own customers do it blind. A Shopify sale goes live, the crawler sees it, and the brand finds out later from a sales cliff. Nobody knows which signals Amazon actually reads: JSON-LD, Google Shopping feeds, visible price text, or third-party resellers.

## How it works
1. Connect Amazon Seller Central (SP-API) and Shopify.
2. The tool crawls the brand's own pages the way a price bot would (schema.org `Offer`, Google Merchant feed, rendered price, cart page) and finds third-party resellers via Google Shopping.
3. It joins those crawls against SP-API Buy Box eligibility and `featuredOfferEligibility` events over time. Each suppression is aligned to whichever external price changed in the 72 hours before it.
4. A dashboard shows **exposure**: every SKU, every surface showing a lower price, and the estimated Buy Box risk.
5. A promo planner rewrites a sale ("20% off sitewide") into lower-exposure forms: logged-in member price, bundle-only price, post-add-to-cart code, gift-with-purchase. It shows the predicted crawlable price for each.

## Technical approach
- Next.js + Postgres. Playwright crawler workers with no JS-disabled shortcuts, since the bot renders.
- SP-API: Product Pricing API (`getCompetitivePricing`, `getItemOffers`), Notifications `ANY_OFFER_CHANGED` and `PRICING_HEALTH` via SQS.
- Data model: `surface(sku, url, kind)`, `price_obs(surface_id, ts, price, source=jsonld|feed|dom)`, `buybox_event(sku, ts, eligible, reason)`.
- Hard part: causal attribution with very few events per brand. Pool anonymized events across customers to learn which surface types Amazon reacts to and with what lag. That shared dataset is the moat.

## v1 scope
- Shopify + SP-API connectors
- JSON-LD/feed/DOM price crawl for the brand's own site, every 6 hours
- Suppression timeline with the "what changed before" panel
- Manual promo-structure checklist, not yet a planner

## Out of scope (for now)
- Reseller enforcement (MAP letters)
- Walmart/Target parity
- Automatic price changes

## Risks & unknowns
- Legal/ToS optics: advising ways around a dominant platform's policy. Frame it as visibility, and get advice from an e-commerce lawyer.
- Amazon may change detection signals without notice.
- FTC action on this behavior could make the product unnecessary.

## Done means
For a pilot brand, at least 70% of Buy Box suppressions in a 30-day window show a correctly identified external price change in the preceding 72 hours. A planned member-price promo runs for a week with no suppression on its SKUs.
