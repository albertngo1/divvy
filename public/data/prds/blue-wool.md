## Overview
A macOS menubar app that slowly, irreversibly sun-bleaches your desktop wallpaper. Pixels your windows never cover receive "light" and fade; pixels permanently hidden under your editor stay vivid. It is a year-long photographic self-portrait of how you use a screen, made by a physical process rather than a chart. For anyone who likes ambient artifacts that reward patience.

## Problem
Quantified-self output is always a dashboard you have to go look at. Nobody opens their window-usage stats twice. Meanwhile the wallpaper is the one surface you stare at every day and it never changes. There is an unused canvas sitting behind everything, and a free data stream (window geometry) that nobody renders as anything but a heatmap.

## How it works
Every 10 seconds the app snapshots the on-screen window rectangles and adds "shade" to the cells they cover in a persistent exposure accumulator. Uncovered cells accrue exposure-hours. Once a day it re-renders the wallpaper from the *original* source image plus the accumulator, and sets it. The fade is per-pigment: cyan goes first, then magenta, yellow lingers, black barely moves — so exposed regions drift warm and red exactly like a shop-window poster. The masked regions don't stay pristine either: paper yellowing is applied uniformly, because paper yellows in the dark too. Exposure is weighted by real solar position for your latitude, so a morning person and a night owl bleach different hues. A hotkey does an A/B wipe against day 0; a menu item exports the 365-frame timelapse.

## Technical approach
Swift menubar app, no window. `CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID)` gives bounds + layer order without reading titles (geometry needs no Screen Recording grant; titles do — we never ask). Accumulator: float32 grid at 320×200 per display, mmap'd to disk, one cell = exposure-hours. Rasterize occlusion by painting window rects into a coverage buffer, then `E += dt * solarWeight * (1 - coverage)`.

Fade model: sRGB → linear → an approximate CMYK pigment decomposition; per-channel first-order photodegradation `A = A₀ · exp(−k_c · E)` with k values derived from ISO 105-B02 Blue Wool lightfastness ratings (BW2 cyan ≈ 30× BW7 black). Add a small saturation-independent yellowing term and a mild local-contrast loss. Render in Metal/Core Image at native resolution, write PNG to Application Support, `NSWorkspace.setDesktopImageURL`.

Hard part: making a year of change feel alive at day 3 without cheating the physics. Fix: Gaussian-blur the accumulator before sampling (soft penumbra, not crisp rectangles), plus the A/B reveal and timelapse so progress is inspectable on demand.

## v1 scope
- One display, one user-supplied source image
- 60s sampling, disk-backed accumulator, survives reboot
- Single global fade curve, daily re-render
- Daily PNG snapshot for timelapse
- Menubar item: exposure hours, "show original" hold

## Out of scope
- Multi-monitor, Spaces, per-app tinting
- Cloud sync, sharing, any network call
- Windows/Linux

## Risks & unknowns
- Users who rotate wallpapers will never see it accumulate
- macOS may throttle background window enumeration on battery
- The fade could read as "my monitor is broken"

## Done means
After 30 days of real use, someone shown the day-0 and today images side by side can point at where the editor sits — without being told to look for it. Timelapse exports as MP4.
