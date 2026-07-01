## Overview
A live desktop wallpaper (Wallpaper Engine web wallpaper, or a standalone Electron app) that treats your mouse cursor as flowing water carving a generative terrain. Fast movement erodes channels; lingering deposits sediment. Leave it running and, month over month, your desktop quietly becomes a personal watershed map — an ambient artifact that generates itself over a year. For people who keep their machine on and want a beautiful, guilt-free record of how they actually move through it.

## Problem
Screen time is invisible and moralized into guilt. There's no beautiful, low-effort artifact of your own daily computer use — just usage bars in a settings pane. The itch: make time-at-the-machine into something you'd hang on a wall.

## How it works
A global input hook samples cursor position at ~30Hz. A heightfield grid (screen downsampled to, say, 480×270 cells) accumulates: cursor velocity injects "water" that runs droplet-based hydraulic erosion, lowering cells along fast paths (carving channels toward the dock, the tab bar) and depositing sediment where the cursor lingers. The field is rendered as shaded relief with hypsometric tint and contour lines. It autosaves to disk daily, keeping 365 snapshots so a later version can replay the year forming.

## Technical approach
Electron + WebGL/three.js (or a Wallpaper Engine HTML wallpaper). Global cursor capture via `node-global-key-listener`/`iohook`, or Wallpaper Engine's cursor API. Heightfield is a `Float32Array`; erosion uses an incremental droplet algorithm (Hans Beyer-style) applied each frame with cursor velocity as deposited water volume — never a full nightly re-sim. Render: compute normals for Lambert shading + marching-squares contour lines on a 2D canvas fallback. Persist as 16-bit PNG or raw daily. The genuinely hard part is keeping incremental erosion *stable and pretty* over a year — deposition must balance erosion or the whole field homogenizes into mush.

## v1 scope
- Single monitor, cursor-only (ignore keyboard)
- One erosion model, tuned by hand
- Topo-line + shaded-relief render
- Daily autosave of the heightfield
- Restore accumulated terrain on relaunch

## Out of scope
- Multi-monitor stitching
- Coloring terrain by active app/window
- Year timelapse scrubber UI
- Cloud sync

## Risks & unknowns
- Erosion may flatten to mush without careful deposition balance
- Global mouse hooks can trip antivirus/permission prompts
- Wallpaper Engine's sandbox may block disk writes (fallback: Electron)

## Done means
After a week of real use, the wallpaper shows recognizable carved trails (dock, browser, most-clicked corners) as channels, and relaunching the app restores the accumulated terrain from disk rather than starting blank.
