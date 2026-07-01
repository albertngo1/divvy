## Overview
Tombstone is a self-hosted watchdog and public monument for revoked digital ownership. You register the things you've 'bought' — a PlayStation movie, a Steam game, a Kindle book — and Tombstone periodically checks whether they still exist and are still available to the people who paid. When something gets delisted or remotely deleted (à la Sony wiping 551 movies people paid for), it stamps a dated tombstone with the last-known metadata and your proof-of-purchase, and adds it to a shared public timeline of revocations. For anyone who no longer trusts 'buy' to mean buy.

## Problem
Digital 'purchases' silently evaporate and the loss is invisible — no notification, no record, no accountability. There's no ledger of what's been revoked, so each incident feels isolated instead of a pattern. Tombstone makes the erasures durable and countable.

## How it works
You add items via URL or store ID. A scheduler re-checks each item's storefront page/API on a cadence and diffs availability signals (HTTP 404/410, 'no longer available' strings, removal from a catalog listing, price disappearing). On a confirmed transition from available→gone, it snapshots the page (title, art, date), files a tombstone, and optionally posts to a public wall and RSS feed. A collective view aggregates everyone's tombstones into a timeline of mass-delisting events, sortable by publisher.

## Technical approach
A small Python/FastAPI service + SQLite, deployable as a Docker container on a homelab. Checkers are per-store adapters: Steam has a real API (`store.steampowered.com/api/appdetails`) and app-list; most others need polite HTML scraping with a store-specific 'gone' heuristic and an ETag/text-hash to avoid false positives. Snapshots use a headless-Chromium screenshot + saved metadata JSON as evidence. The shared wall is an optional opt-in POST to a central instance; content is signed/hashed so tombstones are tamper-evident. The genuinely hard part is a low false-positive delisting detector — regional pricing, A/B pages, and CDN blips all masquerade as removal — so a transition must persist across K consecutive checks from multiple vantage points before it's tombstoned.

## v1 scope
- Steam-only adapter (real API, cleanest signal)
- Add app IDs, hourly availability check, local SQLite ledger
- A local web page listing your tombstones with snapshot + date
- RSS feed of your own revocations

## Out of scope
- Multi-store adapters, the shared public wall, account/auth, screenshots, mobile

## Risks & unknowns
Scraping fragility and ToS friction per store; distinguishing regional delisting from global; whether people will pre-register purchases before they're revoked (chicken-and-egg).

## Done means
With a Steam app that gets delisted (simulate via a fixture returning 'success:false'), the checker flips it to revoked after K checks and renders a dated tombstone with the last-known title and art in the local UI.
