## Overview
Core Sample is a physical, self-generating keepsake for people who own a 3D printer and already log their lives (Garmin, git, weather). Instead of yet another year-in-review wallpaper, it grows a real object: twelve stackable printed segments that assemble into a translucent column resembling a geological or ice core — a legible cross-section of your year you can hold, gift, or put on a shelf.

## Problem
Ambient year-artifacts (Cambium, Long Player, Uptake) all live on a screen and get closed. Nothing on your desk changes with the year. Meanwhile most homelab 3D printers sit idle 29 days a month. A once-a-month unattended print is the sweet spot: reliable enough to trust, rare enough to feel like an event.

## How it works
Each night a job appends one thin "day disc" to a growing OpenSCAD model: disc radius = activity (steps + commit count, normalized), surface knurl/texture = stress (resting HR variance), a slight rotational twist = sleep debt. On the 1st of each month, a cron slices the completed 30-disc segment, kicks off a print on the Duet/OctoPrint, and starts a fresh segment. Each monthly segment has a keyed post/socket so the twelve stack in order into one ~30cm column. Optional filament swap per quarter for banding.

## Technical approach
Stack: Python orchestrator, OpenSCAD (CLI, `--render`) for parametric geometry, PrusaSlicer/Cura CLI for slicing, Duet HTTP API or OctoPrint REST to send gcode. Data pulled from local Garmin MCP, `git log --all --since`, and a weather API, cached to SQLite (`day(date, radius, twist, texture, band)`). The genuinely hard part is legible geometry: encoding 3–4 dimensions into a single-material FDM print that stays printable (no overhangs beyond 45°, minimum wall) while remaining visually readable — solved by constraining each day to a beveled disc and mapping stress to a coarse voronoi knurl rather than fine detail. Unattended print reliability (bed adhesion, filament runout) is the operational risk, mitigated by keeping each segment short (~30 discs, <2hr).

## v1 scope
- Nightly OpenSCAD append from git commit count only (one data source)
- Manual `make print-month` command (no auto-send yet)
- One flat keyed segment that stacks with a printed peg
- SQLite day table + a preview PNG render

## Out of scope
- Multi-material / auto filament swap
- Auto-slice-and-send cron (kick off by hand at first)
- Any cloud; fully local

## Risks & unknowns
- Failed unattended print ruins a month's data-object (keep the SQLite source of truth so it can reprint)
- People without a printer can't play (offer an STL export to a print service)
- Encoding may be pretty but illegible — needs a small legend card

## Done means
After running for one month against real git data, `make print-month` produces a sliced gcode that prints a 30-disc segment whose disc radii visibly track that month's commit counts, and the segment physically stacks onto a second month's segment via the keyed peg.
