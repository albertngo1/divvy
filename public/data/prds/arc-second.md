## Overview

Arc Second is a desktop toy and export tool for **scratch holograms** (the Beeler/Abelson "abrasion hologram" trick): a 3D scene rendered as a field of thin circular arcs, where a moving specular highlight along each arc reconstructs depth for a human eye. On screen it is an ambient toy — a phantom object floating behind your wallpaper, lit by your cursor or by the actual sun. Off screen it is a fabrication file: SVG or G-code for a pen plotter holding a diamond scribe over a sheet of acrylic. For plotter owners, generative-art people, and anyone who wants a physical object that only exists under a point light.

## Problem

Scratch holography is genuinely magical and almost nobody makes them, because the tooling is a 1998 BASIC listing and a paperclip. There is no way to preview one before you scratch it — you commit to a plate, then discover the arcs are too dense and the plate is milky. And nothing renders the effect live on a screen, where a moving light source is free.

## How it works

Load an OBJ/STL, or pick a preset (a knot, a fish, your cursor trail frozen). Every sampled surface point `(x, y, z)` becomes one arc: center at `(x, y)`, radius `r = k·z`, swept over the angular range where a light overhead can glint into the viewer. Drag the light around and each arc's bright point slides; points at different depths slide at different rates, and your visual system fuses it into 3D. Sliders control arc count, sweep width, depth scale, and the virtual light's height. "Sun mode" drives the light from real solar azimuth/elevation for your latitude and longitude, so the phantom object rotates over the day and lies flat at noon. Hit Export for SVG (AxiDraw) or G-code, with a scribe-pressure and travel-order pass.

## Technical approach

Browser first: Three.js only for mesh loading and point sampling (Poisson-disk over the surface, plus backface and occlusion culling from the nominal viewing cone), then a custom WebGL2 renderer that rasterizes arcs as instanced quads with a signed-distance arc SDF in the fragment shader. Glint simulation: per arc, the visible highlight parameter is the tangency angle where the arc's local normal bisects light and eye; shade a narrow Gaussian around it so the specular streak looks like real diamond-scribed plastic. Solar position via NOAA SPA (~20 lines, no API). Export path orders arcs with a nearest-neighbor + 2-opt pass to cut plotter travel, and merges arcs sharing a center. The hard part is **contrast budgeting**: total scratched area is fixed by how milky you'll tolerate the plate, so arcs must be allocated to the points that carry the most depth information — a greedy maximization of depth-variance-per-scratched-millimeter, not uniform sampling.

## v1 scope

- Browser page, one built-in mesh, cursor-driven light
- Arc count / depth scale / sweep sliders
- SVG export sized to a 6×6 inch acrylic sheet
- A one-paragraph "how to scratch it by hand with a compass" note

## Out of scope

Animation, color, multi-layer plates, actual plotter driving, mesh upload UI, macOS wallpaper packaging.

## Risks & unknowns

The screen simulation may read as convincing while the physical plate does not (real scribes cut V-grooves with their own scatter lobe). Depth scale that looks right at 60 cm viewing distance may collapse on a plate held at 30 cm. Cheap acrylic crazes under a diamond point.

## Done means

A stranger loads the page, drags the mouse, and sees a solid object floating behind the screen; exports the SVG; plots it; and under a phone flashlight the same object appears in the plastic.
