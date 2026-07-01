## Overview
Warm Boot is a live desktop wallpaper hosting a small creature whose vitality is bound to your machine's uptime and memory pressure, plus a global leaderboard that ranks players by how long they've gone without a reboot. It's for the nerds who quietly flex three-week uptimes — now the flex is visible, embodied, and competitive.

## Problem
The HN ritual — "have you restarted your computer this week?" — captures a real tension: high uptime is a badge of honor, but it's also why your machine crawls (leaked RAM, swap thrash, zombie processes). Nobody *feels* that cost until things grind. Uptime is invisible bookkeeping. Make it a creature you have to look at every day.

## How it works
A creature lives in your wallpaper. Each hour of uptime it grows. Plenty of free RAM = glossy and lively; heavy swap/memory pressure = it develops sores, slows down, and spawns a little parasite per runaway process. CPU temp sets its body temperature. A shared leaderboard ranks by current uptime streak. Here's the twist: rebooting resets your streak to zero but your pet *molts* into a fresh healthy form and banks a permanent "molt count." So two ladders compete — Longest Uptime (the masochist board) versus Most Molts (the responsible-adult board). At absurd uptime the pet starts begging, via speech bubble, to be put out of its misery.

## Technical approach
Ship it two ways from one HTML/JS core: a standalone Electron app rendering a transparent, always-on-bottom window, and a Wallpaper Engine web wallpaper. Pull metrics with the `systeminformation` npm package (uptime, mem, swap, load, cpu temp, process list). Render the creature in Canvas/PixiJS with a small state machine mapping continuous metrics to sprite modifiers (tint, sag, sore-decals, parasite sprites). Leaderboard is a tiny FastAPI + SQLite service: the client POSTs `{anon_id, uptime_secs, molts, mem_pressure}` every five minutes and GETs the top N. Reboot detection = uptime counter resetting downward. Anti-cheat is best-effort; this is a flex game, not a bank. The genuinely hard part is mapping continuous system metrics onto an animation that reads as a living animal rather than a dressed-up gauge — the emotional legibility is the whole product.

## v1 scope
- One creature with three health states
- Uptime + free-RAM as the only inputs
- Local display only (Electron window)
- Flat JSON leaderboard on a server
- Molt animation + count on detected reboot

## Out of scope
- Multiple pets or breeding
- Per-process parasite rendering
- Mobile
- Cosmetics/shop/skins

## Risks & unknowns
Wallpaper Engine's web-wallpaper sandbox may restrict system access, forcing the Electron path. CPU-temp reads need elevated permissions on some OSes. The leaderboard is trivially spoofable. Rendering perf must stay near-zero so it doesn't itself cause the slowdown it mocks.

## Done means
On a machine with 3-day uptime and high swap, the wallpaper shows a bloated, sore-covered, sluggish creature; rebooting produces a molt animation, a fresh healthy creature, and +1 molt count; and my uptime streak appears on the shared leaderboard within five minutes.
