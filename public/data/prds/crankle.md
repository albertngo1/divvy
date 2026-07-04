## Overview
Crankle is a Zachtronics-flavored daily browser puzzle for people who like optimization and counterintuitive physics. Each day you're given a plot boundary, a wind/lateral-load spec, and a brick budget; you draw a serpentine (crinkle-crankle) wall that encloses the required area while staying standing at single-brick thickness — beating the straight-wall baseline that would need double thickness.

## Problem
The Lobsters post "Do Wavy Walls Really Use Fewer Bricks? I Tested It in Blender" reveals a delightful fact most people never learn: a sinuous single-wythe wall is laterally stabilized by its own curvature, so it uses fewer bricks than a straight double-wythe wall of the same run. That's a perfect, self-contained puzzle mechanic hiding inside a garden-wall trivia post — nobody has made a game out of the stability/economy trade-off.

## How it works
You place control points to define a wall's centerline as a series of arcs. A live solver shows total brick count (proportional to arc length ÷ brick length) and a stability meter derived from local radius of curvature vs. wall height and the day's wind load. Too-gentle curves fail (topple animation); too-tight curves waste bricks on a longer path. Par is the analytically-optimal amplitude/wavelength for the given load. Wordle-style: everyone gets the same seeded plot daily, you get a shareable brick-count-vs-par grade, and a global leaderboard ranks by efficiency.

## Technical approach
Stack: vanilla TS + Canvas/SVG, no backend for v1 (date-seeded PRNG generates the daily plot + load). Geometry: centerline as piecewise circular arcs; brick count = arclength/unit. Stability model: approximate the wall as a series of vertical cantilever strips; lateral capacity scales with the effective buttressing from curvature — model as an equivalent second-moment boost proportional to (amplitude²/wavelength). Compare demand (wind pressure × height × tributary width) to capacity per segment; any segment under-capacity = topple. Par computed by a closed-form minimization of arclength subject to the capacity constraint. Hard part: a stability model that's physically defensible yet simple enough to run at 60fps and produce a clean, learnable par.

## v1 scope
- One daily seeded plot: straight baseline + one wind value
- Draw an arc-chain wall, live brick count + pass/fail stability
- Par score + shareable emoji-grid result
- Topple animation on failure

## Out of scope
- Real masonry codes, mortar/foundation modeling
- 3D view, accounts, persistent leaderboard backend
- Multiple materials or wall heights

## Risks & unknowns
- Stability heuristic could be gameable or feel arbitrary; needs playtest tuning against the Blender-tested intuition
- Is 'fewest bricks' a deep enough decision space for daily replay, or one-and-done?

## Done means
A player can load today's seeded plot, draw a wavy wall that passes the stability check using fewer bricks than the straight baseline, see their score vs. par, and copy a shareable result; the same seed yields the identical plot for everyone that day.
