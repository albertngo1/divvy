## Overview
Write Ahead is a macOS menubar toy and screensaver that renders the SQLite write-ahead logs on your machine as a row of filling and draining vessels. Your Mac runs dozens of SQLite databases you never think about — Photos, Messages, Safari history, Spotlight, every Electron app — and each one breathes: writes push the WAL file up, a checkpoint dumps it back into the main database and the file collapses. That rhythm is invisible and, it turns out, quite beautiful.

## Problem
Two itches, one toy. The frivolous one: ambient desktop toys are almost always synthetic — fake fish, fake particles. Something driven by the real, hidden churn of your own machine is far more interesting to stare at. The serious one: a WAL that stops draining is a real failure mode. Long-lived reader connections starve the checkpointer, WAL files grow to gigabytes, and the pathological cases (the class of bug that just cost Tailscale a database) hide for months. Nothing on a normal desktop surfaces it.

## How it works
On launch it inventories SQLite databases: scan `~/Library`, `~/Documents`, and `/Library/Application Support` for files with a sibling `-wal`, plus walk open file descriptors of running processes to catch ones outside those trees. Each becomes a vessel, width proportional to `log(main db size)`, labeled with the owning app's icon. Once a second it `stat()`s the WAL. Fill level = WAL bytes over the default checkpoint threshold (1000 pages × page size ≈ 4MB). When the WAL size drops, that's a checkpoint: the vessel drains with a soft wooden clunk. Rapid writes make a vessel shimmer and rise; idle ones sit still and slowly go dusty.

The dangerous usefulness is the same data read differently: any vessel whose WAL exceeds 10× its database size, or which has not drained in 24 hours despite growth, turns amber and the menubar icon gets a dot. Click it and you get the file path, the owning process, and the actual `sqlite3` command to inspect it yourself.

## Technical approach
Swift + SwiftUI for the menubar popover; the screensaver is a `ScreenSaverView` sharing the same rendering code, drawn in Metal so a full screen of 40 vessels costs nothing. Discovery uses `FSEvents` on the candidate roots for new `-wal` files, and `proc_pidinfo`/`PROC_PIDLISTFDS` for fd→path→process attribution. Sampling is pure `stat(2)` at 1Hz, backing off to 10s when nothing changes.

The key design constraint, and the genuinely hard part: **never open the databases.** Opening a SQLite file to query `pragma wal_checkpoint` takes locks and can itself perturb — or, in the worst case, damage — someone else's live database. Everything must be inferred from file sizes, mtimes, and the 32-byte WAL header (read-only, first 32 bytes: magic, page size, checkpoint sequence number, salt). The checkpoint sequence number in that header is the honest signal for "has this actually checkpointed," and reading exactly 32 bytes is safe where a connection is not. Second hard part: App Sandbox and TCC mean `~/Library/Messages` is off limits without Full Disk Access, so the app must degrade gracefully to whatever it can see.

## v1 scope
- Menubar popover only, no screensaver
- Scan two hardcoded directories, no fd walking
- Vessels as flat rectangles, no Metal, no sound
- One alert rule: WAL > 10× db size

## Out of scope
- Windows/Linux, other engines (LMDB, LevelDB), any remediation or auto-checkpointing
- Historical charting, exports, cloud anything

## Risks & unknowns
TCC permissions may hide the most interesting databases. Sampling at 1Hz will alias fast checkpoint cycles, so the animation is an impression, not a trace. Distributing outside the App Store is likely required given the file access it wants.

## Done means
Leaving it running while you use Safari and Photos produces visibly different vessel behavior per app, a checkpoint is observable as a drain within two seconds of it happening, and deliberately holding a long read transaction open against a test database turns that vessel amber within a minute.
