## Overview
Reboot Rings is a macOS/Windows menubar app plus a self-updating desktop wallpaper for people who never think about how often they reboot. It turns each boot cycle into a single growth ring on a generative wood-grain disc, so by year's end you're staring at a tree that grew itself from your uptime habits.

## Problem
The HN thread 'Have you restarted your computer this week?' exposed a quiet truth: our machines accrue invisible history — uptime, sleep debt, kernel panics — and we have no felt sense of it. Meanwhile CERN gets a ceremonial 'Long Shutdown' and we get a spinning beachball. There's no ambient artifact that rewards good digital hygiene or just lets you *see* the shape of your computing year.

## How it works
A background agent listens for boot and shutdown events. Each boot lays down a new concentric ring on a procedurally drawn tree cross-section. Ring width encodes session length (a marathon 12-day uptime = a thick fat-year ring; a reboot every morning = tight hairlines). Panics/hard shutdowns leave a scar or knot. Sleep-heavy days tint the ring cooler; heavy CPU days tint it warmer (a 'drought' ring). The disc is exported as the desktop wallpaper on every boot, so the artifact updates itself with zero interaction. A menubar popover shows the current ring count and 'age.'

## Technical approach
Stack: a small Swift/Tauri menubar host. Boot times from macOS `kern.boottime` sysctl / `last reboot`; on Windows, the System event log (event 6005/6006). Session metadata (avg CPU, thermal events, sleep counts) pulled from `pmset -g log` and `powermetrics` samples cached to a local SQLite ring table: `{ring_index, boot_ts, duration_s, panic_bool, warmth, wallpaper_hash}`. Rendering is a headless canvas (skia-canvas or an offscreen `<canvas>` in a hidden WebView) using a Worley/Perlin-noise wood-grain shader; rings are non-circular splines perturbed per year for organic irregularity. Wallpaper set via `NSWorkspace.setDesktopImageURL`. The genuinely hard part is aesthetics: making the accreted rings look like a real cross-section (grain continuity across rings, believable knots at scars) rather than an Illustrator gradient.

## v1 scope
- Detect boots, log them to SQLite
- Render a static wood disc with one ring per boot, width = uptime
- Set it as wallpaper on each boot
- Menubar item showing ring count

## Out of scope
- Windows/Linux ports (macOS first)
- Cloud sync, sharing, print-your-year posters
- Live-animating rings; per-app breakdowns

## Risks & unknowns
- Boot-event fidelity across sleep vs. shutdown is fuzzy
- Procedural wood that doesn't look tacky is a real art problem
- People who reboot rarely see almost no growth — need a slow-burn hook

## Done means
After three real reboots, the wallpaper visibly shows three distinct rings with widths proportional to how long each session ran, updated automatically with no manual step.
