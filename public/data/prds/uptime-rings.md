## Overview
Uptime Rings turns your Mac's own power log — every boot, sleep, wake, clean shutdown, and kernel panic — into a slowly-growing radial "tree ring" mandala. The clock hand sweeps once per day; each ring is a week or month; sleep draws a thin band, a clean shutdown a notch, an unexpected reboot a red scar, and long uptime streaks thicken into dense wood. It sits in the menubar and quietly thickens while you work. At year's end you export one high-res PNG of your machine's biography.

## Problem
Uptime is a fact everyone carries and nobody sees. Your machine keeps a meticulous diary of thousands of tiny sessions, sleeps, and crashes — and it's completely invisible. There is no artifact of a year spent at a desk, no way to point at a mark and remember the panic during the demo.

## How it works
A background agent periodically parses the macOS power log, buckets events into (timestamp, event-type, duration), appends them to a local store, and re-renders a radial image. Angle encodes time-of-day, radius encodes elapsed weeks/months, and stroke style/color encodes event type. The image updates live and can be exported.

## Technical approach — specific & technical
Data source: `pmset -g log` (human-readable Sleep/Wake/DarkWake/Shutdown lines with `Using AC/Battery` and cause codes) as the primary parser, cross-checked against `log show --predicate 'subsystem == "com.apple.iokit.IOReporting"'` and `sysctl kern.boottime` for cold-boot detection. Kernel panics come from `/Library/Logs/DiagnosticReports/*.panic`. Parse with Python (`subprocess` + regex) into a normalized event list `{ts, type ∈ {boot,sleep,wake,shutdown,panic}, cause}`, persisted as SQLite or newline JSON in `~/.uptime-rings/events.db`. Rendering: `cairo`/`pycairo` (or SVG via `svgwrite`) drawing polar coordinates — `theta = 2π * (seconds_into_day / 86400)`, `r = base + ring_pitch * weeks_elapsed`; sleep = thin arc, shutdown = radial notch, panic = saturated red tick, streak thickness scales with continuous-uptime duration. Menubar host: `rumps` (Python) or SwiftBar plugin that shells out to the renderer. The hard part: `pmset` log wording and cause codes drift across macOS versions and are localized, so the parser needs resilient patterns and a fallback; deduping overlapping DarkWake/Wake events; and making the polar layout legible as a year fills in without overlap.

## v1 scope (humiliatingly small) — bullets
- `python rings.py` parses the last 30 days of `pmset -g log`.
- Buckets events into (day, type); no live update, no menubar.
- Draws ONE static radial PNG, one colored tick per event.
- A kernel panic must show as a visible red scar.

## Out of scope (for now)
- Menubar app, live re-rendering, launch-at-login agent.
- Year-long ring pitch tuning, wallpaper auto-set, multi-year archives.
- Cross-platform (Linux/Windows) log parsing.

## Risks & unknowns
- `pmset` output format/localization varies by macOS version.
- Panic reports may be absent or require permissions to read.
- Polar layout may look cluttered before design iteration.

## Done means — concrete, testable
Running the script on your own machine produces a ring PNG you'd set as wallpaper, and you can point at a specific red scar and say "that was the kernel panic during the demo."
