## Overview
Patina is a live desktop wallpaper: a single elegant analog clock rendered as an aging metal dial. Unlike every other clock, its face is not static — it accumulates *wear* only during the minutes you are actually using the computer. Over a year the dial develops a patina that reads, at a glance, as the fingerprint of when you work, rest, and disappear. For anyone who likes ambient quantified-self artifacts that make themselves.

## Problem
Activity trackers bury your rhythm in dashboards you never open. The most honest record of how you spend your days is invisible. Meanwhile, a clock sits on your screen all day doing nothing but tell the time — a wasted canvas. Patina fuses the two: the object you already glance at a hundred times a day slowly becomes a record of your own presence, with zero effort and no chart to check.

## How it works
The wallpaper draws a brushed-metal dial with sweeping hands. Every minute you're *active* (recent input, non-idle, screen unlocked), the arc the hands pass over that minute is nudged one increment brighter/more-worn — like a threshold that thousands of shoes polish smooth. Minutes you're idle or away leave the metal dark and unworn. Because worn positions map to clock angle (i.e. time-of-day), a heavy 9am–6pm workday burnishes a bright band across those hours; late-night sessions carve a lonely groove; weekends read faint. The face never resets — it's a cumulative, sub-visible-per-day accretion that only becomes legible over weeks. On Dec 31 you export the final dial as a print.

## Technical approach
Cross-platform Rust with `wgpu` for a lightweight fullscreen wallpaper layer (or an Electron/`wallpaper`-crate fallback). Activity signal: OS idle-time APIs (`CGEventSourceSecondsSinceLastEventType` on macOS, `GetLastInputInfo` on Windows, `xprintidle`/idle DBus on Linux) sampled each minute; active = idle < 60s and session unlocked. Data model: a 1440-slot (minute-of-day) wear array of accumulated counts persisted to a small file; rendering maps each slot's count through a tone curve onto the dial's radial band. The interesting bit is the **tone curve tuned for a full year** — daily increments must be imperceptible yet legibly separate high- vs low-traffic hours by month 3 and not saturate by month 12, so wear uses a log/soft-clamp response calibrated to expected active-minute volumes.

## v1 scope
- One dial style, one screen, minute-tick idle sampling
- Persistent 1440-slot wear array + tone-curve render
- Manual 'export current dial as PNG' command

## Out of scope
- Multi-monitor, theme packs, config UI
- Per-app or per-project coloring
- Cloud sync

## Risks & unknowns
- Idle detection reliability across OS/lock states
- Tuning the curve so year-long legibility 'just works' without a mid-year reveal being boring or already-saturated
- GPU wallpaper perf/battery on laptops

## Done means
Running Patina with a fast-forward debug mode that feeds a synthetic week of activity produces a dial where the simulated 9–6 band is visibly more worn than nights/weekends, and the exported PNG shows that contrast clearly.
