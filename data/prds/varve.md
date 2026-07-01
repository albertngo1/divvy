## Overview
Varve is a set-and-forget desktop daemon that produces a single year-long generative artifact: a tall vertical image where each day deposits one thin horizontal band ('varve' = the annual sediment lamina geologists count like tree rings). For makers who love the *aesthetic* of long time-lapse data but never stick with journaling apps, Varve requires zero daily interaction — it just accretes.

## Problem
Every quantified-self tool demands a daily ritual you abandon by February. Meanwhile the most beautiful records — ice cores, tree rings, CERN beam logs during Long Shutdown — are *passive*: they form because time passes, not because someone remembered to log. There is no artifact that quietly earns its beauty over a year with no user effort.

## How it works
Once a day (configurable, default 03:00 local) the daemon samples a bundle of ambient signals for the *previous* day and renders them into a ~6px-tall band appended to the bottom of a growing PNG. Signal→visual mappings: mean CPU/RAM load → band brightness; local weather (temp/precip via Open-Meteo) → hue and grain; keystroke/active-window count → speckle density; wall-clock 'first activity' and 'last activity' → the band's left/right margins (a wide band = a long day). Rare events (a reboot, a >90% RAM spike, a public holiday) punch a visible 'ash layer' you can later date. At year end you get a scrollable strip you read like a paleoclimatologist: 'that dark compressed month was the crunch; those bright wide bands were vacation.'

## Technical approach
A tiny Python daemon (launchd on macOS) or Go binary. Ambient sampling: `psutil` for load, macOS `log show`/`ioreg` for uptime and reboots, an input-event counter (macOS: a lightweight `CGEventTap` listener storing only *counts*, never keystrokes, to disk), Open-Meteo's free forecast+archive API for weather keyed on a fixed lat/long. Data model: one append-only JSONL row per day `{date, load, temp, precip, activity_ms, keystrokes, reboots, flags[]}`. Rendering is deterministic from that JSONL via Pillow/`skia`, so the whole strip regenerates from data — you can re-theme a year retroactively. Each band uses layered Perlin/simplex noise seeded by the date so texture is stable across re-renders. The genuinely hard part is making a year of 6px bands *legible and gorgeous* rather than a gray smear — that's palette design and dynamic-range normalization across seasons (auto-contrast per rolling 30-day window so winter doesn't crush summer).

## v1 scope
- launchd daemon that appends one JSONL row/day
- three signals only: system load, weather, reboots
- deterministic strip renderer + a `varve render` CLI
- a static HTML viewer that lets you scroll and hover a band to see its date/stats

## Out of scope
- keystroke counting (privacy-sensitive; add opt-in later)
- mobile, cloud sync, multi-machine merge
- physical print/plotter export

## Risks & unknowns
Will a 365×6px strip actually look like anything, or mud? Requires visual prototyping with synthetic data. launchd reliability across sleep/wake. Weather API keyed to a fixed location breaks for travelers.

## Done means
After running for 14 real days (or replaying 365 days of synthetic JSONL) the viewer renders a strip where you can visually distinguish a weekend from a weekday and spot a reboot's ash layer without reading the tooltip.
