## Overview
One Bit is a tiny always-on artifact generator: every day it picks one image tied to that day and renders it as a 1-bit dithered tile in a growing grid wallpaper. It's for people who like ambient keepsakes that accrete quietly — no dashboard, no streaks, just a picture of your year slowly assembling itself in glorious black and white.

## Problem
Years vanish. Photo libraries are searchable but never *seen*; screenshots pile up unlooked-at. Existing "year in review" tools dump everything at once in December. There's no calm, all-year object that makes the passage of time visible on your own screen, in a style with actual character rather than a bland collage.

## How it works
Each day at a set time, One Bit selects a source image — most-viewed photo, a screenshot, or a fallback from a watched folder — crops to square, converts to grayscale, and applies error-diffusion dithering (Floyd–Steinberg, with Atkinson and ordered-Bayer as style options). The 128×128 1-bit tile is dropped into its calendar cell in a 19×20 grid canvas. The updated PNG is written as the desktop wallpaper. Empty future cells show faint stipple placeholders, so the mural visibly *fills*. Hovering isn't the point; glancing is.

## Technical approach
- **Stack:** Python + Pillow/NumPy, run by cron/launchd (or a small Rust binary for a single-file install).
- **Dithering:** implement error diffusion directly on a NumPy grayscale array (serpentine scan for fewer artifacts); ordered dithering via a precomputed Bayer matrix. All classic, fast, ~50 lines.
- **Sources:** macOS Photos via `osxphotos`/the Photos SQLite library for "best of day"; a watched `~/OneBit/inbox/` folder; screenshot dir. Pluggable selector interface, first-match wins.
- **Canvas:** persistent `mural.png` + a `state.json` mapping date→tile hash so re-runs are idempotent and the year is reconstructable.
- **Wallpaper set:** `osascript`/`wallpaper` on macOS; feh/gsettings on Linux.
- **Hard part:** consistent, pleasant dithering across wildly different source images (dark photos, flat screenshots) — needs auto-contrast/gamma per tile so nothing turns into pure noise or a black square.

## v1 scope
- Watch one folder; take the newest image for today.
- Floyd–Steinberg only, fixed 128px tiles, fixed grid.
- Write `mural.png` and set it as wallpaper; skip gracefully if no image that day.

## Out of scope
- Photos-library integration, multiple dither styles, animation, cloud sync, print export.

## Risks & unknowns
- Auto-contrast per tile is fiddly; bad tiles ruin the calm effect.
- "Image of the day" selection is subjective — folder-drop v1 sidesteps it but is manual.
- 365 tiny tiles may read as mush at desktop resolution; tile size/grid needs tuning.

## Done means
After running for a week, the wallpaper shows exactly seven filled dithered tiles in the correct calendar cells with the rest faint placeholders, re-running the same day changes nothing (idempotent), and each tile is legibly the source image, not noise.
