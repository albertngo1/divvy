## Overview
Escapement is a browser tab / live wallpaper containing a single Rube-Goldberg physics machine tuned so that it completes in precisely 365 days. It's ambient art for people who like slowness — the marble descends one shelf per hour, a gear turns once a day, and the whole apparatus is your calendar. Named for the clock part that meters time one tick at a time.

## Problem
Screensavers reset the instant you look away; generative art loops on the scale of seconds. Nothing on your screen has a whole-year arc you can glance at and feel the season in. And a marble run is a toy — fun for ten seconds. What if the toy were also, dangerously, a working clock?

## How it works
On first launch it stamps an epoch and generates a contraption from a seed: a helical marble descent, escapement wheels, a slow siphon. The sim is deterministic and driven entirely by elapsed real time — position is a pure function of (now − epoch). Open it in June and the marble is already halfway down. Scrub the timeline to preview December. Read the date off the machine.

## Technical approach
Box3D (freshly released) or Rapier compiled to WASM for the physics, rendered on WebGL/Canvas. The core trick: decouple sim-time from wall-time and never free-run the integrator. Compute a target tick count = floor((now − epoch) / dt), then advance deterministically to that tick, using integer tick accumulation to avoid accumulated float error, with a daily state checkpoint so cold starts recompute in bounded time rather than replaying a year of steps. Config + epoch persist in localStorage. Optional bridge to FastLED so a physical LED column mirrors the marble's height. The genuinely hard part is determinism across restarts: floating-point physics is nondeterministic across builds, so v1 pins the engine version and leans on checkpoints + fixed dt.

## v1 scope
- One contraption: a marble on a helix mapping date → height
- Deterministic position from elapsed-time formula
- Runs in a browser tab, survives reload
- A scrub bar to preview any date

## Out of scope
- User-designed contraptions
- Multiplayer / shared machines
- Cross-device sync

## Risks & unknowns
- Float nondeterminism across engine versions (pin + checkpoint)
- People find a year-long marble boring within a week
- Getting the physics to 'land' exactly on Dec 31

## Done means
I open the page, note the marble's position, close the tab, reopen it a week later, and the marble is exactly where the elapsed-time formula predicts — within one shelf — with no drift after a forced browser restart.
