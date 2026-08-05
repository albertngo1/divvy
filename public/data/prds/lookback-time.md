## Overview
A macOS/Linux screensaver + tiny menubar companion that turns idle time into travel through a real astronomical catalog. While you're away, the view drifts outward through the Rubin Observatory's COSMOS-field release — half a million actual galaxies with actual coordinates, magnitudes, and photometric redshifts. When you wake the machine, motion halts on whatever galaxy is nearest the camera and that object is stamped into a permanent, growing atlas: catalog ID, redshift, lookback time, the date and time you were away, and how long you were gone. For people who like ambient beauty but resent screensavers that produce nothing.

## Problem
Screensavers are pure decoration and idle time is pure loss. Meanwhile the most spectacular open dataset of the year — Rubin's first LSST Camera release over the COSMOS field — sits in Parquet files that essentially nobody outside astronomy will ever look at. There is no ambient, zero-effort way to feel the scale of it. Existing space screensavers are fictional starfields with no data underneath, so nothing you see is anything.

## How it works
1. Screensaver starts. Camera begins moving outward along +z from the observer's origin at a fixed rate: 1 million light-years of lookback per real second.
2. Galaxies stream by as depth-sorted billboarded sprites, colored by real g-r-i photometry, sized by measured half-light radius, positioned by RA/Dec/photo-z projected into a comoving cube.
3. A thin HUD reads current lookback time and redshift — nothing else. No fake nebulae, no lens flares.
4. On wake: motion decelerates over 800ms, the nearest galaxy zooms slightly, its catalog ID appears, and it's written to the atlas.
5. Menubar item shows total distance traveled, galaxies collected, and the last object. Clicking opens the atlas: a scrollable grid where each entry links to its real cutout image and its Rubin catalog page.

## Technical approach
- Data: Rubin DP1 / first LSST Camera COSMOS release object catalog (RA, Dec, photo-z, cModel fluxes in ugrizy, shape params). Downsample to ~500k rows, precompute comoving distance from redshift with a flat ΛCDM integral (H0=67.7, Ωm=0.31), and bake into a packed Float32 binary — position xyz, RGB from a g-r/r-i color→temperature map, radius. Ships as a ~12MB asset; no network at runtime.
- Render: Swift + Metal `ScreenSaverView` on macOS (a WebGL/Three.js build as the cross-platform fallback). One instanced draw call for all sprites, GPU frustum + distance culling, additive blending, log-depth to avoid z-fighting across 12 orders of magnitude.
- Atlas store: SQLite in Application Support — one row per encounter (objectId, ra, dec, z, awayStart, awaySeconds).
- Hard part: the density gradient. A raw catalog projection looks like a flat wall of noise, not a journey. Needs a spatial hash of the point cloud plus an emphasis pass that boosts the brightest/largest object in each depth shell so there's always something to arrive at, without inventing data that isn't there.

## v1 scope
- One catalog file, one direction of travel, no user controls.
- Metal screensaver + a plain-text atlas log.
- Menubar item: count and last object only.
- Fixed 1 Mly/sec rate.

## Out of scope
- Steering, VR, multiple sky fields, cutout image fetching, sharing, sound.

## Risks & unknowns
- Rubin data-release license and redistribution terms for a bundled asset.
- Photo-z errors are large; the "distance" is honest-ish but must be labeled as photometric.
- macOS screensaver API is a graveyard of deprecations; may need a fullscreen idle-triggered app instead.

## Done means
Lock the screen for 20 minutes, come back, and the menubar reads "1.2 Gly traveled · 14 galaxies" with a real Rubin objectId that resolves to a real object when pasted into the Rubin portal.
