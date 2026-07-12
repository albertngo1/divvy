## Overview
Ulp is a self-hosted daemon + wallpaper generator that turns your computer's *numerical fingerprint* into an evolving piece of ambient art. It's for the kind of person who read the scrapfly post about `Math.tanh` being fingerprintable-to-OS and thought "that's horrifying — and kind of beautiful." The name is 'unit in the last place', the granularity of floating-point error.

## Problem
Browsers and CPUs compute transcendental functions (`tanh`, `exp`, `sin`, `pow`) with libm/microcode-specific rounding, so the same input yields subtly different last bits on different OSes, chips, and versions. Anti-bot vendors weaponize this to deanonymize you. It's an invisible, involuntary tattoo — nobody gets to *see* their own. Ulp makes the tattoo visible and makes its drift over a year a keepsake instead of a threat.

## How it works
1. On first run, Ulp evaluates a fixed battery of ~4096 transcendental probes (curated inputs known to diverge across libms) and hashes the exact IEEE-754 bit patterns into a 256-bit seed.
2. The seed drives a deterministic generative composition (flow field / reaction-diffusion / Voronoi — configurable), rendered as your desktop wallpaper.
3. A nightly job re-probes. If *any* bit changed (OS point-release, browser update, CPU microcode patch, moving to a new machine), the seed shifts and the art visibly *rearranges* — but anchored to the prior frame so it reads as growth, not replacement.
4. Each divergence event is logged with a diff of *which probes changed*, so over a year you accrete a scrollable 'ring' timeline: "March 3 — glibc 2.41 landed, the whole west quadrant went red."

## Technical approach
- Core in Rust (or Zig — nod to the gamedev-in-Zig lobsters post) for stable, reproducible float eval; probe set stored as `(fn, input_bits)` pairs with the observed `output_bits` recorded per run.
- Seed = BLAKE3 over the concatenated output bit-patterns.
- Renderer: `wgpu` compute shader producing a PNG; deterministic PRNG (PCG) seeded from the hash.
- Timeline stored as an append-only SQLite log of `(date, changed_probe_ids, old_hash, new_hash)`.
- The genuinely hard part: making the visual transition on a bit-change feel *continuous* (interpolate compositions between two seeds so a one-bit flip nudges rather than shatters) while keeping each frame a pure function of the seed.

## v1 scope
- 512-probe battery, one renderer (flow field).
- macOS wallpaper setter + PNG export.
- Nightly cron + append-only change log.
- A `--rings` command that renders the year-to-date timeline as a filmstrip PNG.

## Out of scope
- Cross-machine 'family portrait' comparisons.
- Browser-extension version reading the *browser's* JS float behavior.
- Multiple render styles / theming UI.

## Risks & unknowns
- Probes may be *too* stable (nothing changes for months) — need inputs that actually diverge on common update paths; may require research to curate a lively battery.
- Conversely, ASLR/JIT noise could make it non-deterministic within a machine; must pin to pure libm calls, not JITed paths.
- Aesthetic payoff is subjective — the poster has to be genuinely nice or it's a novelty.

## Done means
Running Ulp on two different OSes produces visibly different wallpapers; forcing a libm change (e.g., Docker image swap) makes the next nightly render shift in a bounded, continuous way and appends one row to the timeline; `--rings` renders that event.
