## Overview
A menubar tool that runs survival analysis on your own output. Not "how much did you make" — **what fraction of what you made was ever read back.** For people who produce a constant stream of docs, notes, specs, and scripts and quietly suspect most of it is write-only memory.

## Problem
Every productivity tool measures production: commits, words, tasks closed. That's exactly the mirage — output volume feels like progress and is trivially gamed by producing more unread artifacts. The missing signal is *read-back*, and it's the only one that distinguishes a spec that shaped three months of work from a spec nobody opened twice. `git-of-theseus` does this for code lines; nothing covers the meeting notes, decks, spreadsheets, and one-off scripts that eat most of a week, and nothing frames it as a survival curve.

## How it works
You point it at your authorship roots (~/src, ~/Documents, an Obsidian vault). A nightly job enumerates files you created and collects evidence-of-reopen. From that it builds a **read-back curve**: P(never reopened) by day N since creation, right-censoring files too young to have had a chance.

The dashboard is three things:
1. One number — *read-back rate at 30 days: 19%*.
2. The hazard chart, which usually shows a brutal cliff around day 3: if a doc isn't reopened that week, it never will be.
3. A per-folder comparison that is the actually actionable output — `meeting-notes/` reads back at 6%, `specs/` at 71%, so stop writing meeting notes in that format — plus a leaderboard of your biggest write-only artifacts ranked by effort (bytes × edit sessions) with zero reads.

## Technical approach
Swift menubar shell, local SQLite, a small Vite + Observable Plot dashboard on localhost.

- **Creation:** `MDItemCopyAttribute` for `kMDItemContentCreationDate`, `kMDItemFSSize`; `git log --diff-filter=A --author=me --name-only` for code.
- **Reopen events:** LaunchServices updates `kMDItemLastUsedDate` when an app opens a document, so a nightly per-inode delta of that field is the event stream. Supplement with `com.apple.sharedfilelist` / sfl2 recent-items plists, and (opt-in) VS Code's `state.vscdb` recently-opened list. A later git commit touching a path counts as an independent reopen.
- **Model:** `artifact(inode, path, created, bytes, kind)` and an append-only `event(inode, ts, source)`, so curves recompute cheaply and history is never lost to a rescan.
- **Algorithm:** Kaplan–Meier with right-censoring at scan date, stratified per folder/kind (per-stratum KM first; no Cox regression until the strata prove interesting).

The hard part is that reopen evidence is lossy and noisy in opposite directions: `cat`/`rg`/`grep` reads never register at all, only the *last* use is stored so you see at most one event per nightly scan, and Time Machine, Spotlight reindexing, and cloud-sync daemons manufacture false touches. v1 reports read-back explicitly as a **lower bound**, with a calibration mode where you hand-label 20 files to estimate the undercount.

## v1 scope
- One folder root
- Nightly launchd scan writing to SQLite
- One Kaplan–Meier curve
- Top-20 write-only artifacts list

## Out of scope
Windows/Linux, Google Docs/Notion/cloud artifacts, team-wide rollups, any nudging or scolding.

## Risks & unknowns
Full Disk Access permission friction. It can be genuinely demoralizing — mitigate with per-kind baselines, since a scratch script *should* be write-only and only a spec being write-only is news. Users with Spotlight disabled on dev folders get nothing.

## Done means
After two weeks it prints a read-back-at-30-days figure with a plotted curve, and when you review its top 20 write-only files, you agree with at least 16 of them that you never opened it again.
