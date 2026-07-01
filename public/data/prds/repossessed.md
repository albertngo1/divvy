## Overview
Repossessed is a self-hosted watchdog for your digital purchases. It periodically checks the storefronts where you "own" media — PlayStation, Kindle, iTunes, Steam, Audible — and alerts you when something you bought vanishes, gets replaced with an edited version, or has its access terms quietly changed. For anyone who noticed Sony can delete 551 movies you paid for and wants receipts.

## Problem
Digital ownership is a polite fiction. Publishers revoke films, swap in censored edits, and pull books with zero notification — you find out only when you go to watch and it's gone. There's no smoke alarm for your own library, and no evidence trail when a purchase disappears, making refunds or public shaming impossible.

## How it works
You add accounts (via cookie/session import or manual library export). Repossessed builds a manifest of everything you own: title, edition, purchase date, current availability, and a content fingerprint where obtainable (runtime, chapter list, file hash, cover art hash). On a schedule it re-scrapes each library, diffs against the last manifest, and fires a notification when an item flips to unavailable, changes runtime/edition, or has altered metadata — with a before/after snapshot preserved as evidence.

## Technical approach
Dockerized Python service + Postgres for manifests and a full history table (append-only, so you have a permanent timeline of every change). Per-storefront scraper plugins using authenticated `httpx` sessions against the same JSON endpoints the web libraries use; where a real content hash is impossible, fall back to structural fingerprints (runtime, chapter count, art perceptual-hash via `imagehash`). A diff engine compares consecutive manifests and classifies changes (removed / edition-swapped / metadata-altered). Notifications through ntfy/Apprise. Hard part is the fragile, auth-gated, ToS-hostile scraping — endpoints rotate and rate-limit, so the plugin layer must be resilient and gentle.

## v1 scope
- One storefront plugin (Steam or a CSV-import fallback for any library)
- Manifest build + nightly re-scan
- Diff detection for removed/changed items
- ntfy alert with before/after snapshot
- Local web page listing your library and its change history

## Out of scope
- Automated refund filing
- DRM-stripping or re-downloading content
- Mobile app
- Multi-user/hosted SaaS

## Risks & unknowns
- Scraping authenticated storefronts likely violates ToS and breaks often
- Some libraries offer no stable fingerprint, weakening "was this edited" detection
- Session/cookie handling is a security liability if mishandled
- Legal gray area around storing evidence of others' content

## Done means
After importing a library and running two scans across a window in which one item was removed and one had its metadata changed, Repossessed shows both events in the history timeline with accurate before/after snapshots and delivers an ntfy alert for each.
