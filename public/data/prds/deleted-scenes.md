## Overview
Deleted Scenes is a self-hosted service that periodically fingerprints your purchased digital libraries and alerts you the moment something you 'own' disappears, gets replaced, or is silently altered. For anyone who noticed that 'buy' increasingly means 'rent until the licensor changes its mind' — Sony just deleted 551 paid-for movies; PlayStation is ending physical discs.

## Problem
Digital ownership is a polite fiction. Purchases get revoked, books get edited post-sale, game versions get patched into different works, and streaming 'libraries' churn — usually with no notice. There's no personal ledger proving what you were promised, so you can't even tell what you lost. The itch: a tamper-evident receipt for your own digital shelf.

## How it works
You connect (or import exports from) your accounts. On a schedule, Deleted Scenes crawls each library and records a snapshot: item present/absent, edition/version string, page-count or runtime, cover-hash, license terms text. Each run diffs against the last. Any removal, downgrade, or content-change fires a notification (ntfy on the homelab) with a before/after diff and an archived screenshot of the store page as evidence. A timeline view shows your shelf's slow erosion over months.

## Technical approach
Stack: Python + Playwright for authenticated crawling, SQLite for snapshots, a small FastAPI/HTMX dashboard, ntfy for alerts (all already running on the homelab). Data sources, easiest first: Steam Web API (`GetOwnedGames`, plus store pages for version/EULA text), Kindle library export/scrape, Plex/Jellyfin for self-hosted media, and manual CSV import for PSN/streaming where APIs are hostile. Data model: `item(service, id, title, edition)` + append-only `snapshot(item_id, ts, present, version, runtime, cover_hash, terms_hash)`; diffs are just consecutive-snapshot comparisons. Evidence: store-page HTML + screenshot stored content-addressed. Hard part: robust authenticated scraping that survives login walls, bot-detection, and layout churn — and normalizing 'is this the same work?' when editions and version strings drift.

## v1 scope
- Two services only: Steam (API) + one local library (Plex/Jellyfin)
- Nightly snapshot + diff into SQLite
- ntfy alert on any removal or version change, with a text diff
- Dead-simple table dashboard

## Out of scope
- PSN/Kindle/streaming scrapers (manual CSV import only)
- Legal/DMCA archiving, actual file backup of the media itself
- Multi-user accounts

## Risks & unknowns
- ToS/anti-bot: authenticated scraping may violate terms and break often.
- False positives from cosmetic version/metadata churn.
- Storing screenshots of paywalled content — personal use only.

## Done means
After two nightly runs, if I hide/unpublish a title in my Jellyfin library or a Steam item's version string changes, I get a correct ntfy alert with an accurate before/after diff, and the timeline reflects it.
