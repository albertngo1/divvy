## Overview
Foxing is a screensaver / ambient wall app that inverts Immich 3.0's promise of perfect, permanent preservation. Point it at a photo folder and it displays a living mosaic where images physically *decay* the longer they go unseen — losing resolution, gaining grain and color drift — the way memory and old prints actually fade ('foxing' being the brown age-spots on aging paper). It's for people who feel their 40,000-photo archive is a graveyard, not a memory. (Name from the archival term.)

## Problem
Modern photo tools optimize for total recall: everything kept, everything sharp, forever. But an archive where nothing decays is an archive where nothing is *precious* — it flattens the difference between the shot you cherish and the 200 near-duplicates you'll never open again. Immich remembers perfectly; humans don't, and the forgetting is part of what makes memory meaningful.

## How it works
Foxing scans a read-only source folder and maintains a shadow cache of working copies. Each photo has a 'freshness' that decays on a half-life since it was last *viewed in Foxing* (not since it was taken). As freshness drops, the displayed copy is degraded a notch: progressive JPEG re-encode at falling quality, added film-grain and slight desaturation/warm cast, eventually pixelation. The wall auto-arranges by freshness — sharp, vivid photos rise; forgotten ones sink into a hazy 'silt' band at the bottom. Clicking or lingering on a photo 'refreshes' it: freshness snaps back and the degraded copy is discarded, restoring the original crisp version. Originals are never touched.

## Technical approach
Electron or Tauri + a WebGL/Canvas mosaic; or a native macOS `.saver` if screensaver-only. Metadata store in SQLite: `path`, `last_viewed`, `freshness`, `degrade_level`. Decay job (every N minutes) recomputes `freshness = exp(-Δt / halflife)` and, when it crosses a level threshold, regenerates the working copy via `sharp` (libvips): JPEG quality ramp 92→20, grain via an overlaid noise texture, hue/saturation shift, downscale-then-upscale for pixelation. The hard parts: (1) making decay *legibly beautiful* rather than just ugly artifacts — the grain/color model needs art direction; (2) freshness bookkeeping that's honest and non-destructive (source folder mounted read-only, all mutation in the cache); (3) a cheap 'gaze' signal — dwell time under the cursor or center-screen — to drive refresh.

## v1 scope
- Point at a folder, tile a freshness-sorted mosaic
- Half-life decay recompute loop
- One degrade pipeline: JPEG-quality + grain + desaturation over 4 levels
- Click-to-refresh restoring the original
- Read-only source guarantee

## Out of scope
- Editing/deleting real files
- Cloud sync, sharing, albums
- Face/subject-aware protection
- Mobile

## Risks & unknowns
- Decay must look artful, not broken — biggest design risk
- Users may find intentional degradation stressful (make it obvious originals are safe)
- Continuous re-encoding I/O on huge libraries; cap active set

## Done means
After pointing Foxing at a 500-photo folder and leaving it a while (or fast-forwarding the clock), unopened photos visibly grain out and sink, a photo I click snaps back to full sharpness, and inspecting the source folder confirms every original file is byte-for-byte untouched.
