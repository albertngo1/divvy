## Overview
Downstream is a macOS desktop toy. It renders a real-time 2D incompressible fluid simulation at desktop level, behind your windows. Every open window becomes a no-slip solid boundary. It takes a serious CFD solver and makes it something you fidget with, and it shows your window layout as aerodynamics.

## Problem
Vi Hart's Navier–Stokes post makes the equations feel alive, but most people only meet fluids in a canvas demo they close after 30 seconds. Meanwhile your desktop wallpaper is 5 million pixels doing nothing, and how you arrange windows is invisible habit. Downstream puts the fluid somewhere you look all day, so it builds up a history of how you work.

## How it works
- A slow ambient current flows left to right. You can set its direction and speed.
- Each window is a rectangle obstacle. Fast-moving windows inject momentum, so a window dragged quickly leaves a wake. A window parked in the current eventually sheds vortices at the real Strouhal frequency for its width.
- Dye is injected from the window the user is focused on, colored by app. After an hour, the wallpaper is a smeared map of where your attention went.
- The cursor is a tiny stirring stick, with an optional modifier key so it doesn't stir all the time.
- A menubar slider sets viscosity ("honey ↔ air"), which changes the Reynolds number and switches the flow between laminar and turbulent.

## Technical approach
- Swift app with a borderless `NSWindow` at `kCGDesktopWindowLevel`. It ignores mouse events and draws via `MTKView`.
- Obstacles: poll `CGWindowListCopyWindowInfo(.optionOnScreenOnly)` at 30 Hz, filter to layer 0, and convert bounds into a solid mask texture. Window velocity comes from frame-to-frame bounds deltas.
- Solver: Jos Stam's Stable Fluids on a 512×320 grid, in Metal compute kernels. Steps per frame:
  1. Semi-Lagrangian advection (MacCormack for sharper dye)
  2. Jacobi pressure solve, 30 iterations
  3. Vorticity confinement, so vortices don't diffuse away at low resolution
  4. Boundary enforcement from the mask
  Dye is advected at full screen resolution.
- **The hard part:** moving obstacles in a grid solver leak fluid and pop when a window jumps a long way (Cmd-Tab, Spaces switch, maximize). Fix:
  - Treat cells newly covered by a window as sources whose velocity equals the window's velocity.
  - Cap the obstacle velocity used for each step.
  - On Space changes, cross-fade to a fresh solid mask rather than teleporting obstacles.
- Budget: under 3% GPU on an M1 at 30 fps. Pause when on battery or when a full-screen app is active.
- Needs Screen Recording permission only for window *titles*. Bounds come without it, so v1 skips titles.

## v1 scope (humiliatingly small)
- One display
- Fixed left-to-right current, window obstacles, one dye color
- Stirring by dragging windows only (no cursor stirring)
- Menubar: pause and viscosity slider

## Out of scope (for now)
- Multi-monitor or Spaces-aware flow continuity
- Per-app dye and the attention-map export
- Sound (sonifying vortex shedding)
- Linux/Windows

## Risks & unknowns
- macOS may restrict drawing at desktop level, and it fights with Stage Manager.
- At this grid resolution, vortex shedding only shows up within a narrow Reynolds range. The slider has to be tuned so the defaults look good.
- Battery drain could get the app uninstalled within a day.

## Done means
With three windows open, dragging one across the screen visibly leaves a swirling wake that persists for 5 or more seconds. A narrow window parked in the default current sheds alternating vortices within 60 seconds. The app holds 30 fps at under 5% GPU in Activity Monitor on an M1 Mac mini.
