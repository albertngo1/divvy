## Overview
Deaccession is a background daemon plus an auto-generated memorial wall that tracks the media you paid for and watches it decay out of your possession. It's for anyone who noticed that 'Buy' is a lie — the Sony customers who woke up to 551 deleted films, the disc-buyers being sunset in 2028, the streaming diehards whose watchlist rots one licensing deal at a time.

## Problem
Digital ownership is a slow, silent rug-pull. Titles disappear, runtimes get quietly trimmed for new edits, box art swaps, 4K downgrades to HD. There's no receipt, no funeral, no proof it was ever yours. You only notice when you go looking — and by then the evidence is gone.

## How it works
You point Deaccession at your libraries: a Jellyfin/Plex server, a CSV of purchases, a Trakt/Letterboxd watchlist, a Steam library. Once a week it takes a fingerprinted snapshot (title, runtime, edition, hash, availability). It diffs against last week. When something goes missing — or changes shape — it doesn't just log it; it engraves a tombstone with a death date, a cause ('removed from PSN 2026-06-30'), and the last-known metadata. Over a year the wall fills with headstones. It's a memorial you never wanted, and quietly, damning evidence.

## Technical approach
Python daemon on a weekly cron, state in SQLite. Sources: Jellyfin/Plex REST APIs, the unofficial JustWatch API for availability windows, Trakt/Letterboxd exports, Steam Web API. Each item gets a metadata fingerprint (normalized title + year + runtime bucket + edition). A diff engine classifies each delta as REMOVED, EDITED (runtime/edition drift), or DOWNGRADED. Static memorial rendered with Astro; each tombstone links to the snapshot JSON. The genuinely hard part is false positives: a single API hiccup or a regional licensing flicker looks identical to a real removal — so a death requires N consecutive weekly misses AND cross-source confirmation before the headstone is carved.

## v1 scope
- One source: a Jellyfin server
- Weekly snapshot + diff, stored in SQLite
- A single static HTML 'memorial wall' with dated tombstones
- Manual 'confirm death' button to suppress false positives

## Out of scope
- Automated re-acquisition or DRM stripping
- Real-time alerts
- Multi-user hosting

## Risks & unknowns
- False positives from flaky APIs (mitigated by consecutive-miss + cross-source rule)
- Scraping ToS friction on availability sources
- Emotional payload might read as bleak rather than useful

## Done means
After two weeks of running against a Jellyfin library, I delete one title on purpose; on the next snapshot the memorial wall shows a correctly dated tombstone for it — and shows no tombstones for a title that merely went briefly unreachable.
