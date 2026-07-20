## Overview
Toast is a tiny macOS menubar daemon for people who feel nibbled to death by banners. It captures every notification the system delivers over a year and, on New Year's Eve, renders a single large-format poster: a woven tapestry of your attention being taken. It's an ambient artifact you never actively make — it just accretes.

## Problem
Notifications are the most-consumed, least-examined data stream in your life. You dismiss thousands a month and never see the shape of them: which apps own you, when the swarm peaks, how a new job or breakup changed the rhythm. Screen Time gives you app *minutes*, never the interruption *texture*.

## How it works
A background agent polls the macOS Notification Center store every few minutes and appends new records to its own append-only SQLite log (app bundle id, delivery timestamp, coarse category — never body text, kept local). The menubar shows a live "interruptions today" sparkline. The artifact is a poster: 365 vertical day-columns × 24 hourly cells, each cell a stacked micro-bar colored by app cluster (comms / calendar / social / system / work). Density becomes visible — the 9am email tide, the 11pm doomscroll band, the dead week you were on vacation. A second "warp thread" overlay draws month-boundary lines so the year reads like fabric.

## Technical approach
Swift menubar app (SwiftUI + AppKit `NSStatusItem`). Data source: the on-disk notification DB at `~/Library/Group Containers/group.com.apple.usernoted/db2/db` (SQLite; the `record` column holds a binary plist — parse with `PropertyListSerialization` to extract `app` and `date`). Reading it requires Full Disk Access; the app requests it on first launch. Because macOS prunes that DB, the daemon mirrors new rows into its own store hourly so history survives. Poster render: generate an SVG (columns × hours grid, `hcl`-spaced categorical palette validated for contrast), rasterize to a print-res PNG via `WKWebView` snapshot. The genuinely hard part is robustly parsing the undocumented, version-drifting bplist blob and de-duping records across the DB's rotation.

## v1 scope
- Menubar item with today's interruption count + top-3 apps
- Hourly mirror job into local SQLite
- "Render poster (data so far)" button → PNG
- 6 hard-coded app category buckets

## Out of scope
- Windows/Linux, iOS
- Notification *content* analysis or LLM summaries
- Cloud sync, sharing

## Risks & unknowns
- The private DB schema/bplist layout can change across macOS releases and break parsing.
- Full Disk Access is a friction wall some users won't grant.
- Notification Center may not retain enough history before the mirror starts (year one is partial).

## Done means
After running for a week on a real Mac, the "render poster" button produces a PNG where you can visually pick out your daily peak notification hour, and the app-category colors match a manual spot-check of that week's actual notifications.
