## Overview
Late Fee is a small daemon that sits on top of a self-hosted media server and imposes scarcity on it. Instead of eleven thousand titles and forty minutes of scrolling, you get a shelf of six, restocked weekly, with a checkout limit and consequences for abandoning things. For the solo watcher who owns a huge library and watches the same four things.

## Problem
Infinite choice killed the pleasure of picking. A video store worked because the shelf was small, the covers faced out, and taking something home was a commitment — you watched the weird one because you'd already paid for it. A Jellyfin homepage is the exact opposite: everything available, nothing chosen, browsing indistinguishable from watching.

## How it works
Every Friday at 6pm a cron job restocks the shelf with six titles drawn by rule, not by "recommendation":
- 1 **New Release** — most recently added item you've never played
- 2 **Staff Picks** — added more than 180 days ago, still zero playback (the guilt shelf)
- 2 **Wrong Section** — random picks from your two least-watched genres
- 1 **Wall of Shame** — something you started and abandoned above 10% and below 80%

You may have two titles checked out at once, due in seven days. While the shelf is live, the rest of the library is *not visible* — not dimmed, not sorted down, gone. Returning something unwatched costs you: the next shelf has five slots instead of six, and you owe a Rewind — five minutes of the abandoned title plays before anything new will start. Slots recover one per clean week.

## Technical approach
Python + APScheduler + SQLite, talking to the Jellyfin HTTP API. Library state comes from `GET /Items` with `Fields=DateCreated,UserData`; playback truth from polling `GET /Sessions` for `PlaybackStopped` plus per-item `UserData.PlayedPercentage`, or a Jellyfin webhook plugin if installed.

Hiding the library uses Jellyfin's real access controls: `POST /Users/{id}/Policy` with `EnableAllFolders=false` and `EnabledFolders=[videoStoreLibraryId]`. Data model: `shelves(id, week_of, slots)`, `stock(shelf_id, item_id, slot_kind)`, `rentals(item_id, out_at, due_at, returned_at, max_pct)`, `debts(kind, item_id, settled_at)`.

The genuinely hard part: Jellyfin's visibility is **library-granular, not item-granular**. So the daemon maintains a real "Video Store" library that is a directory of symlinks to the six chosen files, and triggers `POST /Library/Refresh` after churning them. That means every restock costs a metadata scan, symlink paths must survive Jellyfin's path caching, and a mid-scan client request can briefly see an empty store — handling that gracefully is most of the actual engineering.

## v1 scope
- Single user, hardcoded server URL and API key in a `.env`
- Weekly restock with the four slot rules, no fees, no debts
- Symlink library + refresh + policy toggle
- `latefee status` CLI printing the shelf and days remaining

## Out of scope
- Multi-user, any web UI, a Jellyfin plugin proper
- Plex/Emby support
- Recommendation quality of any kind — the rules are deliberately dumb

## Risks & unknowns
- You can undo the whole thing from the Jellyfin admin panel in ten seconds; the commitment device is only as strong as your willingness to not do that.
- Symlink + refresh churn may bloat Jellyfin's DB or lose watch history if item IDs are regenerated per scan — needs verification early, it could sink the approach.
- Restock rules could produce six titles you'd never watch and you just stop opening the app.

## Done means
After a full week of running: you cannot browse the full library from the client, the shelf shows exactly six titles with the four slot kinds represented, returning an unwatched checkout shrinks next week's shelf to five, and you finished something you would not have picked.
