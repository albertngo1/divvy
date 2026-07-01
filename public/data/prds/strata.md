## Overview
Strata is a geologic core sample of your own machine. A background agent deposits one thin 2px sediment layer per day, colored by that day's dominant app, CPU heat, and idle time. A year later you can read your life as rock strata — dense dark bands for crunch weeks, pale seams for quiet weekends — and scrub back to the exact stratum where a project cracked. The point is that it generates itself while you forget it exists.

## Problem
A year of working life leaves almost no artifact you can hold. Calendars are lists; screen-time dashboards reset weekly and get purged. There is no *object* of a year — nothing with grain, nothing you would frame. Existing quantified-self tools demand attention and produce charts you never revisit.

## How it works
Once a day a scheduled job samples a few cheap ambient signals: which app was frontmost longest, average CPU temperature, and the keystroke/idle ratio. It maps those to a color and appends a 2px horizontal stripe to a growing PNG — the core column gets one line taller each day. Hover a layer in a viewer to read that day's stats. No notifications, no dashboard, no daily prompt; it just accumulates until the texture alone tells the story.

## Technical approach — be specific and technical
Runtime: a small Python daemon on macOS scheduled by `launchd` (a `.plist` in `~/Library/LaunchAgents` with `StartCalendarInterval` at ~23:55). Signals are sampled throughout the day rather than once: a lightweight sampler fires every N minutes via a second launchd job that appends to an append-only JSONL log, then the nightly run aggregates.

Data sources: frontmost app via `Quartz`/`AppKit` (`NSWorkspace.frontmostApplication`) or polling `lsappinfo front`; CPU temperature via `powermetrics --samplers smc` (needs sudo) or an SMC read as fallback; idle time via `CGEventSourceSecondsSinceLastEventType` (`kCGAnyInputEventType`). Aggregation buckets frontmost-app seconds and picks the mode.

Data model: `layers.jsonl`, one record per day `{ date, dominantApp, appSeconds, avgTempC, idleRatio, keystrokes }`. Color mapping: hue from a stable hash of `dominantApp` into a fixed palette (an app→hue dict), saturation/darkness from `avgTempC` (hotter → darker), lightness from `idleRatio` (more idle → paler). Rendering uses Pillow: open the existing PNG, create a canvas one row taller, paste the old image, draw the new 2px band with `ImageDraw`. The viewer is a static HTML page mapping y-pixel → date via the JSONL.

The genuinely hard part: making a single 2px stripe carry three dimensions of meaning legibly, and keeping the daemon robust across 365 unattended runs (missed days, sleep/wake, temp-sensor failures) without ever nagging the user.

## v1 scope (humiliatingly small)
- One launchd job, once a day
- Reads ONE signal: which app was frontmost most of the day from a log
- Maps it to a color
- Appends a 2px stripe to a growing PNG

## Out of scope (for now)
- CPU temp, idle, keystrokes (later dimensions)
- Interactive scrub/hover viewer
- Multi-machine sync or cloud storage
- Windows/Linux support

## Risks & unknowns
- `powermetrics` needs sudo; SMC access may be flaky across macOS versions
- Sleep/wake and missed days leave gaps needing graceful handling
- Palette collisions make bands ambiguous once app count grows

## Done means — concrete, testable
It has run quietly for a week with zero interaction, and opening the PNG shows seven distinct colored bands you can correctly read back as "that was the Tuesday I lived in the editor."
