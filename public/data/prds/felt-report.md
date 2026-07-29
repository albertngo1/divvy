## Overview
A macOS desktop wallpaper (and matching screensaver) that renders your day as a **helicorder** — the rotating-drum paper trace seismic stations have printed since the 1930s. Twenty-four wrapped lines, one per hour, ink amplitude driven by your own input energy. It is for one person, entirely offline, and it never records *what* you typed — only how hard the ground shook.

## Problem
Every activity tracker draws the same bar chart and tells you the same nothing: "4h 12m active." The interesting structure of a working day isn't a total, it's the *event shape* — the sudden onset, the long coda, the aftershock at 11pm when you couldn't leave it alone. Seismology already invented instruments and statistics for exactly that shape, and nobody has pointed them at a person.

## How it works
Input events become a synthetic ground-motion trace sampled at 50 Hz. A keystroke is an impulse; mouse motion contributes |velocity|; scroll contributes its own band. The trace is band-limited and drawn on the wallpaper with real drum conventions: amplitude clipping that bleeds into the line above, hour ticks, a hand-lettered station code.

A classic **STA/LTA trigger** (short-term average 2 s over long-term average 120 s, trigger ratio 3.0, detrigger 1.5) declares discrete *events*. Each gets a local magnitude ML = log10(peak amplitude) + a distance-free calibration constant, an origin time, and a duration. Events land in a SQLite catalog. At midnight the toy fits a **Gutenberg–Richter** relation (log N = a − bM) to your personal catalog and shows your b-value — a real number describing whether your work is many small tremors or a few big ruptures. It also fits **Omori decay** to post-event activity, so a genuinely absorbing session visibly produces aftershocks.

Occasionally, after a large event, the menubar asks you to file a *felt report* (I–VII intensity, one line of text) — the only subjective data it stores.

## Technical approach
Swift + Metal. Input capture via `CGEventTap` in listen-only mode (Accessibility permission) or `IOHIDManager`, counting event types and deltas — keycodes are discarded before they leave the callback, which the README states and the code makes obvious. Ring buffer of 50 Hz samples in shared memory; the wallpaper is a borderless `NSWindow` at `kCGDesktopWindowLevel` redrawing the drum as a single Metal texture (a scrolling ring, not a full redraw). Catalog in SQLite via GRDB. Gutenberg–Richter b-value by maximum likelihood (Aki estimator, b = log10(e)/(M̄ − Mc)) with completeness magnitude Mc from the maximum-curvature method.

The hard part is calibration: raw input energy is wildly non-stationary across apps (a video call is a flat line; a rebase is a swarm), so Mc and the LTA baseline must adapt per-day or the catalog is either empty or 4,000 events long. Expect a week of tuning against your own logs.

## v1 scope
- Keystroke + mouse-delta capture into a 50 Hz trace
- Static wallpaper image regenerated every 60 s (no Metal yet — write a PNG)
- STA/LTA trigger, ML, SQLite catalog
- One command: `felt catalog --today`

## Out of scope
Per-app attribution, iOS, sharing, anything that reads window titles or text.

## Risks & unknowns
Accessibility permission scares people (mitigate: ship the tap code in one 40-line file). The b-value may be statistically meaningless with <50 events. Aesthetics carry this — an ugly drum is a dead project.

## Done means
After one week, `felt catalog` lists ≥20 events, the wallpaper drum is legible from across the room, and you can point at a line and correctly recall what you were doing.
