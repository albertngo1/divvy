## Overview
Longhand is a tiny CLI + web tool that converts arbitrary text into **backtrack-free, single-stroke cursive SVG paths** — one continuous pen path per word, no doubled-over lines, no lifts mid-word. It's for the pen-plotter / CNC-engraver / laser hobbyist crowd (r/PlotterArt, AxiDraw owners, wedding-invite side-hustlers) who currently fake handwriting with filled TrueType outlines that plot as ugly double-traced blobs.

## Problem
Regular fonts are *outlines* — closed contours. A plotter traces the outline, so every stroke gets drawn twice and the pen wastes travel and ink. Hershey/single-stroke fonts exist but are blocky and print-style; nobody has a *cursive* single-stroke font where letters actually connect into one flowing pen path per word. Plotter people hand-hack this constantly.

## How it works
1. Each lowercase letter is defined as a parametric skeleton stroke with a defined **entry point, exit point, and baseline tangent** (the mmapped 'backtrack-free cursive' insight: pick glyph shapes with no retraced segments).
2. At render time the engine chains glyphs: exit tangent of one letter is fused to the entry tangent of the next with a Catmull-Rom/Bézier joiner, so a word becomes one `<path>`.
3. Letters that normally require a lift (dotting an i, crossing a t) are deferred to a **second pass path** emitted as a separate layer, so the plotter does all the connected cursive first, then the diacritics.
4. Output: layered SVG (pen-up moves stripped), plus optional G-code and AxiDraw-ready HPGL.

## Technical approach
- Stack: TypeScript, no framework; render server-side with a 400-line path builder, preview in-browser with plain SVG.
- Glyph data model: JSON per glyph — `{entry:[x,y], exit:[x,y], strokes:[cubic segments], liftMarks:[...]}` at unit em height. ~30 lowercase + 10 digits + basic punctuation to start.
- Joining algorithm: monotonic baseline advance; the hard part is **loop letters (e, l, b)** whose exit tangent must match the next entry without a cusp — solve with tangent-continuity (G1) Bézier stitching and a small per-pair kerning table.
- Genuinely hard part: keeping the joined path *self-non-intersecting enough* to read as handwriting while staying single-stroke; needs a legibility pass that nudges control points when a join would collide with the previous glyph's tail.
- Export: SVG → `vpype` pipeline for optimization; G-code via a trivial linear-move emitter.

## v1 scope
- Lowercase a–z + space, one cursive style, one weight.
- Single continuous path per word; diacritics on a second layer.
- SVG download + live browser preview with a 'plot time / pen-up count' stat.

## Out of scope
- Uppercase, multiple styles, variable weight.
- True handwriting randomization / jitter.
- Direct device streaming (user drops the SVG into their own plotter software).

## Risks & unknowns
- Some letter pairs may be impossible to join cleanly without a lift — accept a small curated 'break' set.
- Legibility is subjective; needs real plotter-owner feedback.

## Done means
Typing 'the quick brown fox' produces a downloadable SVG where each word is exactly one `<path>` element (verified by DOM count), diacritics live on a second layer, and an AxiDraw draws it with zero mid-word pen lifts.
