## Overview
Wythe is a tiny browser puzzle game for people who like optimization and got nerd-sniped by the crinkle-crankle wall post. You're a Victorian estate mason given a boundary to enclose and a brick budget to beat. The twist: a single-wythe (one-brick-thick) straight wall falls over, but a serpentine wall standing on the same footprint is self-buttressing and stable at one wythe — so curves literally cost fewer bricks than straight-plus-buttress. The whole game is finding the cheapest stable curve.

## Problem
The blog post proved wavy walls use fewer bricks but it's a static read. There's no way to *play* with the tradeoff — to feel why a lazy S-curve beats a straight run with piers. Optimization puzzle fans (Opus Magnum, factory golf) have nothing that scratches the 'minimize material under a physical constraint' itch in 60 seconds.

## How it works
Each daily level gives you a plot outline with two fixed endpoints (a gate). You draw a wall path by dragging control points of a spline across a hex/grid. A stability check runs: a wall segment is stable if its local curvature amplitude/wavelength ratio clears a threshold (approximating the sinusoidal-wall buttressing rule); straight segments need explicit pier bricks. The game tallies total bricks = arc length in courses + piers, and scores you against a precomputed par. Wordle-style: share your brick count and a mini render of your wall.

## Technical approach
Pure client-side, no backend. Canvas or SVG + a small TS core. Wall path = Catmull-Rom spline sampled to a polyline. Brick count = integrate arc length / brick length across N courses. Stability = for each sampled window, compute curvature; enforce the crinkle-crankle rule (amplitude ≥ k·thickness over a wavelength) — straight runs auto-insert piers every M cells. Par is computed offline by a simulated-annealing solver over spline control points minimizing bricks subject to the stability predicate and endpoint constraints; store the par integer in a date-seeded daily JSON. The genuinely hard part is a stability heuristic that's physically honest enough to feel fair yet cheap enough to run per-drag at 60fps — likely a lookup table of curvature→minimum-stable-amplitude rather than a real FEA solve.

## v1 scope
- One daily level, two fixed endpoints, one plot shape
- Spline draw with 3-5 control points, live brick counter
- Binary stability check with red highlight on unstable segments
- Precomputed par + 3-star thresholds
- Shareable result string

## Out of scope
- Real FEA / mortar / foundation modeling
- Multiple materials, height/wind loads
- Accounts, global leaderboard, level editor

## Risks & unknowns
- The stability heuristic could feel arbitrary; needs playtesting to tune k
- Optimal-par solver might find degenerate zig-zags — may need a smoothness penalty
- Is 'minimize bricks' actually fun for non-engineers, or too niche?

## Done means
A hosted static page where a first-time player draws a stable wall, sees a live brick count, gets flagged when a segment would topple, beats or misses par, and copies a shareable score — all offline, no server call.
