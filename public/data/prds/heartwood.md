## Overview
Heartwood is an ambient desktop wallpaper (and optional printable poster) that renders a slowly-thickening tree trunk in cross-section. Each day it lays down exactly one growth ring. Ring width, hue, and texture encode that day's signals—so by December you have a dendrochronological record of your year you can literally read like a forester reads a stump. It's for anyone who wants a passive, beautiful year-artifact that costs zero daily effort. Sparked by the 'cell built from scratch grows and divides' story: a system that quietly grows itself.

## Problem
Year-in-review artifacts are retrospective, generic, and require you to go make them. Nothing on your desk quietly becomes a meaningful object over time. And the most memorable days—the outages, the crunches, the wins—leave no trace.

## How it works
A nightly job reads the prior day's metrics and appends a ring to a persisted radial model. Wide rings = productive/active days (commits, keystrokes, steps); color drifts warm→cool by mood proxy (sleep, weather). Anomalies burn *scars*: a homelab outage or a red-CI day leaves a dark fire-scar wedge; a personal-record run leaves a bright fleck. The wallpaper re-renders each morning; the ring you're currently in shimmers subtly. Hover (in the config app) to read any ring's date and story.

## Technical approach
A menubar app (Electron or Tauri) + a nightly cron. Data adapters: local git commit counts, `pmset`/uptime for outages, Garmin MCP for sleep/steps, a weather API for hue, optional Uptime Kuma webhook for scar events. Model is a JSON array of ring records `{date, width, hue, scars[]}`. Rendering: Canvas/SVG drawing concentric closed Catmull-Rom curves with per-ring Perlin-jittered radius for organic irregularity; scars are radial dark gradients clipped to a wedge; bark and pith textures via layered noise. Export to a high-res PNG for print. The hard part is making it read as *wood*, not tree-ring-chart clip-art—needs believable cellular texture and irregular, non-concentric growth.

## v1 scope
- One data source: local git commits → ring width
- Nightly ring append + PNG wallpaper regen
- Simple scar rule: any day with zero commits after a streak = thin gray ring
- Config app just shows the current image

## Out of scope
- Multi-machine merging
- Live real-time animation
- Cloud sync

## Risks & unknowns
- Aesthetic risk: easy to look like a chart, hard to look like heartwood
- Backfill: seeding history from git log is fine; other sources aren't retroactive
- 365 rings must stay legible at wallpaper resolution

## Done means
After running 30 days, the wallpaper shows 30 visibly distinct, organic rings—including at least one scar for a real off-day—and a viewer can point to a ring and correctly name roughly when it happened.
