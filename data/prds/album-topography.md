## Overview

Album Topography turns any album cover into a solid 3D object made of its own pixels. Every pixel becomes a colored voxel in a cube: the clean artwork faces you up front, extruded backward into a uniform solid body so the picture stays readable as you orbit. Pixel brightness embosses the front face into low relief — every cover becomes a secret landscape. Then you fly in, the size-attenuated points separate, and the image dissolves into the bare colored atoms it was built from. The thesis: a cover is both a picture and a 3D terrain, and if you zoom far enough you hit the pixels underneath.

## Problem

Image-pixels-as-3D-RGB-point-cloud has been done, WebGL deep-zoom has been done, and "zoom until atoms" has been done — but never fused onto album art, and never with brightness-relief that keeps the front a clean readable image. The obvious versions (pixel scatter plots, rainbow RGB cubes) destroy the picture; the move here is a *uniform solid body* that preserves it, which nobody had assembled for this subject.

## How it works

Enter an artist/album (or it uses a bundled set). The cover loads and rebuilds as a point-cloud cube: front face = the artwork, brightness pushing pixels toward the viewer into gentle relief, body extruded straight back so rotation never distorts the image. Orbit to see it's a solid slab, not a height-field. Deep-zoom (dolly in) and size-attenuation lets the points drift apart until the image dissolves into floating colored atoms. The background adapts to the album's palette so dark covers don't vanish into black. Save-PNG exports the current view.

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: Vite + TypeScript + three.js. Static site, no backend. Point-cloud rendered as a single `THREE.Points` with a custom shader for size attenuation and per-point color.

Data sources by name:
- **iTunes artwork API** — fast, high-res cover lookup by artist/album search.
- **MusicBrainz Cover Art Archive** — fallback / higher-fidelity source keyed by release MBID.
- **three.js** point-cloud (`THREE.Points` + `BufferGeometry`) for the voxel cube and deep-zoom.

Data model: per-cover BufferGeometry of N points `{position(x,y,z), color(rgb)}` where x,y = pixel grid, z = extruded depth with a brightness offset on the front face; plus a derived background color from the palette.

Key algorithms: (1) pixel → point: read cover into a canvas, one point per pixel (or downsampled), color from RGB; (2) brightness relief: front-face z = base + luma·relief_scale, kept low by default so the picture doesn't distort; (3) uniform solid body: extrude the same footprint backward so silhouette from any angle stays rectangular and the front stays clean; (4) size attenuation for the dissolve-to-atoms zoom; (5) invert-z toggle so covers whose subject is darker than the background peak *toward* the viewer instead of caving in.

The hard part (solved during the build): depth must come from a uniform solid body, not a jagged height-field, or the art distorts and reads inverted from behind; peak relief must stay low so it doesn't warp; faces must peak toward the viewer (invert-z toggle for dark-subject covers); and the background must adapt per album or dark covers disappear.

## v1 scope (humiliatingly small)

- Bundled set of covers (git-ignored for copyright; `build-covers.sh` refetches).
- Point-cloud cube with brightness relief + uniform extruded body.
- Orbit + deep-zoom-to-atoms.
- Adaptive per-album background + Save-PNG.

## Out of scope (for now)

- Arbitrary live search UI beyond the bundled set.
- Audio reactivity / playback.
- Batch galleries, video export.

## Risks & unknowns

Prior-art verdict: **Partial (fusion of solved parts)** — pixels-as-3D-point-cloud, WebGL deep-zoom, and zoom-to-atoms all exist; the novelty is the combination plus the album-art subject and the brightness-relief thesis. Wins on Wow, thin on Novel. Cover copyright means art is git-ignored and refetched, not committed. **STATUS: BUILT** — Vite + TypeScript + three.js; repo `albertngo1/album-topography` (private, standalone — not a monorepo subtree). First idea from the brainstorm to ship.

## Done means

Already met: a cover rebuilds as a readable point-cloud cube with low brightness relief and a uniform solid body, orbits without distorting the art, deep-zooms until the image dissolves into colored atoms, adapts its background per album, exposes an invert-z toggle for dark-subject covers, and exports a PNG. Shipped in the standalone `albertngo1/album-topography` repo.
