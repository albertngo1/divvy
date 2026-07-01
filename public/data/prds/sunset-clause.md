## Overview
Sunset Clause is a consumer SaaS that monitors the digital media you've purchased across storefronts (PlayStation, Steam, Kindle, Apple, Google Play) and alerts you when a title is about to be delisted, region-locked, or license-revoked. For the person who just learned Sony can delete 551 movies they paid for.

## Problem
'Buy' on a digital store is a lie — it's a revocable license, and revocations happen quietly. There's no dashboard of what you own, no changelog when something is pulled, and no warning before it disappears. By the time you notice, the download window is gone.

## How it works
You connect (or import order-history exports from) your storefronts. Sunset Clause builds a unified ledger of your purchases and their license status. A crawler watches public delisting signals — storefront availability endpoints, publisher notices, subreddit/RSS delisting trackers, and rights-holder press releases. When a title you own trends toward removal, you get a push/email with a countdown and a 'download now while you can' nudge. A weekly digest shows license drift across your library.

## Technical approach
Stack: TypeScript, Postgres, a queue of per-storefront scrapers (Playwright for gated pages, plain fetch for availability APIs). Data model: `user`, `entitlement` (store, external_id, title, purchase_date, last_seen_available), `catalog_status` (title, region, available_bool, checked_at, evidence_url). Core loop: nightly diff of `catalog_status` per region; a title flips available→unavailable → generate an alert with the evidence URL. The hard part is entitlement ingestion without official APIs — most stores have no 'list what I bought' endpoint, so v1 leans on user-uploaded order-history/CSV exports and email-receipt parsing (forward receipts to a dedicated inbox, parse with a template + LLM fallback). Delisting detection is noisy: temporary outages vs. real removals require a debounce window (N consecutive days unavailable across regions).

## v1 scope
- One storefront: Steam (public store API + owned-games via Steam Web API key)
- Nightly availability check per owned appid
- Email alert when an owned game becomes unavailable/delisted
- A read-only web ledger of owned titles + last-seen-available

## Out of scope
- Actually downloading/archiving the content (legal minefield)
- Movie/book stores (add after Steam proves the loop)
- Refund automation or chargeback help

## Risks & unknowns
- No official 'my purchases' APIs for most stores → ingestion friction
- False positives from transient outages erode trust
- Storefront ToS may prohibit scraping owned-library pages
- Willingness to pay: is a delisting alert worth $3/mo?

## Done means
A test user connects a Steam account, an owned game is delisted in the store, and within 48 hours they receive an email naming the title with a link to the evidence of removal — no false alert fired during a 10-minute store outage the same week.
