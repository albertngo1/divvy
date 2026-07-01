## Overview
Clawback tracks the digital media you've "purchased" and warns you when a platform delists, revokes, or deletes it — then memorializes the losses on a visual wall. For anyone who noticed Sony just deleted 551 movies people paid for and realized "buy" is a lie.

## Problem
Digital purchases are revocable licenses dressed as ownership. When a title vanishes there's no receipt, no notice, no gravestone — it just quietly disappears from your library. There's no personal ledger of what you're owed and what's been clawed back.

## How it works
You enter (or import) your purchases per platform: title, store, date, price. Clawback periodically checks public delisting signals — community-maintained delist lists, store-page 404s, region-availability APIs — and flags anything that's gone. Losses move to a "Memorial" view: a wall of tombstones showing what you paid, when it vanished, and (where known) why. An optional "Rescue" nudge suggests DRM-free or physical alternatives before a title is likely to disappear (e.g. PlayStation ending disc production → your disc-only titles are at risk).

## Technical approach
Self-hosted SvelteKit/Next app + SQLite. Data model: `purchase -> {title, platform, external_id, price, bought_at, status}` where status ∈ {owned, delisted, revoked, at_risk}. Checking is a scheduled job that scrapes/queries store pages (PSN, Steam, Kindle where feasible) and cross-references community delist datasets. IPFS-flavored angle: for DRM-free items you own, optionally pin a provenance record (hash + receipt) so your *proof of purchase* can't itself be deleted. The hard part is signal quality — distinguishing a genuine delist from a temporary regional outage or a store-page redesign.

## v1 scope
- Manual entry of purchases across platforms
- One automated checker for a single store (Steam app-page status is easiest)
- A memorial wall visualization of delisted items

## Out of scope
- Auto-importing full purchase history via login/OAuth
- Legal/refund automation
- Actually backing up the media itself

## Risks & unknowns
Store scraping is brittle and ToS-adjacent. False positives (regional blips) would erode trust fast. Getting anyone to hand-enter purchases is a cold-start problem — needs at least one real import path to be sticky.

## Done means
You can log a purchase, have the checker correctly flag a genuinely delisted title as gone, and see it appear on the memorial wall with its price and vanish-date.
