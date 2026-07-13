## Overview
Single Stroke is a small tool (CLI + web preview) that renders a word or line of text as a *single continuous pen path* — the nib never leaves the paper from the first letter to the last. It's aimed at pen-plotter hobbyists (AxiDraw, iDraw, NextDraw) and generative-art tinkerers who want signatures, labels, and poster text drawn in one elegant, uninterrupted gesture.

## Problem
Standard single-stroke (Hershey) fonts still lift the pen between every glyph, so a plotter clatters up-down dozens of times and the letters float as disconnected marks. The "backtrack-free cursive" idea — writing where you never retrace or lift — is beautiful but there's no tool that produces it programmatically for arbitrary text. Doing it by hand is tedious; doing it well is a genuine little algorithm problem.

## How it works
You type text; the tool outputs an SVG/G-code path that is one polyline. Letters are connected by cursive entry/exit strokes, and any letter that would normally require a lift or backtrack (dotting an i, crossing a t) is either re-routed or deferred and stitched in via a hidden travel stroke drawn at zero-ish pressure. A slider trades "legibility" against "how much cheating" (retrace tolerance).

## Technical approach
- **Stack:** TypeScript core (runs in Node and browser), `svg-path` math, optional G-code emitter. Web preview with a live canvas + animated pen.
- **Font model:** a hand-authored set of ~30 cursive glyph skeletons as parametric strokes, each with a defined *entry point* and *exit point* on a common baseline so consecutive glyphs join naturally.
- **The hard part:** turning a word into one stroke is a routing problem. Model each glyph's required strokes as edges of a graph; finding a single continuous drawing = an **Eulerian-path** construction over the stroke graph, augmented (Chinese-Postman style) with minimal added connector edges where no Euler path exists (e.g. odd-degree vertices at t-crossings). We add the fewest duplicate/travel edges to make the graph traceable, then greedily order glyphs L→R with Hierholzer's algorithm.
- **Output:** SVG `<path>` (one `M` then all `L/C`), plus `--gcode` for plotters and `--anim` to export the drawing order as a dashoffset animation.

## v1 scope
- Lowercase a–z + space, single line, one baseline.
- Eulerian-ish single-path solver with a `--tolerance` knob for allowed retrace.
- SVG output + animated web preview showing the pen never lifting.

## Out of scope
- Uppercase, punctuation, multi-line layout, kerning refinement.
- True variable-pressure / brush simulation.
- Font import (TTF glyph tracing).

## Risks & unknowns
- Some letter pairs may be impossible to connect legibly without ugly loops; may need per-pair connector rules.
- "One stroke" for a whole sentence can look like scribble at low tolerance — legibility ceiling unknown.
- G-code correctness across plotter firmwares.

## Done means
Given `singlestroke "hello world"`, the tool emits an SVG whose entire drawing is a single `<path>` with exactly one move command, it renders as recognizable connected cursive, and plotting it on an AxiDraw produces the text with the pen lifting at most once (start/end).
