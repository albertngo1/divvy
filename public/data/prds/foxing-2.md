## Overview
Foxing is an ambient screensaver/desktop-toy that inverts the entire point of 3D Gaussian splatting. Where the field races toward ever-more-faithful reconstruction (and papers work hard to *conceal* packet-loss errors), Foxing revels in decay: it takes a real splat scene you captured and lets it rot beautifully over time — surfaces sepia and 'fox' like old paper, splats drift and drop out, geometry softens into a place that half-remembers itself. For anyone who has splatted their apartment or a cathedral and wants it to become a ghost.

## Problem
Splat captures are treated as archival truth — pristine, frozen, faithful. That's the least interesting thing you can do with a cloud of a million soft blobs. Recent arXiv work (packet-loss-robust Gaussian compression, error concealment) exists specifically to *hide* corruption; the mischievous artful opposite is to make corruption the medium. And the Grace Cathedral / Shinjuku splat demos are gorgeous but static — nothing happens over time.

## How it works
You point Foxing at a `.ply`/`.splat` scene and a 'capture date.' It renders the scene fullscreen and applies a continuous decay driven by elapsed time on a tunable half-life. Decay stacks several effects: covariance inflation (blobs bloat and blur), stochastic splat dropout (the packet-loss look, now a feature), color drift toward sepia + foxing spots seeded by 3D Perlin noise, and slow positional jitter along a curl-noise field so walls breathe. A very old scene becomes a shimmering abstraction; reopening/re-scanning 're-excites' it to full sharpness. It loops as a slow ambient camera orbit — a memento mori you leave on a spare monitor.

## Technical approach
Three.js + a WebGL Gaussian splat renderer (Mark Kellogg's GaussianSplats3D or a gsplat port). Decay params are pushed as per-splat modifiers in the vertex/compute path: scale multiplier, alpha dropout mask, and a color LUT, all keyed by `1 - 2^(-elapsed/halflife)`. Foxing spots and jitter sample precomputed 3D noise textures. Packaged as a browser kiosk page or a tiny Electron 'screensaver' shell. The genuinely hard part is doing per-splat decay on 1M+ gaussians every frame without tanking the GPU — solved by precomputing a handful of decay LODs (dropout masks + blur levels) and interpolating between them, rather than recomputing per splat per frame.

## v1 scope
- Load one bundled splat scene + a decay-time slider (not real clock yet)
- Three effects: blur (covariance), random dropout, sepia/foxing LUT
- Slow auto-orbit camera; export current frame as PNG

## Out of scope
- Live scanning/capture, real half-life scheduling, multi-scene library, VR

## Risks & unknowns
- Splat renderer perf ceiling on integrated GPUs
- Decay may look like a bug, not art — needs aesthetic tuning
- Getting users' own splats in (format/loader friction)

## Done means
You load a splat, drag the decay slider, and watch a faithful room dissolve into a sepia ghost of itself that still reads as *that place* — then export a frame you'd hang on a wall.
