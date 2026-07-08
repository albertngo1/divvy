## Overview
Weft is a self-hosted ambient artifact: once a day it takes one line of text you (or your machine) logged and renders it as a compact QR code using Jim's TrueType QR-code font, then places that glyph into the next open cell of a growing grid. Over a year the poster fills into a dense woven field of 365 tiny codes — looks like fabric or static from across the room, but every square is a scannable, readable day.

## Problem
Personal logging dies because the output is a boring text file nobody revisits. Ambient year-long artifacts (a slowly composed album, tree-ring wallpapers) prove people love a thing that quietly builds itself. Nothing turns a mundane daily one-liner into a physical, private, *scannable* keepsake.

## How it works
Each night a cron reads today's entry (from a plain `log.md`, a `divvy log` CLI, or auto-derived: top git commit subject, calendar event, or a Garmin one-word mood). It encodes the line as a QR payload, renders via the QR font at a fixed cell size, and composites it into cell `(month, day)` of a 12-column × 31-row SVG. The whole poster regenerates as one SVG/PNG you set as wallpaper or send to a print service. Zoom/scan any cell to recover that day's exact words. Optional AES-encrypt each payload so the poster is public-safe but only your key reveals the text.

## Technical approach
Node script + the QR TrueType font rendered headlessly via `takumi` (the trending 'JSX/HTML/CSS → SVG without a headless browser' repo) — perfect fit, no Puppeteer. Data model: `entries.jsonl` of `{date, text, cipher?}`; layout is deterministic from date so re-runs are idempotent and backfillable. QR generation: encode text → segments → the font's ligature substitution renders the matrix (fallback to `qrcode` lib to raster if font kerning fights us). Cron via launchd/systemd; output to `~/Pictures/weft-YYYY.png` at print-DPI (e.g. 300dpi A2). Hard part: keeping 365 QR codes individually scannable at poster scale — needs per-cell quiet-zone budgeting and capping payload length (truncate to ~40 chars, low error-correction) so each code stays low-version and legible when printed small.

## v1 scope
- `weft log "..."` appends today's line
- Nightly render of the full-year SVG grid via QR font
- One cell = one QR, deterministic month/day placement
- Export PNG at print DPI

## Out of scope
- Encryption (v2)
- Auto-derived entries from git/Garmin (v2)
- Multi-year mosaics, web viewer

## Risks & unknowns
- Print resolution vs scannability tradeoff — validate by phone-scanning a printed proof early
- QR font ligature quirks in headless render
- Daily habit adherence — the auto-derive fallback matters more than expected

## Done means
After logging entries on 7 different dated days, running the render produces a single grid image where a phone camera successfully scans at least those 7 cells back to their exact original text, and re-running with no new entry changes nothing.
