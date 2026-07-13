## Overview
Boneyard is a self-hosted daemon and slowly-growing 'web cemetery' for people who hoard bookmarks and write link-heavy notes/blogs. It's the mischievous inverse of changedetection.io: that tool watches strangers' pages *for change*; Boneyard watches *your own* outbound links *for death*.

## Problem
The web you saved is rotting under you — bookmarks 404, domains lapse, that perfect reference is gone and you never noticed. Change-detectors optimize for the living, freshly-updated web. Nothing keeps a dignified record of your personal link rot, and by the time you click a dead link the context is lost.

## How it works
You point Boneyard at sources: a browser bookmarks export, a folder of markdown notes, an RSS feed of your blog. It extracts every outbound URL, then on a nightly cron checks liveness (HTTP status, DNS resolution, soft-404 heuristics). When a previously-alive link crosses into death, it's exhumed: Boneyard queries the Wayback Machine for the last good snapshot, grabs a thumbnail, records date-of-death, and erects a tombstone. The UI is a scrollable graveyard sorted by death date — over a year it accretes into a visible timeline of what you lost, with a monthly 'obituary' digest via ntfy.

## Technical approach
Python + APScheduler (or a plain cron container) for the nightly sweep. Liveness: `httpx` HEAD/GET with redirect tracking; soft-404 detection via response-length delta against a known-good baseline and title heuristics. Snapshots via the Wayback `availability` API (`archive.org/wayback/available?url=&timestamp=`) plus a screenshot of the archived page with Playwright. Data model: SQLite `links(url, firstSeen, lastAlive, status, source)` and `tombstones(url, diedOn, waybackUrl, thumbPath)`. Serve a static gallery via FastAPI + a tiny HTML/CSS graveyard. Hard part: reliable soft-404 detection (parked domains and SPA error pages return 200) and not hammering hosts — rate-limit + jitter.

## v1 scope
- Ingest a bookmarks HTML export
- Nightly liveness check with status persisted to SQLite
- Tombstone page per dead link with Wayback link and death date

## Out of scope
- Playwright screenshots (v1 just links to Wayback)
- Auto-rewriting your notes to archived URLs
- Multi-user / hosted SaaS

## Risks & unknowns
- Soft-404 false positives (parked/SPA pages)
- Wayback rate limits and gaps for obscure URLs
- Some 'dead' links revive; need a resurrection path

## Done means
Feeding a bookmarks file with at least one known-dead URL produces, after one sweep, a tombstone entry with the correct death date and a working link to that URL's last Wayback snapshot.
