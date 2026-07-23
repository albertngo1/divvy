## Overview
Quarrel is a desktop live wallpaper (and standalone screensaver) that procedurally grows a unique piece of leaded stained glass on every run, then illuminates it with physically-plausible global illumination so light spills, tints, and softly bleeds between panes. It's for people who liked GNOME Hanabi / Wallpaper Engine but want something quiet, generative, and never twice the same — a slow-burning art object, not a video loop.

## Problem
Most live wallpapers are either canned MP4 loops or noisy particle demos. There's very little that is (a) genuinely generative — different every launch — and (b) lit with real light transport, which is exactly what makes stained glass feel alive. The recent Split Radiance Cascades work makes real-time 2D GI cheap enough to run idle on a laptop GPU; nobody has pointed it at *art* instead of games.

## How it works
On launch a seed (from `/dev/urandom`) drives three stages: (1) a tracery generator lays out the lead cames — a planar subdivision via a stochastic L-system or Voronoi-relaxed lattice, producing quarries (diamond panes), borders, and a central medallion; (2) each cell is assigned a colored glass with an absorption coefficient and a little noise-driven texture (streaky, seedy, opalescent); (3) a slow virtual sun arcs behind the window over ~20 minutes. Radiance cascades compute how much colored light reaches each interior pixel through the semi-transparent panes, so a red pane throws a faint red glow onto the neighboring lead and floor. The whole thing breathes: light angle shifts, dust motes drift, the medallion catches a highlight.

## Technical approach
Rust + wgpu (WebGPU) for the render, packaged per-platform: macOS via a `.saver` bundle + a wallpaper-window helper, Linux via a layer-shell surface, Windows via the wallpaper worker window. Core: a 2D radiance-cascade solver in a compute shader (cascade hierarchy of directional probes, merged coarse-to-fine) treating glass cells as tinted participating media (Beer-Lambert absorption per pane). Tracery layout is CPU-side (Rust `geo` for planar polygon ops), rasterized once to an SDF texture the shader samples for came edges. The hard part is keeping GI cheap enough to idle at <5% GPU: fixed low-res cascade with temporal reuse, and only re-solving when the sun moves. A tiny palette engine samples historically-plausible glass colors (Chartres blues, ambers) so output looks curated, not random.

## v1 scope
- Single monitor, one generator style (geometric Gothic lattice)
- Radiance-cascade GI with a moving sun, temporal accumulation
- macOS `.saver` + a `screenshot` mode that renders a 4K PNG keepsake
- Seed shown in a corner so you can re-summon a window you loved

## Out of scope
- Figurative/pictorial windows (saints, scenes)
- Multi-monitor spanning, audio, interactivity
- Windows/Linux packaging (stub the render, ship later)

## Risks & unknowns
- 2D radiance cascades through tinted media may look muddy — needs art tuning of absorption/gamma
- Idle GPU/thermals on integrated graphics; may need a low-power cadence
- Making random tracery read as *designed* rather than *messy* is the real design risk

## Done means
Running the screensaver twice produces two visibly different, coherent stained-glass windows; light demonstrably tints adjacent geometry (toggle GI off and the glow disappears); it holds a stable framerate under 5% GPU idle on an M-series laptop; and `--screenshot <seed>` reproduces a given window pixel-for-pixel.
