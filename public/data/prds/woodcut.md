## Overview
Woodcut is an ambient generative artifact: a desktop wallpaper (and matching print export) that adds exactly one narrow vertical column of 1-bit pixel art each day. Each column encodes that day — weather, daylight length, your step count — as dithered black-and-white texture. It quietly composes itself over a year into a single dense, woodcut-style poster. For people who like slow, self-generating keepsakes.

## Problem
Year-in-review artifacts are made *after* the fact from a database dump — they feel like reports. Nothing quietly accretes in front of you all year so that the artifact *is* the passage of time. Woodcut is the calendar as a growing print.

## How it works
Once a day a job fetches signals for your location, maps them to visual parameters (temperature → texture density, precipitation → hatch pattern, daylight hours → column height, steps → a small figure-ground motif), and renders a ~4px-wide column with ordered (Bayer) 1-bit dithering appended to the right edge of the growing image. It sets that PNG as your wallpaper. The palette is strictly black/white — pure 1-bit, print-ready. On Dec 31 the full 365-column image exports at poster DPI.

## Technical approach
Stack: a small Python script on the homelab run by cron/launchd. Weather from Open-Meteo (free, no key); daylight from a sunrise/sunset formula; steps from the local Garmin/Strava MCP. Rendering with Pillow: a deterministic mapping `day_signals -> column_bitmap` using a Bayer 4×4 threshold matrix for dithering, appended to a persisted canvas in SQLite/PNG so it's append-only and resumable. Wallpaper set via `osascript` (macOS) / feh (Linux). The genuinely fiddly part: designing the signal→texture mapping so the finished year is visually legible *and* pretty — you should be able to spot summer as a bright band and a storm week as dense hatching — without it turning into gray mush. Requires a preview mode that fast-forwards a synthetic year to tune the mapping.

## v1 scope
- One location, three signals (temp, precip, daylight)
- Daily append + wallpaper set (macOS)
- Preview mode: render a fake year in one shot to tune
- Dec-31 poster PNG export

## Out of scope
- Color, animation, multi-monitor tiling
- Cross-platform packaging
- Cloud sync / sharing

## Risks & unknowns
- Mapping legibility — the whole aesthetic rests on it
- Missed-day handling (laptop asleep) without gaps
- Wallpaper-setting reliability across OS updates

## Done means
The preview renders a synthetic year where summer and storms are visually distinguishable at a glance, and after a week of real runs the live image has grown by exactly seven correct columns with no gaps.
