## Overview
Decay Desk is a live wallpaper / overlay that treats your files, tabs, and bookmarks as radioactive isotopes. The instant you stop touching something, it begins to decay — dimming, shrinking, drifting toward a 'sediment' layer — following an exponential half-life. It's an ambient, self-generating portrait of what you're actually neglecting, refreshed with zero effort. For digital hoarders and anyone who felt the HN 'have you restarted your computer this week?' twinge.

## Problem
Neglect is invisible. Downloads folders, 400 open tabs, and dead bookmarks accumulate silently because nothing makes their staleness *felt*. Cleanup tools nag with lists; nobody reads lists. An ambient artifact that quietly shows decay reframes tidying as watching something die — far more motivating than a to-do.

## How it works
Each tracked item has a brightness/size computed as `exp(-Δt / halflife)`, where Δt is time since last access and the half-life depends on type (a Downloads file: days; a pinned project: months). Fresh items are bright and large near the 'surface'; untouched ones fade and sink into a decay band at the bottom. Opening a file 're-excites' it — it flares back to full and rises. Over weeks the wallpaper self-organizes into a living map of what you use vs. what's just rotting. Optional: a daily 'decay report' counts fully-decayed items you could safely delete.

## Technical approach
Stack: a small Rust or Go daemon + a transparent Tauri/Electron overlay window (or a rendered wallpaper image swapped via `osascript`/`feh`). Data: filesystem `atime`/`mtime` via `fs::metadata` for chosen folders (Downloads, Desktop, a project dir); browser bookmarks/history from the SQLite `places.sqlite`/`History` files (read-only copy to avoid locks). Data model: `items(path, type, last_access, half_life, x, y)`; positions via a lightweight force layout where 'freshness' pulls up and decay lets gravity win. Render loop recomputes intensity = `2^(-age/halflife)` each tick and draws glowing tiles on canvas. The genuinely hard part is honest 'last touched' signals — `atime` is often disabled (`relatime`), so fall back to `mtime` + an opt-in usage watcher (fswatch) that logs real opens.

## v1 scope
- Watch one folder (Downloads); read `mtime`
- Generate a static wallpaper PNG nightly: tiles glowing by freshness, sinking by age
- Set it as desktop background automatically

## Out of scope
- Live real-time animation and interactivity
- Deleting files (visualize only)
- Cross-machine sync

## Risks & unknowns
- `atime` unreliability; may misjudge 'untouched' and unfairly decay used files
- Privacy of surfacing filenames on a wallpaper (needs a blur/abstract mode)
- Performance/clutter with thousands of files — needs bucketing

## Done means
After a week running against a real Downloads folder, the nightly wallpaper visibly shows recently-saved files bright at top and month-old files dimmed and sunk, and touching an old file restores its brightness the next render.
