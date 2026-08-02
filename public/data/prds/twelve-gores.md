## Overview

Twelve Gores is a browser puzzle game about flattening spheres. Each level hands you a body (Earth, Moon, Mars, Titan), a paper size, a scissors budget, and a demanding client. You decide how many gores to cut, where the cut meridians fall, and which projection each gore uses. The scoring is real cartographic distortion math, and every solved level exports a PDF you can print, cut out, and glue into an actual globe. Single-player, mouse-only, ~5 minutes a level.

## Problem

Map projection is one of the most beautiful trade-off spaces in applied math and it is taught either as a lecture or as a passive "drag the slider" toy. Nobody has made the trade-off *cost you something*. And papercraft globe gores — an object with a genuinely charming 500-year history — are only ever downloaded pre-made, never designed.

## How it works

A 3D globe sits on the left, the flat sheet on the right. You drag cut meridians onto the globe; the sheet re-flows live. Each gore gets a projection card drawn from your unlocked deck (sinusoidal, polyconic, transverse Mercator strip, Cahill butterfly, Goode homolosine, Fuller). A Tissot indicatrix heatmap overlays the sheet: red where area lies, blue where angles lie.

Score = paper utilization − distortion penalty − gap penalty, weighted by the client's brief: *"Greenland's area error under 12%"*, *"the North Atlantic shipping band must stay conformal"*, *"one continuous piece, no interruptions"*, *"it must fit on A4 and I only own six pieces of tape."* A deadpan in-game critic translates the math into complaints a layperson would make ("Australia looks stretched east-west"), which is how the player learns to read the heatmap. Par scores per level; a run mode draws random clients and random projection cards.

## Technical approach

TypeScript, three.js for the globe, d3-geo plus d3-geo-projection for the projections and graticule, SVG for the sheet. Distortion is computed from a numerical Jacobian of each forward projection: finite-difference the projection at each node of a 2° lat/lon grid, take the SVD of J scaled by 1/cos(φ) for the meridian convergence; singular values σ₁ ≥ σ₂ give the Tissot ellipse axes. Areal error = σ₁σ₂ − 1; maximum angular deformation = 2·asin((σ₁−σ₂)/(σ₁+σ₂)). Heatmap is a canvas layer sampled from that grid.

Sheet layout is strip packing of the gore bounding polygons with rotation allowed (a simple bottom-left-fill heuristic is enough at 12 gores). The fold-feasibility check compares the projected arc length of each shared cut boundary as rendered in the two adjacent gores; a mismatch beyond glue tolerance becomes a visible sliver on the sheet and a gap penalty — this is the part that makes it a *game* rather than a viewer, and it is the hard part, because for non-lune cuts the two sides genuinely disagree and you must decide whose length wins.

Export is SVG → PDF at true scale with fold and glue-tab guides.

## v1 scope

- Earth only, land polygons from Natural Earth 110m
- One control: number of gores (4–24), evenly spaced meridians
- Three projections, applied globally rather than per-gore
- Live Tissot heatmap + a single scored client constraint
- Printable PDF export at A4

## Out of scope

Non-spherical bodies and true mesh unfolding (LSCM), per-gore projections, the roguelike run mode, accounts, leaderboards, mobile.

## Risks & unknowns

The fun may be entirely front-loaded — once the player understands the trade-off, the remaining levels are arithmetic; the client-constraint variety is the whole retention story and it is unproven. Numerical Jacobians near the poles are unstable and need clamping. Whether anyone actually prints and glues one is the real test of the hook.

## Done means

A player can go from an untouched globe to a printed A4 PDF, cut it out, glue it, and hold a recognizable Earth — and the game's reported area error for Greenland matches an independent proj/pyproj computation to within 1%.
