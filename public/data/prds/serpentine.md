## Overview
Serpentine is a browser puzzle game about building crinkle-crankle (serpentine) garden walls: single-brick-thick walls whose S-curves let them stand freely without buttresses. Each level asks you to enclose a garden span using the fewest bricks while keeping the wall standing. For puzzle fans and anyone who read the 'do wavy walls use fewer bricks?' post and wanted to *play* it.

## Problem
The crinkle-crankle fact — that a wavy one-brick wall can be more stable and cheaper than a straight buttressed one — is a delightful, counterintuitive nugget with no interactive form. People read the blog, say 'huh,' and move on. There's no place to build the intuition with your hands.

## How it works
A level presents a garden plot: two fixed endposts a set distance apart, obstacles to route around (a tree, a pond), and a wind load the finished wall must survive. You draw the wall's centerline as a chain of arcs on a grid; the game lays a single course of bricks along it and reports brick count (arc length ÷ brick module) and a stability meter. Draw it straight and it needs far more bricks or a second course to stand; too wavy and it's rock-solid but brick-hungry and eats the garden. Par is the minimum-brick stable solution. A date-seeded daily plot ships with a Wordle-style share string.

## Technical approach
Vanilla TypeScript + Canvas2D. The centerline is a Catmull-Rom spline over user control points; brick count is the arc-length integral divided by a brick module. Stability uses a thin-curved-shell approximation rather than full FEA: lateral second moment of area scales with wave amplitude², so restoring moment ∝ ∫ offset² ds is checked against the wind overturning moment M_w per segment, yielding a safety factor. Daily puzzles are seeded with mulberry32; par is precomputed by gradient descent over a few wave parameters (amplitude, period). The genuinely hard part is a stability model that's physically plausible enough to reward real crinkle-crankle intuition while staying cheap and legible.

## v1 scope
- One wall thickness, single brick module
- 5 hand-authored plots + one daily
- Wind modeled as a single lateral load
- Live brick counter + pass/fail stability meter with safety factor
- Copyable share string

## Out of scope
- 3D view, mortar/foundation modeling
- Multiple materials or courses
- Real finite-element analysis
- Multiplayer or level editor

## Risks & unknowns
- The stability model could feel arbitrary if not tuned against real physics
- Balancing par so serpentine genuinely beats straight on most plots
- Niche appeal beyond the blog's audience

## Done means
On today's plot, a player routes a wall around the pond, the meter reads 'stands — safety 1.4×, 182 bricks (par 176),' and clicking share copies a spoiler-free result string.
