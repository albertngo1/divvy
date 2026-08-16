## Overview
A browser generator for printable moiré verniers: pairs of line patterns that, when overlaid, amplify tiny misalignments into huge visible fringes. For woodworkers squaring a table saw, makers leveling a printer bed, astronomers aligning a finder, anyone who needs precision they can't afford instruments for.

## Problem
Shop alignment is a tax paid in gear. Getting a table saw blade parallel to the miter slot within 0.002" is the difference between clean crosscuts and burn marks, and the standard answer is an $80 dial indicator on a magnetic jig. Meanwhile ship navigators have solved this since forever with moiré leading marks: two grids at slightly different pitch turn a sub-millimeter offset into fringe motion 50x larger. The math is free. Nobody has packaged it as a thing you print and use in a garage tonight.

## How it works
Pick a job (saw blade, printer bed, drill press square, dish pointing) and a target sensitivity. The app emits a two-page PDF: pattern A for card stock, pattern B for an inkjet transparency. Overlay them on the surfaces being aligned. Three gauge families:
1. **Linear vernier** — pitches p and p(1+ε); fringe spacing p/ε, so ε=0.02 gives 50x amplification of translation.
2. **Rotational moiré** — two radial line bursts; misalignment in angle produces a rotating fringe cross whose arm count reads the angle directly.
3. **Null target** — matched pitches, opposite phase; perfect alignment goes uniform gray, any error breaks into stripes. Highest sensitivity, easiest to read, no counting.
Each PDF includes a printed reading scale and a one-line "you are 0.004" high on the left" interpretation guide.

## Technical approach
Pure client-side: Svelte + generated SVG at absolute physical units (`mm` in the SVG viewBox), rendered to PDF with `pdf-lib` so nothing gets rescaled by a print dialog. Patterns are analytic — for the radial case, lines at θ_k = 2πk/N with a small differential N between sheets; the fringe field is the interference of two binary square-wave gratings, previewable live in a WebGL fragment shader so users see what a 0.003" error will look like before printing.
The genuinely hard part is that the errors you're measuring are the same size as the errors in your medium. Consumer inkjets have 0.3-1% scale error, different per axis, and paper grows 0.1-0.2% cross-grain with humidity — that swamps a 0.002" measurement. Two mitigations: (a) ship a calibration strip (print, measure with any ruler or calipers, enter the measured length; the app solves per-axis scale factors and re-emits), and (b) design every gauge to be **differential** — both patterns printed on the same sheet in the same pass where possible, and null-seeking rather than absolute-count, so common-mode scale error cancels exactly.

## v1 scope
- One job: table saw blade parallel to miter slot
- Linear vernier + null target only
- Calibration strip and per-axis scale correction
- Live WebGL preview of the fringe pattern
- One printable instruction card

## Out of scope
Phone-camera fringe reading, curved surfaces, laser or projected moiré, an app store app.

## Risks & unknowns
Toner/ink line-width bleed may destroy contrast at fine pitch — needs a real print test to find the minimum usable pitch per printer class. Transparency film availability. Whether users read fringes correctly without hand-holding.

## Done means
A printed gauge and a $80 dial indicator, used on the same saw, agree within 0.002" across five independent setups — and a stranger following only the instruction card gets the same number.
