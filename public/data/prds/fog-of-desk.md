## Overview

A macOS menubar toy plus screensaver that inverts every mouse-tracking visualizer ever made. IOGraphica and friends draw where your pointer *went*. Fog of Desk draws where it has **never** gone: your display starts fully fogged, and working on your machine burns holes in the fog. For anyone who bought a 6K panel or an ultrawide and suspects they live in a 900-pixel strip in the middle of it.

## Problem

Screen real estate is the most expensive per-square-inch surface most people own, and nobody has any idea how much of it they actually use. Window managers optimize layout for a machine that assumes you look everywhere. You don't. You have a dead 30% along one edge, a corner you have visited twice since 2024, and a menubar item you cannot reach without a conscious decision. Nobody has ever shown you that map — and the negative space is far funnier and more informative than the positive space.

## How it works

1. Menubar app polls pointer position at 30 Hz and accumulates a per-display visit grid.
2. Unvisited cells render as opaque fog in a transparent click-through overlay window; visited cells are clear, with a soft falloff so the map looks hand-drawn rather than blocky.
3. Fog **regrows**: each cell's visit weight decays exponentially (default half-life 14 days), so a region you abandon slowly re-darkens. This is the roguelike graft — the map is never permanently cleared, and you can watch a workflow change reclaim territory.
4. Overlay is normally hidden; you toggle it with a hotkey, or let it run as the screensaver, where it replays your whole history as a time-lapse reveal over 60 seconds.
5. Menubar shows one number: **territory held** — the fraction of total pixel area currently unfogged, per display, with a weekly delta.

## Technical approach

Swift + AppKit + Metal, no dependencies, no privileged entitlements. The trick that makes this a weekend project: `NSEvent.mouseLocation` is readable without Accessibility or Input Monitoring permission, so a 30 Hz `CVDisplayLink`-driven poll gets the full path with zero permission prompts (a global `.mouseMoved` monitor would require Input Monitoring — deliberately avoided).

Data model: one grid per display UUID (`NSScreen.deviceDescription[.screenNumber]` → display UUID via `CGDisplayCreateUUIDFromDisplayID`), 16 px cells, `Float16` weights, persisted as a flat binary blob in `~/Library/Application Support/FogOfDesk/<uuid>.grid`. A 6K display at 16 px cells is ~350×200 = 70k cells, trivially small. Decay is applied lazily at load: store a last-touched timestamp per cell chunk and multiply by `exp(-λΔt)`.

Rendering: upload the grid as an `R16Float` texture; a fragment shader computes fog alpha from a signed distance field so edges feather. The distance field is built with **jump flooding** (log-n passes) on the GPU each frame — this is the part that makes it look like a map instead of Minecraft. Overlay is an `NSWindow` at `.screenSaver` level with `ignoresMouseEvents = true`, `collectionBehavior = [.canJoinAllSpaces, .stationary]`.

Hard part: display topology. Unplugging a monitor, changing resolution, or moving a display in Arrangement must remap grids without losing history — keyed by display UUID with an affine remap on resolution change, and a per-display origin so the global coordinate space stitches correctly.

## v1 scope

- One display only, single grid, no decay
- Hotkey-toggled fog overlay, hard-edged alpha (no SDF)
- Menubar percentage readout
- Grid persisted on quit

## Out of scope

- Screensaver bundle (`.saver`) — ship it as an app window first
- Window-aware terrain (revealing by app rather than pointer)
- Keyboard-driven focus regions, eye tracking
- Windows/Linux ports

## Risks & unknowns

30 Hz polling misses fast flicks between corners — mitigate by line-interpolating between consecutive samples so a flick paints a stroke, not two dots. Trackpad users with warp-heavy setups (BetterTouchTool, hyperkey window snapping) may show artificially sparse maps. And the honest risk: the number may be boring for laptop users, where the answer is "most of it." The toy is best on big or multi-display setups.

## Done means

After one workday, toggling the overlay shows a legible cleared region matching where you actually worked, the menubar reads a plausible percentage under 100, quitting and relaunching restores the same map, and the app has never triggered a macOS permission dialog.
